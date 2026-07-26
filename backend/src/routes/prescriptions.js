import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { findNearbyPharmacies } from "../services/search.js";
import { isOpenNow } from "../services/rank.js";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads", "prescriptions");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `rx-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/** Upload prescription photo & process via FastAPI AI OCR */
router.post("/upload", requireAuth, upload.single("prescription"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a prescription image" });
    }

    const imageUrl = `/uploads/prescriptions/${req.file.filename}`;
    const filePath = req.file.path;

    let ocrResult = null;
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    try {
      // Send file to Python FastAPI AI OCR endpoint
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");

      const response = await axios.post(`${aiServiceUrl}/ocr/prescription`, {
        image_base64: base64Image,
        mime_type: req.file.mimetype || "image/jpeg",
      }, { timeout: 60000 });

      ocrResult = response.data;
    } catch (aiErr) {
      console.warn("AI OCR service unavailable:", aiErr.message);
      ocrResult = {
        isPrescription: null,
        language: "Unknown",
        rawText: "",
        englishText: "",
        readableSummary: "",
        medicines: [],
        patientNotes: "",
        confidence: "Low",
        needsPharmacistReview: true,
        reviewReason: "The reading service is unavailable, so a pharmacist should check this photo.",
        ocrFailed: true,
      };
    }

    const needsReview = Boolean(ocrResult.needsPharmacistReview);

    // Save prescription record to DB
    const prescription = await prisma.prescription.create({
      data: {
        userId: req.user.id,
        imageUrl,
        extracted: ocrResult,
        status: needsReview ? "NEEDS_REVIEW" : "COMPLETED",
      },
    });

    // Find matched catalogue medicines and nearby pharmacy inventory stock
    const extractedMedList = ocrResult.medicines || [];
    const matchedStock = [];

    for (const medItem of extractedMedList) {
      // Short fragments would `LIKE %x%` against the whole catalogue.
      const searchTerms = [medItem.name, medItem.genericName].filter((t) => t && t.trim().length >= 3);

      let matchingMedicines = [];
      for (const term of searchTerms) {
        const found = await prisma.medicine.findMany({
          where: {
            OR: [
              { name: { contains: term } },
              { genericName: { contains: term } },
            ],
          },
          include: {
            inventory: {
              where: {
                quantity: { gt: 0 },
                expiryDate: { gt: new Date() },
              },
              include: {
                pharmacy: true,
              },
            },
          },
        });
        matchingMedicines.push(...found);
      }

      // Deduplicate medicines by ID
      const uniqueMeds = Array.from(new Map(matchingMedicines.map((m) => [m.id, m])).values());

      matchedStock.push({
        rxMedicine: medItem,
        matchedMedicines: uniqueMeds.map((m) => ({
          id: m.id,
          name: m.name,
          genericName: m.genericName,
          category: m.category,
          strength: m.strength,
          pharmaciesWithStock: m.inventory.map((inv) => ({
            inventoryId: inv.id,
            pharmacyId: inv.pharmacy.id,
            pharmacyName: inv.pharmacy.name,
            address: inv.pharmacy.address,
            phone: inv.pharmacy.phone,
            lat: inv.pharmacy.lat,
            lng: inv.pharmacy.lng,
            price: inv.price,
            quantity: inv.quantity,
          })),
        })),
      });
    }

    res.status(201).json({
      prescriptionId: prescription.id,
      imageUrl,
      ocrResult,
      matchedStock,
      needsReview,
    });
  } catch (err) {
    next(err);
  }
});

const nearbySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(50).default(15),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

/** Verified pharmacies a patient can hand an unreadable prescription to. */
router.get("/pharmacies/nearby", requireAuth, async (req, res, next) => {
  const parsed = nearbySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const rows = await findNearbyPharmacies(parsed.data);
    res.json(
      rows.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        phone: p.phone,
        isOpen: isOpenNow(p.openTime, p.closeTime),
        distanceKm: Math.round((Number(p.distanceM) / 1000) * 100) / 100,
      }))
    );
  } catch (err) {
    next(err);
  }
});

/** The patient's own scans, newest first, with any pharmacy response. */
router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const rows = await prisma.prescription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        pharmacy: { select: { id: true, name: true, address: true, phone: true } },
      },
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

const sendSchema = z.object({
  pharmacyId: z.string().min(1, "Choose a pharmacy"),
  note: z.string().max(500).optional(),
});

/** Hand a prescription the AI could not read confidently to a human pharmacist. */
router.post("/:id/send-to-pharmacy", requireAuth, async (req, res, next) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const prescription = await prisma.prescription.findUnique({ where: { id: req.params.id } });
    if (!prescription || prescription.userId !== req.user.id) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: parsed.data.pharmacyId } });
    if (!pharmacy || pharmacy.status !== "VERIFIED") {
      return res.status(400).json({ error: "Choose a verified pharmacy" });
    }

    const updated = await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        pharmacyId: pharmacy.id,
        patientNote: parsed.data.note || null,
        status: "SENT_TO_PHARMACY",
      },
    });

    res.json({
      id: updated.id,
      status: updated.status,
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
