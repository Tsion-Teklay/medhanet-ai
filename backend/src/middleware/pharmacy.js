import { prisma } from "../lib/prisma.js";

/** Loads the pharmacy owned by the logged-in user so routes never trust a client-sent pharmacyId. */
export async function loadOwnPharmacy(req, res, next) {
  const pharmacy = await prisma.pharmacy.findUnique({ where: { ownerId: req.user.id } });
  if (!pharmacy) return res.status(404).json({ error: "No pharmacy profile yet" });
  req.pharmacy = pharmacy;
  next();
}
