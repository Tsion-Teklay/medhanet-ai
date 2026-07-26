import os
import re
import json
import base64
import io
import threading
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from PIL import Image

load_dotenv()


def _load_api_keys() -> List[str]:
    """
    Free-tier quota is billed per project, so a second key is a second budget.
    Set GEMINI_API_KEYS="keyA,keyB"; GEMINI_API_KEY stays supported and goes first.
    """
    keys = [k.strip() for k in (os.getenv("GEMINI_API_KEYS") or "").split(",") if k.strip()]
    primary = (os.getenv("GEMINI_API_KEY") or "").strip()
    if primary and primary not in keys:
        keys.insert(0, primary)
    return keys


GEMINI_API_KEYS = _load_api_keys()
GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# genai.configure() mutates process-wide state, so swapping keys mid-flight has to be
# serialised or two concurrent requests could each generate under the other's key.
_GEMINI_LOCK = threading.Lock()

# Not the "latest" alias: that tracks the newest model, whose free tier is only 20 requests/day.
GEMINI_MODEL = os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"

# The free-tier request cap is counted per model per project, so an exhausted model
# does not mean an exhausted key: each sibling still has its own daily budget.
# Ordered best-quality first; the service walks down the list on quota errors.
# Override with GEMINI_MODELS="a,b,c" when a key has access to other models.
_DEFAULT_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

if os.getenv("GEMINI_MODELS"):
    GEMINI_MODELS = [m.strip() for m in os.getenv("GEMINI_MODELS").split(",") if m.strip()]
else:
    GEMINI_MODELS = [GEMINI_MODEL] + [m for m in _DEFAULT_CHAIN if m != GEMINI_MODEL]

_RETRYABLE_MARKERS = (
    # Out of budget on this key/model pair.
    "429",
    "quota",
    "resource_exhausted",
    "exhausted",
    "rate limit",
    # This key cannot use this model.
    "404",
    "not found",
    "is not supported",
    # Transient upstream trouble.
    "503",
    "unavailable",
    "overloaded",
    # A revoked or mistyped key must roll over to the next one, not kill the request.
    "api key not valid",
    "api_key_invalid",
    "unauthenticated",
    "permission_denied",
    "401",
    "403",
)


def _is_retryable(err: Exception) -> bool:
    message = str(err).lower()
    return any(marker in message for marker in _RETRYABLE_MARKERS)


def generate_with_fallback(send):
    """
    Run `send(model_name)` against every model/key pair until one succeeds.

    Quota is capped per key per model, so the best model is tried on every key
    before dropping to a weaker one. Without this, hitting the 20-requests-per-day
    free tier silently degrades every answer to a canned fallback.
    """
    if not GEMINI_API_KEYS:
        raise RuntimeError("No Gemini API key configured")

    last_error = None
    for model_name in GEMINI_MODELS:
        for index, key in enumerate(GEMINI_API_KEYS, start=1):
            try:
                with _GEMINI_LOCK:
                    genai.configure(api_key=key)
                    return send(model_name)
            except Exception as e:
                last_error = e
                if _is_retryable(e):
                    print(
                        f"{model_name} on key #{index} unavailable "
                        f"({e.__class__.__name__}), trying next"
                    )
                    continue
                raise
    if last_error:
        raise last_error
    raise RuntimeError("No Gemini model configured")

app = FastAPI(
    title="MedhaNet AI Services",
    description="OCR, Health Assistant Chat & Voice Intelligence Services for MedhaNet AI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class OCRRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    prompt: Optional[str] = ""
    history: Optional[List[ChatMessage]] = []
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = "image/jpeg"
    # "auto" mirrors the patient's language; "en" / "am" force one.
    language: Optional[str] = "auto"


class TranslateRequest(BaseModel):
    text: str
    target: str = "en"


class VoiceRequest(BaseModel):
    audio_base64: Optional[str] = None
    text: Optional[str] = None
    mime_type: Optional[str] = "audio/aac"
    # "chat" transcribes verbatim; "search" also extracts the medicine being asked for.
    mode: Optional[str] = "chat"


# Emergency Red Flag Guardrails
EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe", "severe dyspnea",
    "shortness of breath", "heavy bleeding", "unconscious", "poison", "poisoning",
    "stroke", "slurred speech", "seizure", "anaphylaxis", "severe burn",
    "አልተነፈስኩም", "የደረት ህመም", "ከባድ ደም መፈሰስ"
]

# Safety-critical text is written out per language rather than translated at runtime,
# so an AI outage can never leave an emergency warning unreadable.
EMERGENCY_REPLY = {
    "en": (
        "⚠️ EMERGENCY RED FLAG ALERT: You have mentioned symptoms that may require urgent medical "
        "care (such as severe chest pain, breathing difficulty, heavy bleeding, or poisoning). "
        "Please do NOT wait. Call emergency services or visit the nearest hospital emergency room immediately!"
    ),
    "am": (
        "⚠️ የአደጋ ጊዜ ማስጠንቀቂያ፦ የገለጹት ምልክቶች አስቸኳይ የሕክምና እርዳታ የሚያስፈልጋቸው ሊሆኑ ይችላሉ "
        "(ለምሳሌ ከባድ የደረት ሕመም፣ የመተንፈስ ችግር፣ ከባድ የደም መፍሰስ ወይም መመረዝ)። "
        "እባክዎ አይጠብቁ። ወዲያውኑ ለአደጋ ጊዜ አገልግሎት ይደውሉ ወይም በአቅራቢያዎ ወደሚገኝ ሆስፒታል ድንገተኛ ክፍል ይሂዱ!"
    ),
}

CHAT_FALLBACK = {
    "en": (
        "I could not reach the medical assistant just now. Please try again in a moment. "
        "You can still search nearby verified pharmacies in MedhaNet, and if your symptoms are "
        "severe please see a doctor or health centre without waiting."
    ),
    "am": (
        "ይቅርታ፣ በአሁኑ ሰዓት መልስ መስጠት አልቻልኩም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ። "
        "አሁንም በመድሃኔት አፕሊኬሽን በአቅራቢያዎ የሚገኙ የተረጋገጡ ፋርማሲዎችን መፈለግ ይችላሉ። "
        "ምልክቶችዎ የከፉ ከሆነ ግን ሳይዘገዩ ሐኪም ያማክሩ።"
    ),
}

IMAGE_FALLBACK = {
    "en": "I could not analyse that photo just now. Please describe what you are seeing and I will help.",
    "am": "ይቅርታ፣ በአሁኑ ሰዓት ፎቶውን መመልከት አልቻልኩም። እባክዎ የሚያዩትን ይግለጹልኝ፤ እረዳዎታለሁ።",
}

EMERGENCY_CONTACTS = [
    {"name": "Ethiopian Emergency Medical Line", "phone": "907"},
    {"name": "National Emergency Response Service", "phone": "911"},
    {"name": "Ethiopian Red Cross Emergency Ambulance", "phone": "922"},
    {"name": "Tikur Anbessa Hospital Emergency", "phone": "011 551 1211"},
]

SYSTEM_PROMPT = """You are MedhaNet AI (መድሃኔት AI), an intelligent healthcare digital assistant in Ethiopia.
Your primary role is to assist patients and healthcare seekers in finding medicine, understanding prescription instructions, and offering general health guidance in both English and Amharic (አማርኛ).

Rules:
1. Always maintain an empathetic, professional, and reassuring tone.
2. Clearly state that you are an AI assistant and NOT a replacement for a licensed medical doctor or healthcare provider.
3. Keep responses concise, structured, and easy to read on mobile screens.
4. Encourage patients to reserve medicines at nearby verified pharmacies through the MedhaNet app.
5. If the patient asks about symptoms, explain potential general causes while advising them to seek professional medical evaluation.
6. Answer in the same language the patient wrote in. If they write in Amharic, reply entirely
   in Amharic with exactly the same clinical depth, structure and length you would give in English.
   An Amharic answer must never be shorter, vaguer or lower quality than an English one.
7. Write Amharic in fluent, natural አማርኛ, not a word-for-word translation of English phrasing.
   Keep medicine names, dosages and numbers in Latin script so patients can search for them,
   and give the Amharic term alongside a medical term the first time you use it.
8. Do not switch language mid-answer, and never repeat the whole answer twice in two languages.
9. Format for a narrow phone screen: short paragraphs and simple "- " bullets.
   Use at most one level of heading, and never nest bullet lists.
"""

LANGUAGE_DIRECTIVE = {
    "am": "Write your entire reply in Amharic (አማርኛ), regardless of the language of the question.",
    "en": "Write your entire reply in English, regardless of the language of the question.",
}


def is_amharic(text: str) -> bool:
    """True when the text is predominantly Ethiopic script."""
    letters = [c for c in (text or "") if c.isalpha()]
    if not letters:
        return False
    ethiopic = sum(1 for c in letters if "\u1200" <= c <= "\u137f")
    return ethiopic / len(letters) > 0.3


def resolve_language(requested: Optional[str], prompt: str) -> str:
    """Explicit choice wins; otherwise mirror whatever the patient typed."""
    if requested in ("am", "en"):
        return requested
    return "am" if is_amharic(prompt) else "en"


def check_emergency(prompt: str) -> bool:
    lowered = prompt.lower()
    return any(keyword in lowered for keyword in EMERGENCY_KEYWORDS)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "medhanet-ai",
        "gemini_key_loaded": bool(GEMINI_API_KEY),
        "groq_key_loaded": bool(os.getenv("GROQ_API_KEY")),
        "models": GEMINI_MODELS,
        # Count only: never echo the keys themselves over HTTP.
        "gemini_key_count": len(GEMINI_API_KEYS),
    }


OCR_PROMPT = """You are reading a photograph of a medical prescription from Ethiopia.
It may be handwritten or printed, in English, Amharic (አማርኛ), or a mix of both.

Return ONLY raw JSON, with no markdown fences, in exactly this shape:
{
  "isPrescription": true,
  "language": "English | Amharic | Mixed | Unknown",
  "rawText": "Every legible line transcribed verbatim, keeping line breaks as \\n. Write [illegible] where you cannot read a word.",
  "englishText": "The same content rendered in plain English. If the original is already English, repeat it tidied up.",
  "readableSummary": "2-4 short sentences a patient can understand: what was prescribed and how to take it.",
  "medicines": [
    {
      "name": "Brand or trade name as written",
      "genericName": "Generic chemical name",
      "strength": "e.g. 500mg",
      "dosage": "e.g. 1 tablet twice daily after meals",
      "duration": "e.g. 7 days",
      "legible": "clear | partially_legible | guessed"
    }
  ],
  "prescriber": "Doctor or clinic name if visible, otherwise an empty string",
  "patientNotes": "Any other instructions written by the doctor",
  "confidence": "High | Medium | Low",
  "needsPharmacistReview": false,
  "reviewReason": "Short reason a human pharmacist should check this, or an empty string"
}

Rules:
- If the image is not a medical prescription at all, set "isPrescription" to false, "confidence" to "Low",
  "needsPharmacistReview" to true, leave "medicines" empty, and say what the image actually shows in "reviewReason".
- Never invent a medicine you cannot actually see. If the handwriting is unreadable, mark that item "guessed".
- Set "needsPharmacistReview" to true whenever confidence is Low, any item is guessed, or a dosage is missing.
- Return valid JSON only.
"""


def _strip_json_fence(text: str) -> str:
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text).strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    return text


def _needs_review_result(reason: str) -> Dict[str, Any]:
    """Degraded result that still lets the patient hand the photo to a pharmacist."""
    return {
        "isPrescription": None,
        "language": "Unknown",
        "rawText": "",
        "englishText": "",
        "readableSummary": "",
        "medicines": [],
        "prescriber": "",
        "patientNotes": "",
        "confidence": "Low",
        "needsPharmacistReview": True,
        "reviewReason": reason,
        "ocrFailed": True,
    }


@app.post("/ocr/prescription")
def scan_prescription(req: OCRRequest):
    """
    Multimodal Gemini OCR scanning of prescription images.
    Transcribes the prescription and flags anything a pharmacist should double-check.
    """
    if not GEMINI_API_KEY:
        return _needs_review_result("Automatic reading is unavailable, so a pharmacist should read this photo.")

    try:
        image_data = base64.b64decode(req.image_base64)
        img = Image.open(io.BytesIO(image_data))
    except Exception as e:
        print(f"Prescription image decode error: {e}")
        raise HTTPException(status_code=400, detail="That file could not be read as an image")

    try:
        response = generate_with_fallback(
            lambda name: genai.GenerativeModel(name).generate_content([img, OCR_PROMPT])
        )
        parsed = json.loads(_strip_json_fence(response.text))
    except Exception as e:
        print(f"Gemini OCR error: {e}")
        return _needs_review_result("The prescription could not be read automatically.")

    parsed.setdefault("isPrescription", True)
    parsed.setdefault("medicines", [])
    parsed.setdefault("confidence", "Low")
    parsed.setdefault("rawText", "")
    parsed.setdefault("reviewReason", "")

    # An unreadable or non-prescription image must never come back looking confident.
    if (
        parsed["isPrescription"] is False
        or not parsed["medicines"]
        or str(parsed["confidence"]).lower() == "low"
        or any(m.get("legible") == "guessed" for m in parsed["medicines"])
    ):
        parsed["needsPharmacistReview"] = True

    return parsed


MEDICINE_PHOTO_PROMPT = """You are looking at a photograph taken by a patient in Ethiopia who wants
to find this product in a pharmacy. It is usually a medicine box, blister strip, bottle or label.

Return ONLY raw JSON, with no markdown fences, in exactly this shape:
{
  "isMedicine": true,
  "name": "Brand or trade name printed on the pack",
  "genericName": "Generic chemical name",
  "strength": "e.g. 500mg",
  "form": "tablet | capsule | syrup | injection | cream | drops | other",
  "manufacturer": "If printed, otherwise an empty string",
  "searchTerm": "The single best word to look this up in a pharmacy catalogue",
  "confidence": "High | Medium | Low",
  "notes": "One short sentence a patient can understand about what this medicine is for"
}

Rules:
- "searchTerm" must be ONE word: the brand name if legible, otherwise the generic name.
  Never put a strength, dosage form or manufacturer in it.
- If the photo is not a medicine, set "isMedicine" to false, "searchTerm" to an empty string,
  "confidence" to "Low", and say what the image actually shows in "notes".
- Never invent a name you cannot read on the packaging.
- Return valid JSON only.
"""


@app.post("/ocr/medicine")
def identify_medicine(req: OCRRequest):
    """Identify a medicine from a photo of its packaging so it can be searched for."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Image recognition needs GEMINI_API_KEY")

    try:
        img = Image.open(io.BytesIO(base64.b64decode(req.image_base64)))
    except Exception as e:
        print(f"Medicine image decode error: {e}")
        raise HTTPException(status_code=400, detail="That file could not be read as an image")

    try:
        response = generate_with_fallback(
            lambda name: genai.GenerativeModel(name).generate_content([img, MEDICINE_PHOTO_PROMPT])
        )
        parsed = json.loads(_strip_json_fence(response.text))
    except Exception as e:
        print(f"Gemini medicine identification error: {e}")
        raise HTTPException(status_code=502, detail="The photo could not be identified")

    parsed.setdefault("isMedicine", False)
    parsed.setdefault("searchTerm", "")
    parsed.setdefault("confidence", "Low")
    parsed.setdefault("notes", "")

    # A non-medicine photo must never come back with something to search for.
    if not parsed["isMedicine"]:
        parsed["searchTerm"] = ""

    return parsed


IMAGE_CHAT_HINT = """The patient has attached a photograph. Describe what you can actually see in it
and give safe, practical guidance. If it shows medicine packaging, name the medicine and explain what
it is normally used for. If it shows a visible symptom, describe it in plain language and say when a
clinician should be seen. Never diagnose with certainty from a photo, and say so plainly.
"""


@app.post("/chat")
def chat_assistant(req: ChatRequest):
    """
    AI Health Assistant with Ethiopian Emergency Guardrails & Amharic Support.
    Accepts an optional photograph alongside the question.
    """
    prompt = (req.prompt or "").strip()
    language = resolve_language(req.language, prompt)
    is_emergency = check_emergency(prompt)

    if is_emergency:
        return {
            "reply": EMERGENCY_REPLY[language],
            "emergency": True,
            "emergencyContacts": EMERGENCY_CONTACTS,
            "language": language,
        }

    image = None
    if req.image_base64:
        try:
            image = Image.open(io.BytesIO(base64.b64decode(req.image_base64)))
        except Exception as e:
            print(f"Chat image decode error: {e}")
            return {
                "reply": "I could not open that photo. Please try taking it again in good light.",
                "emergency": False,
                "emergencyContacts": [],
            }

    if not prompt and image is None:
        raise HTTPException(status_code=400, detail="Send a message or a photo")

    reply_text = ""

    if GEMINI_API_KEY:
        try:
            history_list = []
            if req.history:
                for h in req.history:
                    role_name = "user" if h.role == "user" else "model"
                    history_list.append({"role": role_name, "parts": [h.content]})

            if image is not None:
                parts = [image, IMAGE_CHAT_HINT]
                parts.append(prompt if prompt else "What can you tell me about this photo?")
            else:
                parts = [prompt]

            def send(model_name):
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=f"{SYSTEM_PROMPT}\n{LANGUAGE_DIRECTIVE[language]}",
                )
                return model.start_chat(history=history_list).send_message(parts)

            response = generate_with_fallback(send)
            reply_text = response.text.strip()
        except Exception as e:
            print(f"Gemini chat generation error: {e}")

    if not reply_text:
        reply_text = IMAGE_FALLBACK[language] if image is not None else CHAT_FALLBACK[language]

    return {
        "reply": reply_text,
        "emergency": False,
        "emergencyContacts": [],
        "language": language,
    }


TRANSCRIPTION_PROMPT = """Transcribe the speech in this audio recording verbatim.
The speaker may use English, Amharic (አማርኛ), or a mix of both.
Return only the transcribed words, with no translation, labels, quotation marks or commentary.
If there is no intelligible speech, return exactly: NO_SPEECH
"""


TRANSLATE_PROMPT = """Translate the message below into {language}.

Rules:
- Preserve the meaning, tone and line breaks exactly.
- Keep medicine names, dosages, numbers and phone numbers unchanged.
- Keep any bullet markers and bold markers in place.
- Produce natural, fluent {language}, not a word-for-word rendering.
- Return only the translation, with no preamble, notes or quotation marks.

Message:
{text}
"""


@app.post("/translate")
def translate(req: TranslateRequest):
    """Translate an assistant reply between Amharic and English."""
    target = req.target if req.target in ("am", "en") else "en"
    text = (req.text or "").strip()

    if not text:
        raise HTTPException(status_code=400, detail="Nothing to translate")

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Translation needs GEMINI_API_KEY")

    language = "Amharic (አማርኛ)" if target == "am" else "English"

    try:
        response = generate_with_fallback(
            lambda name: genai.GenerativeModel(name).generate_content(
                TRANSLATE_PROMPT.format(language=language, text=text)
            )
        )
        translated = (response.text or "").strip()
    except Exception as e:
        print(f"Gemini translation error: {e}")
        raise HTTPException(status_code=502, detail="Translation failed")

    if not translated:
        raise HTTPException(status_code=502, detail="Translation failed")

    return {"text": translated, "target": target}


SEARCH_TRANSCRIPTION_PROMPT = """The speaker is looking for a medicine in an Ethiopian pharmacy.
They may speak English, Amharic (አማርኛ), or a mix of both.

Return ONLY raw JSON, with no markdown fences, in exactly this shape:
{"transcript": "the spoken words verbatim", "searchTerm": "the medicine name only"}

Rules for "searchTerm":
- One or two words: the brand or generic medicine name, nothing else.
- Strip greetings, dosages, quantities and phrases like "I need" or "do you have".
- Write it in Latin script even when the speaker used Amharic, because the pharmacy
  catalogue is stored in Latin script.
- If no medicine was named, or there is no intelligible speech, use an empty string.
"""


@app.post("/voice/transcribe")
def voice_transcribe(req: VoiceRequest):
    """
    Transcribes audio input into query text for voice search & chat.
    In "search" mode it also reduces the sentence to a catalogue-searchable medicine name.
    """
    is_search = (req.mode or "chat") == "search"

    if req.text:
        return {"query": req.text, "transcript": req.text, "status": "ok"}

    if not req.audio_base64:
        return {"query": "", "status": "error", "error": "No audio or text supplied"}

    if not GEMINI_API_KEY:
        return {"query": "", "status": "error", "error": "Speech recognition needs GEMINI_API_KEY"}

    try:
        audio_bytes = base64.b64decode(req.audio_base64)
        audio_parts = [
            {"mime_type": req.mime_type or "audio/aac", "data": audio_bytes},
            SEARCH_TRANSCRIPTION_PROMPT if is_search else TRANSCRIPTION_PROMPT,
        ]
        response = generate_with_fallback(
            lambda name: genai.GenerativeModel(name).generate_content(audio_parts)
        )

        raw = (response.text or "").strip().strip('"')

        if is_search:
            try:
                parsed = json.loads(_strip_json_fence(raw))
            except Exception:
                # Fall back to the spoken words: a bad search beats no search.
                parsed = {"transcript": raw, "searchTerm": raw}

            transcript = (parsed.get("transcript") or "").strip()
            term = (parsed.get("searchTerm") or "").strip()
            if not term and not transcript:
                return {"query": "", "transcript": "", "status": "empty"}

            return {
                "query": term,
                "transcript": transcript,
                "status": "ok" if term else "no_medicine",
                "transcribedFromAudio": True,
            }

        if not raw or raw == "NO_SPEECH":
            return {"query": "", "status": "empty"}

        return {"query": raw, "transcript": raw, "status": "ok", "transcribedFromAudio": True}
    except Exception as e:
        print(f"Gemini transcription error: {e}")
        return {"query": "", "status": "error", "error": "Transcription failed"}