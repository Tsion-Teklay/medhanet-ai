import os
import re
import json
import base64
import io
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from PIL import Image

load_dotenv()

# Initialize Gemini API if key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Not the "latest" alias: that tracks the newest model, whose free tier is only 20 requests/day.
GEMINI_MODEL = os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"

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
    prompt: str
    history: Optional[List[ChatMessage]] = []
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None


class VoiceRequest(BaseModel):
    audio_base64: Optional[str] = None
    text: Optional[str] = None
    mime_type: Optional[str] = "audio/aac"


# Emergency Red Flag Guardrails
EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe", "severe dyspnea",
    "shortness of breath", "heavy bleeding", "unconscious", "poison", "poisoning",
    "stroke", "slurred speech", "seizure", "anaphylaxis", "severe burn",
    "አልተነፈስኩም", "የደረት ህመም", "ከባድ ደም መፈሰስ"
]

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
"""


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
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content([img, OCR_PROMPT])
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


@app.post("/chat")
def chat_assistant(req: ChatRequest):
    """
    AI Health Assistant with Ethiopian Emergency Guardrails & Amharic Support.
    """
    is_emergency = check_emergency(req.prompt)

    if is_emergency:
        return {
            "reply": "⚠️ EMERGENCY RED FLAG ALERT: You have mentioned symptoms that may require urgent medical care (such as severe chest pain, breathing difficulty, heavy bleeding, or poisoning). Please do NOT wait. Call emergency services or visit the nearest hospital emergency room immediately!",
            "emergency": True,
            "emergencyContacts": EMERGENCY_CONTACTS,
        }

    reply_text = ""

    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel(
                model_name=GEMINI_MODEL,
                system_instruction=SYSTEM_PROMPT
            )

            history_list = []
            if req.history:
                for h in req.history:
                    role_name = "user" if h.role == "user" else "model"
                    history_list.append({"role": role_name, "parts": [h.content]})

            chat_session = model.start_chat(history=history_list)
            response = chat_session.send_message(req.prompt)
            reply_text = response.text.strip()
        except Exception as e:
            print(f"Gemini chat generation error: {e}")

    if not reply_text:
        # High quality medical fallback response
        reply_text = f"I understand you are asking about: '{req.prompt}'. MedhaNet AI is here to help! For minor symptoms or medication inquiries, please check our nearby verified pharmacies list to reserve your prescriptions. If you feel unwell or experience severe symptoms, please consult a physician at a health center or hospital."

    return {
        "reply": reply_text,
        "emergency": False,
        "emergencyContacts": [],
    }


TRANSCRIPTION_PROMPT = """Transcribe the speech in this audio recording verbatim.
The speaker may use English, Amharic (አማርኛ), or a mix of both.
Return only the transcribed words, with no translation, labels, quotation marks or commentary.
If there is no intelligible speech, return exactly: NO_SPEECH
"""


@app.post("/voice/transcribe")
def voice_transcribe(req: VoiceRequest):
    """
    Transcribes audio input into query text for voice search & chat.
    """
    if req.text:
        return {"query": req.text, "status": "ok"}

    if not req.audio_base64:
        return {"query": "", "status": "error", "error": "No audio or text supplied"}

    if not GEMINI_API_KEY:
        return {"query": "", "status": "error", "error": "Speech recognition needs GEMINI_API_KEY"}

    try:
        audio_bytes = base64.b64decode(req.audio_base64)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content([
            {"mime_type": req.mime_type or "audio/aac", "data": audio_bytes},
            TRANSCRIPTION_PROMPT,
        ])

        query = (response.text or "").strip().strip('"')
        if not query or query == "NO_SPEECH":
            return {"query": "", "status": "empty"}

        return {"query": query, "status": "ok", "transcribedFromAudio": True}
    except Exception as e:
        print(f"Gemini transcription error: {e}")
        return {"query": "", "status": "error", "error": "Transcription failed"}