import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res, next) => {
  const q = (req.query.q || "").toString().trim();
  try {
    const medicines = await prisma.medicine.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { genericName: { contains: q } },
              { category: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      take: 50,
    });
    res.json(medicines);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });
    res.json(medicine);
  } catch (err) {
    next(err);
  }
});

export default router;
