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
  login: (businessName: string) => Promise<void>;
  logout: () => void;
  addMedicine: (newMed: Omit<Medicine, 'id'>) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  restockByName: (name: string) => Promise<void>;
  completeReservation: (id: string) => Promise<void>;
  updatePrescriptionStatus: (id: string, status: PrescriptionRequest['status'], meds: PrescriptionRequest['medicines']) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  togglePharmacyStatus: (isOpen: boolean) => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoginPagePath = typeof window !== 'undefined' && window.location.pathname === '/login';
  const [isLoggedIn, setIsLoggedIn] = useState(!isLoginPagePath);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<PharmacyProfile>({
    name: 'Bole Medhanealem Pharmacy',
    location: 'Bole Sub City, Woreda 03',
    city: 'Addis Ababa, ET',
    staffTitle: 'Pharmacy Manager',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRQ-L0WYS_jqoRZiKtF-Crh5C_RVM9Vt1VoGtd_LNauKWuh0dfZ3doJnabFMVtbFTgUF69XCFRwrG9ijGpAiCQQEghDJNew2qchFnoPU7EgYBDbV-u8fV_rMEM6Gm0J_nKnjj1Rb7t_9w047re428wWLM2bECSCerwW4r3xkcGcM9ub0uOcegu0PtcU1mfirqz45F3V09Rgef9sT3b5yutPb3nofC8C_vNcXlirNKw4YQIBbwKI-aXxa4IygBWerpspyF5KOKWmZA',
    isOpen: true
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial Fetch from API service
  useEffect(() => {
    PharmacyAPI.getMedicines().then(setMedicines);
    PharmacyAPI.getReservations().then(setReservations);
    PharmacyAPI.getPrescriptions().then(setPrescriptions);
    PharmacyAPI.getNotifications().then(setNotifications);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const login = async (businessName: string) => {
    const res = await PharmacyAPI.login(businessName);
    if (res.success) {
      setProfile(res.profile);
      setIsLoggedIn(true);
      if (window.location.pathname === '/login') {
        window.history.pushState({}, '', '/');
      }
      showToast(`Welcome back, ${res.profile.name}`);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    window.history.pushState({}, '', '/login');
  };

  const addMedicine = async (newMed: Omit<Medicine, 'id'>) => {
    const created = await PharmacyAPI.addMedicine(newMed);
    setMedicines((prev) => [created, ...prev]);
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

  const togglePharmacyStatus = (isOpen: boolean) => {
    setProfile((prev) => ({ ...prev, isOpen }));
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
