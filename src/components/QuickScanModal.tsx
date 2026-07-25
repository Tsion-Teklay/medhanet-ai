import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (result: string) => void;
}

export const QuickScanModal: React.FC<QuickScanModalProps> = ({ isOpen, onClose }) => {
  const { reservations, completeReservation } = usePharmacy();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundReservation, setFoundReservation] = useState<typeof reservations[0] | null>(null);

  if (!isOpen) return null;

  const handleLookup = () => {
    setIsSearching(true);
    setError('');
    setFoundReservation(null);

    setTimeout(() => {
      setIsSearching(false);
      const matched = reservations.find((r) => r.pickupCode === code && r.status !== 'Completed');
      if (matched) {
        setFoundReservation(matched);
      } else {
        setError('No active reservation found for this OTP. Please verify the code.');
      }
    }, 800);
  };

  const handleConfirmPickup = () => {
    if (!foundReservation) return;
    completeReservation(foundReservation.id);
    onClose();
    setCode('');
    setFoundReservation(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden relative">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verify Reservation OTP
            </h3>
            <button
              onClick={() => {
                onClose();
                setCode('');
                setError('');
                setFoundReservation(null);
              }}
              className="w-8 h-8 rounded-full bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {!foundReservation ? (
            /* OTP Input Form */
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-secondary mb-2 text-center uppercase tracking-wider">
                  Enter 4-Digit Patient Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="Code"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] border-2 border-outline-variant/40 rounded-2xl py-4 outline-none focus:border-primary transition-colors"
                />
                {error && (
                  <p className="text-xs text-error text-center mt-3 font-semibold">{error}</p>
                )}
                <p className="text-[11px] text-secondary text-center mt-3">
                  Ask the patient for the code from their MedhaNet app. Demo: <strong>1234</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    setCode('');
                    setError('');
                  }}
                  className="flex-1 py-3 border border-outline-variant/40 text-secondary rounded-2xl font-semibold text-sm hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLookup}
                  disabled={code.length !== 4 || isSearching}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Details & Confirmation */
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                  <span className="text-xs font-bold text-primary">OTP verified</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Code: {foundReservation.pickupCode}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-secondary">Patient</label>
                  <p className="text-sm font-bold text-on-surface">{foundReservation.patientName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Medicine</label>
                    <p className="text-xs font-semibold text-on-surface">{foundReservation.medicineName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Quantity</label>
                    <p className="text-xs font-semibold text-on-surface">{foundReservation.quantity} units</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Pickup Deadline</label>
                    <p className="text-xs font-bold text-amber-700">{foundReservation.pickupDeadline}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Total Due</label>
                    <p className="text-xs font-bold text-primary">ETB {foundReservation.amountETB.toFixed(2)}</p>
                  </div>
                </div>
                {foundReservation.distanceKm !== undefined && (
                  <div className="pt-2 border-t border-primary/10 flex items-center gap-2 text-xs font-semibold text-primary">
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    <span>Patient is {foundReservation.distanceKm} km away from your shop.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setFoundReservation(null)}
                  className="flex-1 py-3 border border-outline-variant/40 text-secondary rounded-2xl font-semibold text-sm hover:bg-surface-container-low transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPickup}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Confirm & Release
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
