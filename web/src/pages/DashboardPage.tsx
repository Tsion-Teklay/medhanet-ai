import React from 'react';
import type { Medicine, Reservation, TabType } from '../types/pharmacy';

interface DashboardPageProps {
  pharmacyName: string;
  medicines: Medicine[];
  reservations: Reservation[];
  setActiveTab: (tab: TabType) => void;
  onOpenAddMedicine: () => void;
  onOpenQuickScan: () => void;
  onRestockItem: (medicineName: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  pharmacyName,
  medicines,
  reservations,
  setActiveTab,
  onOpenAddMedicine,
  onOpenQuickScan,
  onRestockItem,
}) => {
  const lowStockMedicines = medicines.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical' || m.status === 'Out of Stock'
  );
  const todayReservations = reservations.slice(0, 3);
  const totalStockCount = medicines.reduce((acc, curr) => acc + curr.stock, 0);
  const pendingReservations = reservations.filter((r) => r.status === 'Ready for Pickup').length;
  const prescriptionRequests = 6; // TODO: wire from context

  // Expiring within 90 days
  const today = new Date();
  const expiringMedicines = medicines
    .filter((m) => {
      const exp = new Date(m.expiryDate);
      const daysUntil = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 90 && daysUntil > 0;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 3);

  const formatExpiry = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysUntil = (dateStr: string) => {
    const exp = new Date(dateStr);
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 tilet-pattern opacity-10 pointer-events-none"></div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Good morning, {pharmacyName}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Here is what is happening at your pharmacy today in Addis Ababa.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenQuickScan}
            className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            Verify OTP
          </button>
          <button
            onClick={onOpenAddMedicine}
            className="px-4 py-2.5 bg-surface-container-high text-primary rounded-xl text-xs font-semibold hover:bg-outline-variant/30 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Stock
          </button>
          <button
            onClick={() => setActiveTab('bulk-import')}
            className="px-4 py-2.5 bg-surface-container-high text-primary rounded-xl text-xs font-semibold hover:bg-outline-variant/30 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            Bulk Import
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:scale-[1.02] hover:border-primary/40 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">medication</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Stock</p>
            <h3 className="text-xl font-bold text-on-surface mt-0.5">{totalStockCount.toLocaleString()}</h3>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:scale-[1.02] hover:border-error/40 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">warning</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Low Stock</p>
            <h3 className="text-xl font-bold text-on-surface mt-0.5">{lowStockMedicines.length} Items</h3>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('reservations')}
          className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:scale-[1.02] hover:border-primary/40 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">event_available</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Reservations</p>
            <h3 className="text-xl font-bold text-on-surface mt-0.5">{pendingReservations} Ready</h3>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('prescriptions')}
          className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:scale-[1.02] hover:border-blue-300 transition-all duration-200 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">receipt_long</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Prescriptions</p>
            <h3 className="text-xl font-bold text-on-surface mt-0.5">{prescriptionRequests} New</h3>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Today's Pickups */}
        <section className="md:col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 tilet-pattern opacity-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-on-surface">Upcoming Pickups</h3>
            <span className="material-symbols-outlined text-primary">schedule</span>
          </div>
          <div className="space-y-3 flex-1">
            {todayReservations.length === 0 ? (
              <p className="text-xs text-secondary text-center py-6">No pickups scheduled today</p>
            ) : (
              todayReservations.map((res) => (
                <div key={res.id} className="flex items-start p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container-high/40 transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-on-surface truncate">{res.medicineName}</p>
                    <p className="text-xs text-secondary">{res.patientName} · {res.scheduledTime}</p>
                    {(res.pickupDeadline || res.distanceKm) && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {res.pickupDeadline && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            ⏱ {res.pickupDeadline}
                          </span>
                        )}
                        {res.distanceKm !== undefined && (
                          <span className="text-[10px] font-semibold text-primary/70">
                            📍 {res.distanceKm} km away
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                    Ready
                  </span>
                </div>
              ))
            )}
          </div>
          <button onClick={() => setActiveTab('reservations')} className="w-full mt-4 py-2.5 text-primary font-semibold text-xs hover:bg-primary/5 rounded-xl transition-colors text-center cursor-pointer border border-primary/20">
            View All Reservations →
          </button>
        </section>

        {/* Urgent Restock & AI */}
        <section className="md:col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-error mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">emergency_home</span>
            Urgent Restock Needed
          </h3>
          <div className="space-y-3 flex-1">
            {lowStockMedicines.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-error/20 bg-error/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-error animate-ping shrink-0"></div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-on-surface block truncate">{item.name}</span>
                    <span className="text-[11px] text-secondary">Stock: {item.stock} / min {item.minStock}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRestockItem(item.name)}
                  className="ml-2 px-3 py-1.5 bg-primary text-on-primary rounded-full text-[11px] font-bold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-surface-container-high/50 border border-outline-variant/40">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              MedhaNet AI Prediction
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Metformin 850mg expected to reach critical threshold within <strong className="text-on-surface font-semibold">48 hours</strong> based on seasonal refill data.
            </p>
          </div>
        </section>

        {/* Most Requested + Revenue */}
        <section className="md:col-span-12 lg:col-span-4 space-y-5">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
            <h3 className="text-base font-bold text-on-surface mb-4">Most Requested Medicines</h3>
            <div className="space-y-3">
              {[
                { name: 'Paracetamol 500mg', pct: 85 },
                { name: 'Amoxicillin 500mg', pct: 65 },
                { name: 'Ibuprofen 400mg', pct: 45 },
              ].map(({ name, pct }) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{name}</span>
                    <span className="font-semibold text-primary">{pct}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-primary p-6 rounded-3xl text-on-primary shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 pointer-events-none">
              <span className="material-symbols-outlined text-[90px]">payments</span>
            </div>
            <p className="text-xs opacity-80 uppercase tracking-widest font-medium">Today's Revenue</p>
            <h4 className="text-3xl font-bold mt-1 tracking-tight">ETB 14,250</h4>
            <div className="flex items-center gap-2 mt-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12% from yesterday</span>
            </div>
          </div>
        </section>

        {/* ⏰ Expiring Soon Section */}
        <section className="md:col-span-12">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
                Expiring Soon
              </h3>
              <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-amber-700 hover:underline">
                Manage Inventory →
              </button>
            </div>
            {expiringMedicines.length === 0 ? (
              <p className="text-xs text-amber-700">No medicines expiring within 90 days.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {expiringMedicines.map((med) => {
                  const days = daysUntil(med.expiryDate);
                  return (
                    <div key={med.id} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                      <p className="text-sm font-bold text-on-surface">{med.name}</p>
                      <p className="text-xs text-secondary mt-1">Expires: <strong>{formatExpiry(med.expiryDate)}</strong></p>
                      <span className={`mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${days <= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {days} days left
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="md:col-span-12">
          <h3 className="text-base font-bold text-on-surface mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Add Medicine', icon: 'add_circle', action: onOpenAddMedicine },
              { label: 'Bulk Import', icon: 'upload_file', action: () => setActiveTab('bulk-import') },
              { label: 'View Reservations', icon: 'event_available', action: () => setActiveTab('reservations') },
              { label: 'Prescriptions', icon: 'receipt_long', action: () => setActiveTab('prescriptions') },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 group flex flex-col items-center gap-3 text-center cursor-pointer shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <span className="font-semibold text-xs text-on-surface">{label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
