import { Router } from "express";
import { z } from "zod";
import { findAllPharmacies } from "../services/search.js";
import { isOpenNow } from "../services/rank.js";

const router = Router();

// Addis Ababa city centre, used when the device has not shared a location yet.
const listSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).default(9.0192),
  lng: z.coerce.number().min(-180).max(180).default(38.7525),
});

/** Public directory of every verified pharmacy, ordered by proximity. */
router.get("/", async (req, res, next) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const rows = await findAllPharmacies(parsed.data);
    const pharmacies = rows.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      lat: Number(r.lat),
      lng: Number(r.lng),
      openTime: r.openTime,
      closeTime: r.closeTime,
      isOpen: isOpenNow(r.openTime, r.closeTime),
      distanceKm: Math.round((Number(r.distanceM) / 1000) * 100) / 100,
    }));

    res.json({ count: pharmacies.length, pharmacies });
  } catch (err) {
    next(err);
  }
});

export default router;
