import { Router } from "express";
import { z } from "zod";
import axios from "axios";
import { findNearbyStock } from "../services/search.js";
import { rankResults } from "../services/rank.js";

const router = Router();

const aiServiceUrl = () => process.env.AI_SERVICE_URL || "http://localhost:8000";

const searchSchema = z.object({
  q: z.string().min(2, "Search for at least 2 characters"),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(50).default(10),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get("/", async (req, res, next) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const results = rankResults(await findNearbyStock(parsed.data));
    res.json({ query: parsed.data.q, count: results.length, results });
  } catch (err) {
    next(err);
  }
});

/** Location context shared by the voice and photo search entry points. */
const assistedSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).default(9.0192),
  lng: z.coerce.number().min(-180).max(180).default(38.7525),
  radiusKm: z.coerce.number().min(1).max(50).default(25),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const runSearch = async (q, where) =>
  q.trim().length >= 2 ? rankResults(await findNearbyStock({ ...where, q: q.trim() })) : [];

/** Speak a request, get nearby stock back. Audio never touches the database. */
router.post("/voice", async (req, res, next) => {
  const parsed = assistedSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { audio_base64, mime_type } = req.body;
  if (!audio_base64) return res.status(400).json({ error: "No audio supplied" });

  let voice;
  try {
    const ai = await axios.post(
      `${aiServiceUrl()}/voice/transcribe`,
      { audio_base64, mime_type, mode: "search" },
      { timeout: 45000 }
    );
    voice = ai.data;
  } catch (aiErr) {
    console.warn("Voice search transcription failed:", aiErr.message);
    return res.status(503).json({ error: "Speech service unavailable" });
  }

  try {
    const query = (voice.query || "").trim();
    const results = await runSearch(query, parsed.data);
    res.json({
      transcript: voice.transcript || "",
      query,
      count: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
});

/** Photograph a pack, get the same pack from nearby pharmacies. */
router.post("/identify", async (req, res, next) => {
  const parsed = assistedSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { image_base64, mime_type } = req.body;
  if (!image_base64) return res.status(400).json({ error: "No image supplied" });

  let identified;
  try {
    const ai = await axios.post(
      `${aiServiceUrl()}/ocr/medicine`,
      { image_base64, mime_type },
      { timeout: 60000 }
    );
    identified = ai.data;
  } catch (aiErr) {
    console.warn("Medicine identification failed:", aiErr.message);
    return res.status(503).json({ error: "Image recognition unavailable" });
  }

  try {
    let query = (identified.searchTerm || "").trim();
    let results = await runSearch(query, parsed.data);

    // The brand on the box is often not what local pharmacies stock it under.
    const generic = (identified.genericName || "").trim();
    if (results.length === 0 && generic && generic.toLowerCase() !== query.toLowerCase()) {
      const genericResults = await runSearch(generic, parsed.data);
      if (genericResults.length > 0) {
        query = generic;
        results = genericResults;
      }
    }

    res.json({ identified, query, count: results.length, results });
  } catch (err) {
    next(err);
  }
});

export default router;
