export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  category: 'Antibiotic' | 'Chronic Care' | 'Emergency' | 'Pediatric' | 'General' | 'Painkiller' | 'Analgesic' | 'Supplement';
  dosage: string;
  dosageForm?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Drops' | 'Inhaler';
  manufacturer?: string;
  stock: number;
  minStock: number;
  unitPriceETB: number;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical';
  batchNo?: string;
  prescriptionRequired?: boolean;
}

export interface Reservation {
  id: string;
  medicineName: string;
  quantity: number;
  scheduledTime: string;
  patientName: string;
  patientId?: string;
  patientPhone?: string;
  pickupDeadline?: string;
  pickupDeadlineMinutes?: number;
  pickupCode?: string;
  distanceKm?: number;
  status: 'Pending' | 'Confirmed' | 'Ready for Pickup' | 'Completed' | 'Cancelled' | 'Expired';
  amountETB: number;
}

export interface PrescriptionRequest {
  id: string;
  patientId: string;
  receivedAt: string;
  source: 'OCR' | 'Direct Broadcast';
  ocrConfidence?: number;
  prescriptionImageUrl?: string;
  status: 'New' | 'Under Review' | 'Available' | 'Partially Available' | 'Unavailable' | 'Completed';
  medicines: PrescriptionMedicineItem[];
}

export interface PrescriptionMedicineItem {
  name: string;
  requestedQuantity: number;
  available: boolean | null; // null = not yet reviewed
}

export interface Notification {
  id: string;
  type: 'Inventory' | 'Reservation' | 'Prescription' | 'System' | 'AI';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
  linkTab?: TabType;
  linkMedicineId?: string;
}

export interface PharmacyProfile {
  name: string;
  location: string;
  city: string;
  staffTitle: string;
  avatarUrl: string;
  isOpen?: boolean;
}

export interface AnalyticsSummary {
  totalRevenueETB: number;
  totalReservationsCount: number;
  inventoryValueETB: number;
  weeklyGrowthPercentage: number;
}

export type TabType =
  | 'dashboard'
  | 'inventory'
  | 'bulk-import'
  | 'reservations'
  | 'prescriptions'
  | 'analytics'
  | 'notifications'
  | 'settings';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;
