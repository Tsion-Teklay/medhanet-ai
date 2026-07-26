import { Router } from "express";
import { z } from "zod";
import axios from "axios";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

const aiServiceUrl = () => process.env.AI_SERVICE_URL || "http://localhost:8000";

/** Predominantly Ethiopic script means the patient is writing Amharic. */
function isAmharic(text) {
  const letters = (text || "").match(/\p{L}/gu) || [];
  if (letters.length === 0) return false;
  const ethiopic = letters.filter((c) => /[\u1200-\u137F]/.test(c)).length;
  return ethiopic / letters.length > 0.3;
}

// Used only when the AI service itself is unreachable, so these must never be
// English-only: an Amharic speaker would get an unreadable answer.
const OFFLINE_REPLY = {
  en: "I could not reach the medical assistant just now. Please try again in a moment. You can still search nearby verified pharmacies in MedhaNet, and if your symptoms are severe please see a doctor without waiting.",
  am: "ይቅርታ፣ በአሁኑ ሰዓት መልስ መስጠት አልቻልኩም። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ። አሁንም በመድሃኔት አፕሊኬሽን በአቅራቢያዎ የሚገኙ የተረጋገጡ ፋርማሲዎችን መፈለግ ይችላሉ። ምልክቶችዎ የከፉ ከሆነ ግን ሳይዘገዩ ሐኪም ያማክሩ።",
};

const OFFLINE_IMAGE_REPLY = {
  en: "I could not analyse that photo just now because the AI service is unreachable. Please describe what you are seeing and I will help.",
  am: "ይቅርታ፣ በአሁኑ ሰዓት ፎቶውን መመልከት አልቻልኩም። እባክዎ የሚያዩትን ይግለጹልኝ፤ እረዳዎታለሁ።",
};

const OFFLINE_EMERGENCY_REPLY = {
  en: "⚠️ EMERGENCY DETECTED: If you or someone near you is experiencing severe symptoms like chest pain, difficulty breathing, or severe bleeding, please call emergency services immediately or visit the nearest hospital emergency room.",
  am: "⚠️ የአደጋ ጊዜ ማስጠንቀቂያ፦ እርስዎ ወይም በአቅራቢያዎ ያለ ሰው እንደ የደረት ሕመም፣ የመተንፈስ ችግር ወይም ከባድ የደም መፍሰስ ያሉ ከባድ ምልክቶች ካሉ፣ እባክዎ ወዲያውኑ ለአደጋ ጊዜ አገልግሎት ይደውሉ ወይም በአቅራቢያዎ ወደሚገኝ ሆስፒታል ድንገተኛ ክፍል ይሂዱ።",
};

// Middleware to extract optional user from Bearer token
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_dev_key");
      req.user = decoded;
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

const chatSchema = z
  .object({
    message: z.string().default(""),
    lat: z.number().optional(),
    lng: z.number().optional(),
    image_base64: z.string().optional(),
    image_mime_type: z.string().optional(),
    language: z.enum(["auto", "en", "am"]).default("auto"),
  })
  // A photo on its own is a valid question, so only reject when both are missing.
  .refine((d) => d.message.trim().length > 0 || Boolean(d.image_base64), {
    message: "Send a message or a photo",
  });

/** Send message to AI Assistant (supports authenticated & guest users) */
router.post("/message", optionalAuth, async (req, res, next) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { message, lat, lng, image_base64, image_mime_type, language } = parsed.data;
  const userId = req.user?.id || null;
  // Chat history is text-only, so a photo-only turn still needs something readable.
  const storedMessage = message.trim() || "[Sent a photo]";

  try {
    let formattedHistory = [];

    // Retrieve previous chat history if user is logged in
    if (userId) {
      const history = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      formattedHistory = history.reverse().map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Save user message to database
      await prisma.chatMessage.create({
        data: { userId, role: "user", content: storedMessage },
      });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    let aiResponseData = null;

    try {
      const response = await axios.post(
        `${aiServiceUrl}/chat`,
        {
          prompt: message,
          history: formattedHistory,
          user_lat: lat,
          user_lng: lng,
          image_base64,
          image_mime_type,
          language,
        },
        // Reading a photo takes Gemini considerably longer than answering text.
        { timeout: image_base64 ? 60000 : 15000 }
      );

      aiResponseData = response.data;
    } catch (aiErr) {
      console.warn("AI Service error, falling back to local assistant responder:", aiErr.message);

      const lower = message.toLowerCase();
      const isEmergency =
        lower.includes("chest pain") ||
        lower.includes("heart attack") ||
        lower.includes("can't breathe") ||
        lower.includes("cannot breathe") ||
        lower.includes("heavy bleeding") ||
        lower.includes("poison") ||
        message.includes("የደረት ህመም") ||
        message.includes("ከባድ ደም መፈሰስ");

      const lang = language === "auto" ? (isAmharic(message) ? "am" : "en") : language;

      if (isEmergency) {
        aiResponseData = {
          reply: OFFLINE_EMERGENCY_REPLY[lang],
          emergency: true,
          emergencyContacts: [
            { name: "Ethiopian Emergency Medical Line", phone: "907" },
            { name: "National Emergency Service", phone: "911" },
            { name: "Ethiopian Red Cross Society", phone: "922" },
          ],
        };
      } else {
        aiResponseData = {
          reply: image_base64 ? OFFLINE_IMAGE_REPLY[lang] : OFFLINE_REPLY[lang],
          emergency: false,
          language: lang,
        };
      }
    }

    // Save assistant message to database if user is logged in
    if (userId && aiResponseData) {
      await prisma.chatMessage.create({
        data: {
          userId,
          role: "assistant",
          content: aiResponseData.reply || aiResponseData.response,
        },
      });
    }

    res.json({
      reply: aiResponseData.reply || aiResponseData.response,
      emergency: aiResponseData.emergency || false,
      emergencyContacts: aiResponseData.emergencyContacts || [],
      groundedStock: aiResponseData.groundedStock || [],
      language: aiResponseData.language || language,
    });
  } catch (err) {
    next(err);
  }
});

/** Transcribe voice audio recording */
router.post("/voice", optionalAuth, async (req, res, next) => {
  try {
    const { audio_base64, text, mime_type } = req.body;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    try {
      const response = await axios.post(`${aiServiceUrl}/voice/transcribe`, {
        audio_base64,
        text,
        mime_type,
      }, { timeout: 45000 });

      return res.json(response.data);
    } catch (aiErr) {
      console.warn("AI Service transcription error:", aiErr.message);
      return res.status(503).json({
        query: "",
        status: "error",
        error: "Speech service unavailable",
      });
    }
  } catch (err) {
    next(err);
  }
});

const translateSchema = z.object({
  text: z.string().min(1, "Nothing to translate"),
  target: z.enum(["en", "am"]),
});

/** Translate any assistant reply between Amharic and English. */
router.post("/translate", optionalAuth, async (req, res, next) => {
  const parsed = translateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const response = await axios.post(`${aiServiceUrl()}/translate`, parsed.data, {
      timeout: 45000,
    });
    return res.json(response.data);
  } catch (aiErr) {
    console.warn("Translation failed:", aiErr.message);
    return res.status(503).json({ error: "Translation service unavailable" });
  }
});

/** Fetch chat history for logged in user */
router.get("/history", optionalAuth, async (req, res) => {
  if (!req.user?.id) {
    return res.json([]);
  }

  const history = await prisma.chatMessage.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  res.json(history);
});

export default router;
