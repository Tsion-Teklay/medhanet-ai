import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Medicine, Reservation, PharmacyProfile, TabType, PrescriptionRequest, Notification } from '../types/pharmacy';
import { PharmacyAPI } from '../services/api';

interface PharmacyContextType {
  isLoggedIn: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: PharmacyProfile;
  medicines: Medicine[];
  reservations: Reservation[];
  prescriptions: PrescriptionRequest[];
  notifications: Notification[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  addMedicine: (newMed: Omit<Medicine, 'id'>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  refreshMedicines: () => Promise<void>;
  restockByName: (name: string) => Promise<void>;
  completeReservation: (id: string) => Promise<void>;
  updatePrescriptionStatus: (id: string, status: PrescriptionRequest['status'], meds: PrescriptionRequest['medicines']) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  togglePharmacyStatus: (isOpen: boolean) => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(PharmacyAPI.isAuthenticated());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<PharmacyProfile>({
    name: '',
    location: '',
    city: 'Addis Ababa, ET',
    staffTitle: 'Pharmacy Manager',
    avatarUrl: '',
    isOpen: true
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Restore the session from a stored token, then load the pharmacy's own data.
  useEffect(() => {
    if (!isLoggedIn) return;

    PharmacyAPI.getProfile()
      .then(setProfile)
      .catch(() => {
        PharmacyAPI.logout();
        setIsLoggedIn(false);
      });
    PharmacyAPI.getMedicines().then(setMedicines).catch(() => setMedicines([]));
    PharmacyAPI.getReservations().then(setReservations);
    PharmacyAPI.getPrescriptions().then(setPrescriptions);
    PharmacyAPI.getNotifications().then(setNotifications);
  }, [isLoggedIn]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const login = async (phone: string, password: string) => {
    const res = await PharmacyAPI.login(phone, password);
    setProfile(res.profile);
    setIsLoggedIn(true);
    if (window.location.pathname === '/login') {
      window.history.pushState({}, '', '/');
    }
    showToast(`Welcome back, ${res.profile.name}`);
  };

  const logout = () => {
    PharmacyAPI.logout();
    setIsLoggedIn(false);
    setMedicines([]);
    window.history.pushState({}, '', '/login');
  };

  const addMedicine = async (newMed: Omit<Medicine, 'id'>) => {
    const created = await PharmacyAPI.addMedicine(newMed);
    setMedicines((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
    showToast(`Added ${created.name} to inventory!`);
  };

  const updateStock = async (id: string, newStock: number) => {
    const updated = await PharmacyAPI.updateStock(id, newStock);
    if (updated) {
      setMedicines((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast('Inventory stock updated successfully!');
    }
  };

  const deleteMedicine = async (id: string) => {
    const success = await PharmacyAPI.deleteMedicine(id);
    if (success) {
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      showToast('Medicine removed from inventory.');
    }
  };

  const refreshMedicines = async () => {
    setMedicines(await PharmacyAPI.getMedicines());
  };

  const restockByName = async (name: string) => {
    const med = medicines.find((m) => m.name.toLowerCase() === name.toLowerCase());
    if (med) {
      await updateStock(med.id, med.stock + 100);
      showToast(`Restock purchase order placed for ${name}!`);
    }
  };

  const completeReservation = async (id: string) => {
    const updated = await PharmacyAPI.completeReservation(id);
    if (updated) {
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast('Prescription pickup confirmed!');
    }
  };

  const updatePrescriptionStatus = async (id: string, status: PrescriptionRequest['status'], meds: PrescriptionRequest['medicines']) => {
    const updated = await PharmacyAPI.updatePrescriptionStatus(id, status, meds);
    if (updated) {
      setPrescriptions((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(`Prescription request marked as ${status}!`);
    }
  };

  const markNotificationRead = async (id: string) => {
    const success = await PharmacyAPI.markNotificationRead(id);
    if (success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }
  };

  const markAllNotificationsRead = async () => {
    const success = await PharmacyAPI.markAllNotificationsRead();
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read.');
    }
  };

  const togglePharmacyStatus = async (isOpen: boolean) => {
    setProfile(await PharmacyAPI.setOpen(isOpen));
    showToast(`Pharmacy status set to: ${isOpen ? 'OPEN' : 'CLOSED'}`);
  };

  return (
    <PharmacyContext.Provider
      value={{
        isLoggedIn,
        activeTab,
        setActiveTab,
        profile,
        medicines,
        reservations,
        prescriptions,
        notifications,
        toastMessage,
        showToast,
        login,
        logout,
        addMedicine,
        updateStock,
        deleteMedicine,
        refreshMedicines,
        restockByName,
        completeReservation,
        updatePrescriptionStatus,
        markNotificationRead,
        markAllNotificationsRead,
        togglePharmacyStatus
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
