/** Shape an Inventory row (with medicine) the way the web portal expects. */
export function toInventoryItem(row) {
  return {
    id: row.id,
    medicineId: row.medicineId,
    name: row.medicine.name,
    genericName: row.medicine.genericName,
    category: row.medicine.category,
    dosage: row.medicine.strength,
    dosageForm: row.medicine.dosageForm,
    manufacturer: row.medicine.manufacturer,
    prescriptionRequired: row.medicine.prescriptionRequired,
    stock: row.quantity,
    minStock: row.minStock,
    unitPriceETB: row.price,
    batchNo: row.batchNo,
    expiryDate: row.expiryDate.toISOString().slice(0, 10),
    status: stockStatus(row.quantity, row.minStock),
  };
}

export function stockStatus(quantity, minStock) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= minStock * 0.25) return "Critical";
  if (quantity <= minStock) return "Low Stock";
  return "In Stock";
}
