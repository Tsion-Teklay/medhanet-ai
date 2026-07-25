import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loadOwnPharmacy } from "../middleware/pharmacy.js";
import { toInventoryItem, stockStatus } from "../services/inventory.js";

const router = Router();

router.use(requireAuth, requireRole("PHARMACY"));

const profileSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(4),
  phone: z.string().min(9),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  licenseNo: z.string().optional(),
  licenseUrl: z.string().optional(),
  tinNumber: z.string().optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

/** Onboarding: a PHARMACY user creates their (initially PENDING) pharmacy. */
router.post("/", async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const existing = await prisma.pharmacy.findUnique({ where: { ownerId: req.user.id } });
  if (existing) return res.status(409).json({ error: "Pharmacy profile already exists" });

  const pharmacy = await prisma.pharmacy.create({
    data: { ...parsed.data, ownerId: req.user.id },
  });
  res.status(201).json(pharmacy);
});

router.get("/me", loadOwnPharmacy, (req, res) => res.json(req.pharmacy));

const updateSchema = profileSchema.partial().extend({ isOpen: z.boolean().optional() });

router.patch("/me", loadOwnPharmacy, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const pharmacy = await prisma.pharmacy.update({
    where: { id: req.pharmacy.id },
    data: parsed.data,
  });
  res.json(pharmacy);
});

router.get("/inventory", loadOwnPharmacy, async (req, res) => {
  const rows = await prisma.inventory.findMany({
    where: { pharmacyId: req.pharmacy.id },
    include: { medicine: true },
    orderBy: { medicine: { name: "asc" } },
  });
  res.json(rows.map(toInventoryItem));
});

const itemSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().optional(),
  category: z.string().min(2),
  dosage: z.string().min(1),
  dosageForm: z.string().optional(),
  manufacturer: z.string().optional(),
  prescriptionRequired: z.boolean().optional(),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0).optional(),
  unitPriceETB: z.number().min(0),
  batchNo: z.string().optional(),
  expiryDate: z.string().min(4),
});

/** Reuse a catalogue medicine when one matches, so patient search sees every pharmacy's stock as one drug. */
async function resolveMedicine(item) {
  const existing = await prisma.medicine.findFirst({
    where: { name: item.name, strength: item.dosage },
  });
  if (existing) return existing;

  return prisma.medicine.create({
    data: {
      name: item.name,
      genericName: item.genericName || item.name,
      category: item.category,
      strength: item.dosage,
      dosageForm: item.dosageForm,
      manufacturer: item.manufacturer,
      prescriptionRequired: item.prescriptionRequired ?? false,
    },
  });
}

async function upsertItem(pharmacyId, item) {
  const medicine = await resolveMedicine(item);
  const data = {
    quantity: item.stock,
    minStock: item.minStock ?? 10,
    price: item.unitPriceETB,
    batchNo: item.batchNo,
    expiryDate: new Date(item.expiryDate),
  };

  return prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId, medicineId: medicine.id } },
    create: { pharmacyId, medicineId: medicine.id, ...data },
    update: data,
    include: { medicine: true },
  });
}

router.post("/inventory", loadOwnPharmacy, async (req, res) => {
  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const row = await upsertItem(req.pharmacy.id, parsed.data);
  res.status(201).json(toInventoryItem(row));
});

/** CSV is parsed in the browser; the API takes rows so it stays a plain JSON endpoint. */
router.post("/inventory/bulk", loadOwnPharmacy, async (req, res) => {
  const parsed = z.object({ items: z.array(itemSchema).min(1).max(500) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const imported = [];
  const errors = [];
  for (const [index, item] of parsed.data.items.entries()) {
    try {
      imported.push(toInventoryItem(await upsertItem(req.pharmacy.id, item)));
    } catch (err) {
      errors.push({ row: index + 1, name: item.name, error: err.message });
    }
  }
  res.json({ imported: imported.length, failed: errors.length, errors, items: imported });
});

const patchSchema = z.object({
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  unitPriceETB: z.number().min(0).optional(),
  batchNo: z.string().optional(),
  expiryDate: z.string().min(4).optional(),
});

router.patch("/inventory/:id", loadOwnPharmacy, async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.pharmacyId !== req.pharmacy.id) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  const { stock, unitPriceETB, expiryDate, ...rest } = parsed.data;
  const row = await prisma.inventory.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(stock !== undefined && { quantity: stock }),
      ...(unitPriceETB !== undefined && { price: unitPriceETB }),
      ...(expiryDate !== undefined && { expiryDate: new Date(expiryDate) }),
    },
    include: { medicine: true },
  });
  res.json(toInventoryItem(row));
});

router.delete("/inventory/:id", loadOwnPharmacy, async (req, res) => {
  const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.pharmacyId !== req.pharmacy.id) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  await prisma.inventory.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

router.get("/stats", loadOwnPharmacy, async (req, res) => {
  const rows = await prisma.inventory.findMany({
    where: { pharmacyId: req.pharmacy.id },
    include: { medicine: true },
  });

  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const lowStock = rows.filter((r) => stockStatus(r.quantity, r.minStock) !== "In Stock");
  const expiringSoon = rows.filter((r) => r.expiryDate <= in30Days);

  res.json({
    totalMedicines: rows.length,
    inventoryValueETB: Math.round(rows.reduce((sum, r) => sum + r.price * r.quantity, 0)),
    lowStockCount: lowStock.length,
    outOfStockCount: rows.filter((r) => r.quantity === 0).length,
    expiringSoonCount: expiringSoon.length,
    lowStockItems: lowStock.slice(0, 10).map(toInventoryItem),
    expiringSoonItems: expiringSoon.slice(0, 10).map(toInventoryItem),
    topCategories: Object.entries(
      rows.reduce((acc, r) => {
        acc[r.medicine.category] = (acc[r.medicine.category] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  });
});

export default router;
