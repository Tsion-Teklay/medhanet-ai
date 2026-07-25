import { useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { FAB } from './components/FAB';
import { AddMedicineModal } from './components/AddMedicineModal';
import { QuickScanModal } from './components/QuickScanModal';

// Pages
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { BulkImportPage } from './pages/BulkImportPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { PrescriptionRequestsPage } from './pages/PrescriptionRequestsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

function PharmacyAppContent() {
  const {
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
    togglePharmacyStatus
  } = usePharmacy();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show Onboarding flow (separate full-screen flow, not authenticated)
  if (showOnboarding) {
    return (
      <OnboardingPage
        onOnboardingComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Show Login Page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={login}
        onRegisterClick={() => setShowOnboarding(true)}
      />
    );
  }

  // Computed badge counts
  const lowStockCount = medicines.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical' || m.status === 'Out of Stock'
  ).length;
  const pendingReservations = reservations.filter(
    (r) => r.status === 'Ready for Pickup'
  ).length;
  const prescriptionCount = prescriptions.filter((r) => r.status === 'New').length;
  const notificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-background font-sans text-on-background min-h-screen pb-20 md:pb-8 flex flex-col relative">
      {/* Top App Bar */}
      <Header profile={profile} activeTab={activeTab} onLogout={logout} onTogglePharmacyStatus={togglePharmacyStatus} />

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        reservationCount={pendingReservations}
        prescriptionCount={prescriptionCount}
        notificationCount={notificationCount}
      />

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-4 md:px-8 max-w-[1440px] mx-auto w-full min-h-[calc(100vh-64px)]">

        {activeTab === 'dashboard' && (
          <DashboardPage
            pharmacyName={profile.name}
            medicines={medicines}
            reservations={reservations}
            setActiveTab={setActiveTab}
            onOpenAddMedicine={() => setIsAddModalOpen(true)}
            onOpenQuickScan={() => setIsScanModalOpen(true)}
            onRestockItem={restockByName}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPage
            medicines={medicines}
            onAddMedicine={() => setIsAddModalOpen(true)}
            onUpdateStock={updateStock}
            onDeleteMedicine={deleteMedicine}
          />
        )}

        {activeTab === 'bulk-import' && <BulkImportPage />}

        {activeTab === 'reservations' && (
          <ReservationsPage
            reservations={reservations}
            onCompletePickup={completeReservation}
          />
        )}

        {activeTab === 'prescriptions' && <PrescriptionRequestsPage />}

        {activeTab === 'analytics' && <AnalyticsPage />}

        {activeTab === 'notifications' && (
          <NotificationsPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'settings' && <SettingsPage profile={profile} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationCount={notificationCount}
        prescriptionCount={prescriptionCount}
      />

      {/* Floating Action Button (Quick Scan) */}
      <FAB onOpenScan={() => setIsScanModalOpen(true)} />

      {/* Modals */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addMedicine}
      />
      <QuickScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanResult={(res) => showToast(res)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-on-background text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold z-[100] animate-bounce">
          <span className="material-symbols-outlined text-primary-fixed text-base">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <PharmacyProvider>
      <PharmacyAppContent />
    </PharmacyProvider>
  );
}

export default App;
