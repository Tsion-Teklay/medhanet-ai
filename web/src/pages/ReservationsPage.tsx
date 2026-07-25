import React, { useState } from 'react';
import type { Reservation } from '../types/pharmacy';
import { CountdownTimer } from '../components/CountdownTimer';

interface ReservationsPageProps {
  reservations: Reservation[];
  onCompletePickup: (id: string) => void;
}

const STATUS_TABS = ['All', 'Ready for Pickup', 'Completed', 'Cancelled', 'Expired'];

const statusStyle = (status: string) => {
  const map: Record<string, string> = {
    'Ready for Pickup': 'bg-emerald-100 text-emerald-700',
    'Completed': 'bg-surface-container-high text-secondary',
    'Cancelled': 'bg-red-100 text-red-700',
    'Expired': 'bg-slate-100 text-slate-500',
  };
  return map[status] || 'bg-surface-container-high text-secondary';
};

export const ReservationsPage: React.FC<ReservationsPageProps> = ({
  reservations,
  onCompletePickup,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [pickupCode, setPickupCode] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [showConflict, setShowConflict] = useState(false);

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.pickupCode && r.pickupCode.includes(searchQuery)) ||
      (r.patientId && r.patientId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  const handlePickupVerify = () => {
    if (!selectedRes) return;
    const correctCode = selectedRes.pickupCode || '1234';
    if (pickupCode === correctCode) {
      onCompletePickup(selectedRes.id);
      setSelectedRes(null);
      setPickupCode('');
      setPickupError('');
    } else {
      setPickupError('Incorrect pickup code. Please ask the patient to check their notification.');
    }
  };

  const readyCount = reservations.filter((r) => r.status === 'Ready for Pickup').length;
  const expiredCount = reservations.filter((r) => r.status === 'Expired').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Patient Reservations & Pickups
          </h2>
          <p className="text-xs md:text-sm text-secondary mt-0.5">
            Manage auto-reserved patient prescriptions, pickup OTP confirmations, and statuses.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-center shrink-0">
            <p className="text-lg font-bold text-emerald-700">{readyCount}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Ready for Pickup</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-center shrink-0">
            <p className="text-lg font-bold text-secondary">{expiredCount}</p>
            <p className="text-[10px] text-secondary font-semibold">Expired</p>
          </div>
        </div>
      </div>

      {/* Stock Conflict Banner */}
      {showConflict && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
          <span className="material-symbols-outlined text-red-500 text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">Stock Conflict Detected</p>
            <p className="text-xs text-red-700 mt-1">This medicine is no longer available. The stock was reserved by another patient first. Please notify the patient and update the reservation status.</p>
          </div>
          <button onClick={() => setShowConflict(false)} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Search OTP Lookup Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-outline">search</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Lookup reservation by 4-digit OTP code, ID, patient name or medicine..."
          className="block w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 transition-shadow hover:shadow-md text-sm outline-none"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={() => setSearchQuery('')}
              className="p-1.5 text-secondary hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant/30'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reservation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-secondary">
            <span className="material-symbols-outlined text-4xl block mb-3 text-outline-variant">event_available</span>
            <p className="font-semibold text-sm">No reservations found matching your query.</p>
          </div>
        )}
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {res.id}
                </span>
                <div className="flex items-center gap-2">
                  {res.status === 'Ready for Pickup' && res.pickupDeadlineMinutes !== undefined && (
                    <CountdownTimer totalMinutes={res.pickupDeadlineMinutes} compact />
                  )}
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyle(res.status)}`}>
                    {res.status}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-base text-on-surface">{res.medicineName}</h3>
              <p className="text-xs text-secondary mt-0.5">Qty: {res.quantity} unit(s)</p>

              <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Patient Name:</span>
                  <span className="font-semibold text-on-surface">{res.patientName}</span>
                </div>
                {res.patientId && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Patient ID:</span>
                    <span className="font-medium text-on-surface">{res.patientId}</span>
                  </div>
                )}
                {res.pickupCode && (
                  <div className="flex items-center justify-between bg-primary/5 p-1 rounded">
                    <span className="text-secondary font-bold">OTP Code:</span>
                    <span className="font-mono font-bold text-primary">{res.pickupCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Scheduled Time:</span>
                  <span className="font-medium text-on-surface">{res.scheduledTime}</span>
                </div>
                {res.pickupDeadlineMinutes !== undefined && res.status === 'Ready for Pickup' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-secondary">Time Remaining:</span>
                    <CountdownTimer totalMinutes={res.pickupDeadlineMinutes} compact />
                  </div>
                )}
                {res.distanceKm !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Patient Distance:</span>
                    <span className="font-semibold text-primary">{res.distanceKm} km away</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Amount Due:</span>
                  <span className="font-bold text-primary">ETB {res.amountETB.toFixed(2)}</span>
                </div>
              </div>
            </div>

             {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {res.status === 'Ready for Pickup' && (
                <>
                  <button
                    onClick={() => { setSelectedRes(res); setPickupCode(''); setPickupError(''); }}
                    className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">pin</span>
                    Enter OTP Code
                  </button>
                  <button
                    onClick={() => setShowConflict(true)}
                    className="w-full py-2 text-error text-xs font-semibold hover:bg-error/5 rounded-xl transition-colors cursor-pointer"
                  >
                    Report Stock Conflict
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pickup Code Verification Modal */}
      {selectedRes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-5">
            <div className="text-center">
              <h3 className="text-lg font-bold text-on-surface">Verify Pickup Code</h3>
              <p className="text-xs text-secondary mt-1">
                Ask the patient for their 4-digit OTP to release <strong>{selectedRes.medicineName}</strong>.
              </p>
            </div>

            {/* Ring Timer */}
            {selectedRes.pickupDeadlineMinutes !== undefined && (
              <div className="flex flex-col items-center gap-1">
                <CountdownTimer totalMinutes={selectedRes.pickupDeadlineMinutes} compact={false} />
                {selectedRes.distanceKm !== undefined && (
                  <p className="text-[11px] text-secondary mt-1">
                    📍 Patient is <strong>{selectedRes.distanceKm} km</strong> away
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-on-surface mb-2 text-center">Enter OTP Code</label>
              <input
                type="text"
                maxLength={4}
                value={pickupCode}
                onChange={(e) => { setPickupCode(e.target.value.replace(/\D/g, '')); setPickupError(''); }}
                placeholder="4-digit code"
                className="w-full text-center text-2xl font-bold tracking-[0.5em] border-2 border-outline-variant/40 rounded-2xl py-4 outline-none focus:border-primary transition-colors"
              />
              {pickupError && (
                <p className="text-xs text-error text-center mt-2 font-semibold">{pickupError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedRes(null); setPickupCode(''); setPickupError(''); }}
                className="flex-1 py-3 border border-outline-variant/40 text-secondary rounded-2xl font-semibold text-sm hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePickupVerify}
                disabled={pickupCode.length !== 4}
                className="flex-1 py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
