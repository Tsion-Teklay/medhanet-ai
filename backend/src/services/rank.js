const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function isOpenNow(openTime, closeTime, now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(openTime);
  const close = toMinutes(closeTime);
  return close >= open ? mins >= open && mins <= close : mins >= open || mins <= close;
}

/**
 * Deterministic ranking: proximity 50%, price 20%, stock depth 15%, open now 15%.
 * Every sub-score is normalised to 0..1 across the candidate set.
 */
export function rankResults(rows) {
  if (rows.length === 0) return [];

  const prices = rows.map((r) => Number(r.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxDistance = Math.max(...rows.map((r) => Number(r.distanceM)), 1);

  return rows
    .map((r) => {
      const distanceM = Number(r.distanceM);
      const price = Number(r.price);
      const quantity = Number(r.quantity);
      const isOpen = isOpenNow(r.openTime, r.closeTime);

      const proximity = 1 - distanceM / maxDistance;
      const affordability =
        maxPrice === minPrice ? 1 : 1 - (price - minPrice) / (maxPrice - minPrice);
      const availability = Math.min(quantity / 50, 1);

      const score =
        proximity * 0.5 + affordability * 0.2 + availability * 0.15 + (isOpen ? 0.15 : 0);

      return {
        pharmacyId: r.pharmacyId,
        pharmacyName: r.pharmacyName,
        address: r.address,
        phone: r.phone,
        lat: r.lat,
        lng: r.lng,
        openTime: r.openTime,
        closeTime: r.closeTime,
        isOpen,
        medicineId: r.medicineId,
        medicineName: r.medicineName,
        genericName: r.genericName,
        strength: r.strength,
        category: r.category,
        inventoryId: r.inventoryId,
        price,
        quantity,
        distanceKm: Math.round((distanceM / 1000) * 100) / 100,
        score: Math.round(score * 100) / 100,
      };
    })
    .sort((a, b) => b.score - a.score);
}
