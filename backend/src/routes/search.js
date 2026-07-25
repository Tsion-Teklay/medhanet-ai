import { Router } from "express";
import { z } from "zod";
import { findNearbyStock } from "../services/search.js";
import { rankResults } from "../services/rank.js";

const router = Router();

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

export default router;
