import type {
  Medicine,
  Reservation,
  PharmacyProfile,
  AnalyticsSummary,
  PrescriptionRequest,
  Notification,
} from '../types/pharmacy';
import { http, auth } from './http';
import { MOCK_RESERVATIONS, MOCK_PRESCRIPTIONS, MOCK_NOTIFICATIONS } from './mocks';

const delay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms));

interface BackendPharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  tinNumber: string | null;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface BackendInventoryItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosage: string;
  dosageForm: string | null;
  manufacturer: string | null;
  prescriptionRequired: boolean;
  stock: number;
  minStock: number;
  unitPriceETB: number;
  batchNo: string | null;
  expiryDate: string;
  status: Medicine['status'];
}

export interface InventoryInput {
  name: string;
  genericName?: string;
  category: string;
  dosage: string;
  dosageForm?: string;
  manufacturer?: string;
  prescriptionRequired?: boolean;
  stock: number;
  minStock?: number;
  unitPriceETB: number;
  batchNo?: string;
  expiryDate: string;
}

interface PharmacyStats {
  totalMedicines: number;
  inventoryValueETB: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
}

const VERIFICATION_STATUS = {
  VERIFIED: 'approved',
  PENDING: 'pending_verification',
  REJECTED: 'rejected',
} as const;

function toProfile(pharmacy: BackendPharmacy, staffTitle = 'Pharmacy Manager'): PharmacyProfile {
  return {
    name: pharmacy.name,
    location: pharmacy.address,
    city: 'Addis Ababa, ET',
    staffTitle,
    avatarUrl: `https://ui-avatars.com/api/?background=006b2c&color=fff&name=${encodeURIComponent(pharmacy.name)}`,
    isOpen: pharmacy.isOpen,
    tinNumber: pharmacy.tinNumber ?? undefined,
    verificationStatus: VERIFICATION_STATUS[pharmacy.status],
    rejectionReason: pharmacy.rejectionReason ?? undefined,
  };
}

function toMedicine(item: BackendInventoryItem): Medicine {
  return {
    id: item.id,
    name: `${item.name} ${item.dosage}`,
    genericName: item.genericName,
    brandName: item.name,
    category: item.category as Medicine['category'],
    dosage: item.dosage,
    dosageForm: (item.dosageForm ?? undefined) as Medicine['dosageForm'],
    manufacturer: item.manufacturer ?? undefined,
    stock: item.stock,
    minStock: item.minStock,
    unitPriceETB: item.unitPriceETB,
    expiryDate: item.expiryDate,
    status: item.status,
    batchNo: item.batchNo ?? undefined,
    prescriptionRequired: item.prescriptionRequired,
  };
}

/** The portal shows a brand+strength label; the API wants them separate. */
function splitName(medicine: Omit<Medicine, 'id'>) {
  const name = medicine.brandName || medicine.name.replace(new RegExp(`\\s*${medicine.dosage}$`), '');
  return {
    name: name.trim(),
    genericName: medicine.genericName || undefined,
    category: medicine.category,
    dosage: medicine.dosage,
    dosageForm: medicine.dosageForm,
    manufacturer: medicine.manufacturer,
    prescriptionRequired: medicine.prescriptionRequired,
    stock: medicine.stock,
    minStock: medicine.minStock,
    unitPriceETB: medicine.unitPriceETB,
    batchNo: medicine.batchNo,
    expiryDate: medicine.expiryDate,
  };
}

export const PharmacyAPI = {
  isAuthenticated: () => Boolean(auth.token),

  async login(phone: string, password: string): Promise<{ success: boolean; profile: PharmacyProfile }> {
    const { token, user } = await http.post<{ token: string; user: { name: string; role: string } }>(
      '/api/auth/login',
      { phone, password }
    );
    if (user.role !== 'PHARMACY') {
      throw new Error('This portal is for pharmacy accounts only');
    }

    auth.set(token);
    const pharmacy = await http.get<BackendPharmacy>('/api/pharmacy/me');
    return { success: true, profile: toProfile(pharmacy, user.name) };
  },

  logout() {
    auth.clear();
  },

  async getProfile(): Promise<PharmacyProfile> {
    return toProfile(await http.get<BackendPharmacy>('/api/pharmacy/me'));
  },

  async setOpen(isOpen: boolean): Promise<PharmacyProfile> {
    return toProfile(await http.patch<BackendPharmacy>('/api/pharmacy/me', { isOpen }));
  },

  async getMedicines(): Promise<Medicine[]> {
    const items = await http.get<BackendInventoryItem[]>('/api/pharmacy/inventory');
    return items.map(toMedicine);
  },

  async addMedicine(newMed: Omit<Medicine, 'id'>): Promise<Medicine> {
    return toMedicine(await http.post<BackendInventoryItem>('/api/pharmacy/inventory', splitName(newMed)));
  },

  async updateStock(id: string, newStock: number): Promise<Medicine | null> {
    return toMedicine(
      await http.patch<BackendInventoryItem>(`/api/pharmacy/inventory/${id}`, { stock: newStock })
    );
  },

  async deleteMedicine(id: string): Promise<boolean> {
    await http.delete(`/api/pharmacy/inventory/${id}`);
    return true;
  },

  async bulkImport(items: InventoryInput[]) {
    return http.post<{ imported: number; failed: number; errors: { row: number; error: string }[] }>(
      '/api/pharmacy/inventory/bulk',
      { items }
    );
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const stats = await http.get<PharmacyStats>('/api/pharmacy/stats');
    return {
      // Revenue and reservation counts arrive with the reservations API (Step 4).
      totalRevenueETB: 0,
      totalReservationsCount: 0,
      inventoryValueETB: stats.inventoryValueETB,
      weeklyGrowthPercentage: 0,
    };
  },

  async getStats(): Promise<PharmacyStats> {
    return http.get<PharmacyStats>('/api/pharmacy/stats');
  },

  // --- Not backed by the API yet (Step 4) ---

  async getReservations(): Promise<Reservation[]> {
    try {
      const data = await http.get<Reservation[]>('/api/reservations/pharmacy');
      if (Array.isArray(data) && data.length > 0) return data;
      return [...MOCK_RESERVATIONS];
    } catch {
      return [...MOCK_RESERVATIONS];
    }
  },

  async completeReservation(id: string, pickupCode?: string): Promise<Reservation | null> {
    try {
      await http.patch<{ success: boolean }>(`/api/reservations/pharmacy/${id}/fulfill`, { pickupCode });
      const list = await this.getReservations();
      return list.find((r) => r.id === id) || null;
    } catch {
      const res = MOCK_RESERVATIONS.find((r) => r.id === id);
      if (!res) return null;
      res.status = 'Completed';
      return { ...res };
    }
  },

  async getPrescriptions(): Promise<PrescriptionRequest[]> {
    await delay();
    return [...MOCK_PRESCRIPTIONS];
  },

  async updatePrescriptionStatus(
    id: string,
    status: PrescriptionRequest['status'],
    medicines: PrescriptionRequest['medicines']
  ): Promise<PrescriptionRequest | null> {
    await delay();
    const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === id);
    if (!rx) return null;
    rx.status = status;
    rx.medicines = medicines;
    return { ...rx };
  },

  async getNotifications(): Promise<Notification[]> {
    await delay(100);
    return [...MOCK_NOTIFICATIONS];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const item = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (!item) return false;
    item.isRead = true;
    return true;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    MOCK_NOTIFICATIONS.forEach((n) => {
      n.isRead = true;
    });
    return true;
  },
};
