import { z } from "zod";

/** Ethiopian mobile numbers: 0912345678, 251912345678 or +251912345678 */
export const phoneSchema = z
  .string()
  .regex(/^(\+?251|0)?9\d{8}$/, "Enter a valid Ethiopian phone number");

/** Store one canonical format so +251912345678 and 0912345678 are the same account. */
export function normalizePhone(phone) {
  return "0" + phone.replace(/\D/g, "").slice(-9);
}
