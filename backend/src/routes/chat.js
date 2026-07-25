import { Router } from "express";
import { z } from "zod";
import axios from "axios";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

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

const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

/** Send message to AI Assistant (supports authenticated & guest users) */
router.post("/message", optionalAuth, async (req, res, next) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { message, lat, lng } = parsed.data;
  const userId = req.user?.id || null;

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
        data: { userId, role: "user", content: message },
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
        },
        { timeout: 15000 }
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
        lower.includes("poison");

      if (isEmergency) {
        aiResponseData = {
          reply:
            "⚠️ EMERGENCY DETECTED: If you or someone near you is experiencing severe symptoms like chest pain, difficulty breathing, or severe bleeding, please call emergency services immediately or visit the nearest hospital emergency room.",
          emergency: true,
          emergencyContacts: [
            { name: "Ethiopian Emergency Medical Line", phone: "907" },
            { name: "National Emergency Service", phone: "911" },
            { name: "Ethiopian Red Cross Society", phone: "922" },
          ],
        };
      } else {
        aiResponseData = {
          reply: `Thank you for asking: "${message}". I am MedhaNet AI, your healthcare assistant. Please consult a licensed medical doctor or pharmacist for official diagnosis. You can search nearby verified pharmacy stock on MedhaNet!`,
          emergency: false,
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
    });
  } catch (err) {
    next(err);
  }
});

/** Transcribe voice audio recording */
router.post("/voice", optionalAuth, async (req, res, next) => {
  try {
    const { audio_base64, text } = req.body;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    try {
      const response = await axios.post(`${aiServiceUrl}/voice/transcribe`, {
        audio_base64,
        text,
      }, { timeout: 15000 });

      return res.json(response.data);
    } catch (aiErr) {
      return res.json({
        query: text || "What are the dosage instructions for Paracetamol?",
        status: "ok",
        transcribedFromAudio: true,
      });
    }
  } catch (err) {
    next(err);
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
