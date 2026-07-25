import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { normalizePhone, phoneSchema } from "../lib/phone.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, phone: user.phone, role: user.role };
}

const registerSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name is too short"),
  role: z.enum(["PATIENT", "PHARMACY"]).default("PATIENT"),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (await prisma.user.findUnique({ where: { phone } })) {
    return res.status(409).json({ error: "Phone already registered" });
  }

  const user = await prisma.user.create({
    data: {
      phone,
      name: parsed.data.name,
      role: parsed.data.role,
      password: bcrypt.hashSync(parsed.data.password, 10),
    },
  });

  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

const loginSchema = z.object({ phone: phoneSchema, password: z.string().min(1) });

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(401).json({ error: "Invalid phone or password" });

  const user = await prisma.user.findUnique({
    where: { phone: normalizePhone(parsed.data.phone) },
  });
  if (!user || !bcrypt.compareSync(parsed.data.password, user.password)) {
    return res.status(401).json({ error: "Invalid phone or password" });
  }

  res.json({ token: sign(user), user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, phone: true, role: true, pharmacy: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;
