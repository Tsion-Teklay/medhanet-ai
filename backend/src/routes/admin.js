import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

const listSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  q: z.string().optional(),
});

router.get("/pharmacies", async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { status, q } = parsed.data;
  const pharmacies = await prisma.pharmacy.findMany({
    where: {
      ...(status && { status }),
      ...(q && { OR: [{ name: { contains: q } }, { licenseNo: { contains: q } }] }),
    },
    include: {
      owner: { select: { id: true, name: true, phone: true } },
      _count: { select: { inventory: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  res.json(
    pharmacies.map(({ _count, ...p }) => ({ ...p, inventoryCount: _count.inventory }))
  );
});

router.get("/pharmacies/:id", async (req, res) => {
  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: req.params.id },
    include: { owner: { select: { id: true, name: true, phone: true } } },
  });
  if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
  res.json(pharmacy);
});

const decisionSchema = z
  .object({
    status: z.enum(["VERIFIED", "REJECTED", "PENDING"]),
    rejectionReason: z.string().min(4).optional(),
  })
  .refine((d) => d.status !== "REJECTED" || !!d.rejectionReason, {
    message: "A rejection reason is required when rejecting a pharmacy",
  });

router.patch("/pharmacies/:id/status", async (req, res) => {
  const parsed = decisionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const existing = await prisma.pharmacy.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Pharmacy not found" });

  const pharmacy = await prisma.pharmacy.update({
    where: { id: req.params.id },
    data: {
      status: parsed.data.status,
      rejectionReason: parsed.data.status === "REJECTED" ? parsed.data.rejectionReason : null,
      reviewedAt: new Date(),
    },
  });
  res.json(pharmacy);
});

router.get("/stats", async (req, res) => {
  const [byStatus, users, medicines, inventory, reservations] = await Promise.all([
    prisma.pharmacy.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.medicine.count(),
    prisma.inventory.count(),
    prisma.reservation.count(),
  ]);

  const count = (rows, key, value) =>
    rows.find((r) => r[key] === value)?._count._all ?? 0;

  res.json({
    pharmacies: {
      total: byStatus.reduce((sum, r) => sum + r._count._all, 0),
      pending: count(byStatus, "status", "PENDING"),
      verified: count(byStatus, "status", "VERIFIED"),
      rejected: count(byStatus, "status", "REJECTED"),
    },
    users: {
      total: users.reduce((sum, r) => sum + r._count._all, 0),
      patients: count(users, "role", "PATIENT"),
      pharmacies: count(users, "role", "PHARMACY"),
      admins: count(users, "role", "ADMIN"),
    },
    medicines,
    inventoryItems: inventory,
    reservations,
  });
});

export default router;
