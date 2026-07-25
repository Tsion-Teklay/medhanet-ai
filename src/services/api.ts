import type { Medicine, Reservation, PharmacyProfile, AnalyticsSummary, PrescriptionRequest, Notification } from '../types/pharmacy';

// Mock delay to simulate real network request to backend
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// INITIAL SEED DATA
const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'MED-101',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    brandName: 'Amoxil',
    category: 'Antibiotic',
    dosage: '500mg',
    dosageForm: 'Capsule',
    manufacturer: 'EPHARM',
    stock: 150,
    minStock: 50,
    unitPriceETB: 120.0,
    expiryDate: '2025-10-30',
    status: 'In Stock',
    batchNo: 'AMX-2025-ET',
    prescriptionRequired: true
  },
  {
    id: 'MED-102',
    name: 'Metformin 850mg',
    genericName: 'Metformin HCl',
    brandName: 'Glucophage',
    category: 'Chronic Care',
    dosage: '850mg',
    dosageForm: 'Tablet',
    manufacturer: 'Cadila',
    stock: 15,
    minStock: 50,
    unitPriceETB: 85.5,
    expiryDate: '2024-01-15',
    status: 'Low Stock',
    batchNo: 'MET-2024-ET',
    prescriptionRequired: true
  },
  {
    id: 'MED-103',
    name: 'Epinephrine Auto-Injector',
    genericName: 'Epinephrine',
    brandName: 'EpiPen',
    category: 'Emergency',
    dosage: '0.3mg',
    dosageForm: 'Injection',
    manufacturer: 'Mylan',
    stock: 0,
    minStock: 10,
    unitPriceETB: 1450.0,
    expiryDate: '2023-08-01',
    status: 'Out of Stock',
    batchNo: 'EPI-2023-ET',
    prescriptionRequired: false
  },
  {
    id: 'MED-104',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    brandName: 'Panadol',
    category: 'Painkiller',
    dosage: '500mg',
    dosageForm: 'Tablet',
    manufacturer: 'GSK',
    stock: 500,
    minStock: 100,
    unitPriceETB: 15.0,
    expiryDate: '2026-03-20',
    status: 'In Stock',
    batchNo: 'PAR-2026-ET',
    prescriptionRequired: false
  },
  {
    id: 'MED-105',
    name: 'Insulin Human NPH',
    genericName: 'Isophane Insulin',
    brandName: 'Humulin N',
    category: 'Emergency',
    dosage: '100 IU/ml',
    dosageForm: 'Injection',
    manufacturer: 'Eli Lilly',
    stock: 8,
    minStock: 30,
    unitPriceETB: 340.0,
    expiryDate: '2026-09-10',
    status: 'Critical',
    batchNo: 'INS-2026-ET',
    prescriptionRequired: true
  },
  {
    id: 'MED-106',
    name: 'Aspirin 81mg',
    genericName: 'Acetylsalicylic Acid',
    brandName: 'Ecotrin',
    category: 'Chronic Care',
    dosage: '81mg',
    dosageForm: 'Tablet',
    manufacturer: 'Bayer',
    stock: 18,
    minStock: 60,
    unitPriceETB: 28.0,
    expiryDate: '2027-08-15',
    status: 'Low Stock',
    batchNo: 'ASP-2027-ET',
    prescriptionRequired: false
  }
];

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-801',
    medicineName: 'Paracetamol 500mg',
    quantity: 2,
    scheduledTime: '14:30 Today',
    patientName: 'Abebe Kebede',
    patientId: 'P-9011',
    patientPhone: '+251 91 123 4567',
    pickupDeadline: 'Expires in 45 mins',
    pickupDeadlineMinutes: 45,
    pickupCode: '1234',
    distanceKm: 2.3,
    status: 'Ready for Pickup',
    amountETB: 30.0
  },
  {
    id: 'RES-802',
    medicineName: 'Amoxicillin 500mg',
    quantity: 1,
    scheduledTime: '15:00 Today',
    patientName: 'Tigist Haile',
    patientId: 'P-4412',
    patientPhone: '+251 92 888 9911',
    pickupDeadline: 'Expires in 2 hours',
    pickupDeadlineMinutes: 120,
    pickupCode: '5678',
    distanceKm: 8.5,
    status: 'Ready for Pickup',
    amountETB: 120.0
  },
  {
    id: 'RES-803',
    medicineName: 'Metformin 850mg',
    quantity: 3,
    scheduledTime: '15:45 Today',
    patientName: 'Dawit Yohannes',
    patientId: 'P-7734',
    patientPhone: '+251 94 555 1212',
    pickupDeadline: 'Expires in 1 hour',
    pickupDeadlineMinutes: 60,
    pickupCode: '9012',
    distanceKm: 12.0,
    status: 'Ready for Pickup',
    amountETB: 256.5
  }
];

const MOCK_PRESCRIPTIONS: PrescriptionRequest[] = [
  {
    id: 'RX-1024',
    patientId: 'P-9281',
    receivedAt: '10:30 AM · Jul 25',
    source: 'OCR',
    ocrConfidence: 87,
    status: 'New',
    medicines: [
      { name: 'Amoxicillin 500mg', requestedQuantity: 2, available: null },
      { name: 'Paracetamol 500mg', requestedQuantity: 1, available: null },
    ],
  },
  {
    id: 'RX-1025',
    patientId: 'P-4412',
    receivedAt: '09:14 AM · Jul 25',
    source: 'Direct Broadcast',
    ocrConfidence: undefined,
    status: 'Under Review',
    medicines: [
      { name: 'Metformin 850mg', requestedQuantity: 3, available: null },
    ],
  },
  {
    id: 'RX-1023',
    patientId: 'P-7734',
    receivedAt: '08:00 AM · Jul 25',
    source: 'OCR',
    ocrConfidence: 92,
    status: 'Available',
    medicines: [
      { name: 'Atorvastatin 20mg', requestedQuantity: 1, available: true },
      { name: 'Aspirin 81mg', requestedQuantity: 1, available: true },
    ],
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'N-001',
    type: 'Inventory',
    title: 'Amoxicillin 500mg is low in stock',
    description: 'Only 3 units remaining. Minimum threshold is 50. Consider placing a restock order.',
    isRead: false,
    createdAt: '2 minutes ago',
    icon: 'inventory_2',
    linkTab: 'inventory',
    linkMedicineId: 'MED-101',
  },
  {
    id: 'N-002',
    type: 'Inventory',
    title: 'Expiry Alert: 3 medicines expire within 30 days',
    description: 'Amoxicillin 500mg, Ibuprofen 200mg, and Insulin NPH are nearing expiry.',
    isRead: false,
    createdAt: '14 minutes ago',
    icon: 'event_busy',
    linkTab: 'inventory',
  },
  {
    id: 'N-003',
    type: 'Prescription',
    title: 'New prescription request received',
    description: 'Patient #P-9281 sent a prescription for review. Source: OCR (87% confidence).',
    isRead: false,
    createdAt: '28 minutes ago',
    icon: 'smart_toy',
    linkTab: 'prescriptions',
  },
];

const MOCK_PROFILE: PharmacyProfile = {
  name: 'Bole Medhanealem Pharmacy',
  location: 'Bole Sub City, Woreda 03',
  city: 'Addis Ababa, ET',
  staffTitle: 'Pharmacy Manager',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRQ-L0WYS_jqoRZiKtF-Crh5C_RVM9Vt1VoGtd_LNauKWuh0dfZ3doJnabFMVtbFTgUF69XCFRwrG9ijGpAiCQQEghDJNew2qchFnoPU7EgYBDbV-u8fV_rMEM6Gm0J_nKnjj1Rb7t_9w047re428wWLM2bECSCerwW4r3xkcGcM9ub0uOcegu0PtcU1mfirqz45F3V09Rgef9sT3b5yutPb3nofC8C_vNcXlirNKw4YQIBbwKI-aXxa4IygBWerpspyF5KOKWmZA',
  isOpen: true
};

// BACKEND API ABSTRACTION SERVICE LAYER
export const PharmacyAPI = {
  // Auth API
  async login(businessName: string): Promise<{ success: boolean; profile: PharmacyProfile }> {
    await delay(600);
    return {
      success: true,
      profile: { ...MOCK_PROFILE, name: businessName || MOCK_PROFILE.name }
    };
  },

  // Medicines API
  async getMedicines(): Promise<Medicine[]> {
    await delay(300);
    return [...MOCK_MEDICINES];
  },

  async addMedicine(newMed: Omit<Medicine, 'id'>): Promise<Medicine> {
    await delay(400);
    const created: Medicine = {
      ...newMed,
      id: `MED-${Math.floor(100 + Math.random() * 900)}`
    };
    MOCK_MEDICINES.unshift(created);
    return created;
  },

  async updateStock(id: string, newStock: number): Promise<Medicine | null> {
    await delay(300);
    const index = MOCK_MEDICINES.findIndex((m) => m.id === id);
    if (index !== -1) {
      const med = MOCK_MEDICINES[index];
      const status = newStock > med.minStock ? 'In Stock' : newStock === 0 ? 'Out of Stock' : 'Low Stock';
      MOCK_MEDICINES[index] = { ...med, stock: newStock, status };
      return MOCK_MEDICINES[index];
    }
    return null;
  },

  async deleteMedicine(id: string): Promise<boolean> {
    await delay(300);
    const index = MOCK_MEDICINES.findIndex((m) => m.id === id);
    if (index !== -1) {
      MOCK_MEDICINES.splice(index, 1);
      return true;
    }
    return false;
  },

  // Reservations API
  async getReservations(): Promise<Reservation[]> {
    await delay(300);
    return [...MOCK_RESERVATIONS];
  },

  async completeReservation(id: string): Promise<Reservation | null> {
    await delay(300);
    const res = MOCK_RESERVATIONS.find((r) => r.id === id);
    if (res) {
      res.status = 'Completed';
      return { ...res };
    }
    return null;
  },

  // Prescriptions API
  async getPrescriptions(): Promise<PrescriptionRequest[]> {
    await delay(300);
    return [...MOCK_PRESCRIPTIONS];
  },

  async updatePrescriptionStatus(id: string, status: PrescriptionRequest['status'], medicines: PrescriptionRequest['medicines']): Promise<PrescriptionRequest | null> {
    await delay(300);
    const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === id);
    if (rx) {
      rx.status = status;
      rx.medicines = medicines;
      return { ...rx };
    }
    return null;
  },

  // Notifications API
  async getNotifications(): Promise<Notification[]> {
    await delay(200);
    return [...MOCK_NOTIFICATIONS];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    await delay(100);
    const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
    if (index !== -1) {
      MOCK_NOTIFICATIONS[index].isRead = true;
      return true;
    }
    return false;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    await delay(200);
    MOCK_NOTIFICATIONS.forEach((n) => {
      n.isRead = true;
    });
    return true;
  },

  // Analytics API
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    await delay(300);
    return {
      totalRevenueETB: 1200000,
      totalReservationsCount: 4829,
      inventoryValueETB: 3800000,
      weeklyGrowthPercentage: 22.0
    };
  }
};
