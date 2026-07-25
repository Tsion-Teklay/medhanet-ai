import { prisma } from "../lib/prisma.js";

/**
 * Verified pharmacies near (lat, lng) holding unexpired stock of a medicine.
 * ST_Distance_Sphere returns meters, and POINT takes (longitude, latitude).
 */
export async function findNearbyStock({ q, lat, lng, radiusKm, limit }) {
  const like = `%${q}%`;
  const radiusM = radiusKm * 1000;

  return prisma.$queryRaw`
    SELECT
      p.id          AS pharmacyId,
      p.name        AS pharmacyName,
      p.address     AS address,
      p.phone       AS phone,
      p.lat         AS lat,
      p.lng         AS lng,
      p.openTime    AS openTime,
      p.closeTime   AS closeTime,
      m.id          AS medicineId,
      m.name        AS medicineName,
      m.genericName AS genericName,
      m.strength    AS strength,
      m.category    AS category,
      i.id          AS inventoryId,
      i.price       AS price,
      i.quantity    AS quantity,
      ST_Distance_Sphere(POINT(p.lng, p.lat), POINT(${lng}, ${lat})) AS distanceM
    FROM Inventory i
    JOIN Pharmacy p ON p.id = i.pharmacyId
    JOIN Medicine m ON m.id = i.medicineId
    WHERE p.status = 'VERIFIED'
      AND i.quantity > 0
      AND i.expiryDate > NOW()
      AND (m.name LIKE ${like} OR m.genericName LIKE ${like})
    HAVING distanceM <= ${radiusM}
    ORDER BY distanceM ASC
    LIMIT ${limit}
  `;
}
