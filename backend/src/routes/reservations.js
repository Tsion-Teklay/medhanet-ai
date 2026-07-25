import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadOwnPharmacy } from "../middleware/pharmacy.js";

const router = Router();

const createSchema = z.object({
  inventoryId: z.string().min(1, "Inventory ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
});

/** Create reservation (PATIENT) */
router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { inventoryId, quantity } = parsed.data;

  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    include: { pharmacy: true, medicine: true },
  });

  if (!inventory) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  if (inventory.quantity < quantity) {
    return res.status(400).json({ error: `Only ${inventory.quantity} unit(s) available in stock` });
  }

  // Generate 4-digit pickup OTP
  const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
  // Expiration: 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Transaction: decrement inventory stock & create reservation record
  const [updatedInventory, reservation] = await prisma.$transaction([
    prisma.inventory.update({
      where: { id: inventoryId },
      data: { quantity: inventory.quantity - quantity },
    }),
    prisma.reservation.create({
      data: {
        userId: req.user.id,
        inventoryId,
        quantity,
        pickupCode,
        status: "Ready for Pickup",
        expiresAt,
      },
      include: {
        inventory: {
          include: {
            pharmacy: true,
            medicine: true,
          },
        },
      },
    }),
  ]);

  res.status(201).json(reservation);
});

/** Get current patient's reservations */
router.get("/me", requireAuth, async (req, res) => {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user.id },
    include: {
      inventory: {
        include: {
          pharmacy: true,
          medicine: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(reservations);
});

/** Patient or Pharmacy cancels a reservation */
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { inventory: true },
  });

  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  if (reservation.status === "CANCELLED" || reservation.status === "COMPLETED") {
    return res.status(400).json({ error: `Reservation is already ${reservation.status.toLowerCase()}` });
  }

  // Restore inventory quantity & mark cancelled
  const [_, updated] = await prisma.$transaction([
    prisma.inventory.update({
      where: { id: reservation.inventoryId },
      data: { quantity: { increment: reservation.quantity } },
    }),
    prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
      include: {
        inventory: {
          include: {
            pharmacy: true,
            medicine: true,
          },
        },
      },
    }),
  ]);

  res.json(updated);
});

/** Pharmacy GET incoming reservations */
router.get("/pharmacy", requireAuth, requireRole("PHARMACY"), loadOwnPharmacy, async (req, res) => {
  const reservations = await prisma.reservation.findMany({
    where: {
      inventory: {
        pharmacyId: req.pharmacy.id,
      },
    },
    include: {
      user: {
        select: { id: true, name: true, phone: true },
      },
      inventory: {
        include: {
          medicine: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to format matching frontend schema
  const mapped = reservations.map((r) => ({
    id: r.id,
    patientName: r.user.name,
    patientId: r.user.phone,
    medicineName: r.inventory.medicine.name,
    medicineId: r.inventory.medicine.id,
    quantity: r.quantity,
    pickupCode: r.pickupCode,
    scheduledTime: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pickupDeadlineMinutes: Math.max(0, Math.floor((new Date(r.expiresAt).getTime() - Date.now()) / 60000)),
    status: r.status,
    amountETB: r.inventory.price * r.quantity,
    createdAt: r.createdAt,
  }));

  res.json(mapped);
});

/** Pharmacy Fulfill reservation using OTP code */
router.patch("/pharmacy/:id/fulfill", requireAuth, requireRole("PHARMACY"), loadOwnPharmacy, async (req, res) => {
  const { pickupCode } = req.body;

  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: {
      inventory: true,
    },
  });

  if (!reservation || reservation.inventory.pharmacyId !== req.pharmacy.id) {
    return res.status(404).json({ error: "Reservation not found for this pharmacy" });
  }

  if (pickupCode && reservation.pickupCode !== pickupCode) {
    return res.status(400).json({ error: "Invalid pickup OTP code" });
  }

  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "COMPLETED" },
  });

  res.json({ success: true, reservation: updated });
});

export default router;
