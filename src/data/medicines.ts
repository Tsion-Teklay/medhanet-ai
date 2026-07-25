import type { NetworkMedicine } from '@/types'

export const medicines: NetworkMedicine[] = [
  {
    id: 'MED-001',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    totalStock: 4820,
    pharmacyCount: 89,
    avgPrice: 45,
    currency: 'ETB',
    demand: 'rising',
    lowStockPharmacies: 12,
    reservationsWeek: 340,
  },
  {
    id: 'MED-002',
    name: 'Paracetamol 500mg',
    category: 'Analgesics',
    totalStock: 12400,
    pharmacyCount: 142,
    avgPrice: 12,
    currency: 'ETB',
    demand: 'stable',
    lowStockPharmacies: 3,
    reservationsWeek: 890,
  },
  {
    id: 'MED-003',
    name: 'Metformin 850mg',
    category: 'Diabetes',
    totalStock: 2100,
    pharmacyCount: 67,
    avgPrice: 78,
    currency: 'ETB',
    demand: 'rising',
    lowStockPharmacies: 18,
    reservationsWeek: 156,
  },
  {
    id: 'MED-004',
    name: 'Artemether/Lumefantrine',
    category: 'Antimalarials',
    totalStock: 890,
    pharmacyCount: 54,
    avgPrice: 120,
    currency: 'ETB',
    demand: 'rising',
    lowStockPharmacies: 22,
    reservationsWeek: 210,
  },
  {
    id: 'MED-005',
    name: 'Omeprazole 20mg',
    category: 'Gastrointestinal',
    totalStock: 3200,
    pharmacyCount: 98,
    avgPrice: 55,
    currency: 'ETB',
    demand: 'stable',
    lowStockPharmacies: 7,
    reservationsWeek: 178,
  },
  {
    id: 'MED-006',
    name: 'Amlodipine 5mg',
    category: 'Cardiovascular',
    totalStock: 1560,
    pharmacyCount: 72,
    avgPrice: 35,
    currency: 'ETB',
    demand: 'stable',
    lowStockPharmacies: 9,
    reservationsWeek: 95,
  },
  {
    id: 'MED-007',
    name: 'Ciprofloxacin 500mg',
    category: 'Antibiotics',
    totalStock: 780,
    pharmacyCount: 45,
    avgPrice: 62,
    currency: 'ETB',
    demand: 'falling',
    lowStockPharmacies: 15,
    reservationsWeek: 42,
  },
  {
    id: 'MED-008',
    name: 'Ibuprofen 400mg',
    category: 'Analgesics',
    totalStock: 8900,
    pharmacyCount: 130,
    avgPrice: 18,
    currency: 'ETB',
    demand: 'stable',
    lowStockPharmacies: 2,
    reservationsWeek: 520,
  },
]

export const medicineStats = {
  totalCatalog: 8200,
  lowStockAlerts: 88,
  outOfStock: 14,
  fastMoving: 24,
  avgNetworkAvailability: 87,
}

export type MedicineFilterTab = 'all' | 'low_stock' | 'high_demand' | 'out_of_stock'

export const medicineFilterTabs: { id: MedicineFilterTab; icon: string; label: string }[] = [
  { id: 'all', icon: 'medication', label: 'All Medicines' },
  { id: 'low_stock', icon: 'warning', label: 'Low Stock' },
  { id: 'high_demand', icon: 'trending_up', label: 'High Demand' },
  { id: 'out_of_stock', icon: 'error', label: 'Out of Stock' },
]

export function filterMedicines(tab: MedicineFilterTab, search: string) {
  const query = search.toLowerCase()
  return medicines.filter((m) => {
    const matchesSearch =
      !query ||
      m.name.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query)

    const matchesTab =
      tab === 'all'
        ? true
        : tab === 'low_stock'
          ? m.lowStockPharmacies >= 10
          : tab === 'high_demand'
            ? m.demand === 'rising'
            : m.totalStock < 1000

    return matchesSearch && matchesTab
  })
}
