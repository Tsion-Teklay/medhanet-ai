import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import type { PrescriptionMedicineItem } from '../types/pharmacy';

const STATUS_TABS = ['All', 'New', 'Under Review', 'Available', 'Partially Available', 'Unavailable', 'Completed'];

const statusStyle = (status: string) => {
  const map: Record<string, string> = {
    'New': 'bg-primary/10 text-primary',
    'Under Review': 'bg-amber-50 text-amber-700',
    'Available': 'bg-emerald-50 text-emerald-700',
    'Partially Available': 'bg-blue-50 text-blue-700',
    'Unavailable': 'bg-red-50 text-red-700',
    'Completed': 'bg-surface-container-high text-secondary',
  };
  return map[status] || 'bg-surface-container-high text-secondary';
};

export const PrescriptionRequestsPage: React.FC = () => {
  const { prescriptions, updatePrescriptionStatus } = usePharmacy();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);

  const selectedRx = prescriptions.find((r) => r.id === selectedRxId) || null;
  const filtered = activeFilter === 'All' ? prescriptions : prescriptions.filter((r) => r.status === activeFilter);

  const handleAvailabilityToggle = (medName: string, avail: boolean) => {
    if (!selectedRx) return;
    const updatedMeds = selectedRx.medicines.map((m) =>
      m.name === medName ? { ...m, available: avail } : m
    );
    updatePrescriptionStatus(selectedRx.id, selectedRx.status, updatedMeds);
  };

  const respondToRx = (rxId: string, response: 'Available' | 'Partially Available' | 'Unavailable') => {
    if (!selectedRx) return;
    updatePrescriptionStatus(rxId, response, selectedRx.medicines);
    setSelectedRxId(null);
  };

  const newCount = prescriptions.filter((r) => r.status === 'New').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Prescription Requests</h2>
          <p className="text-sm text-secondary mt-0.5">Review and respond to patient prescription broadcasts and OCR-processed requests.</p>
        </div>
        {newCount > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-2xl text-sm font-bold">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
            {newCount} New
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeFilter === tab ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-secondary">
              <span className="material-symbols-outlined text-4xl block mb-3 text-outline-variant">description</span>
              No prescriptions in this category
            </div>
          )}
          {filtered.map((rx) => (
            <div
              key={rx.id}
              onClick={() => setSelectedRxId(rx.id)}
              className={`bg-white rounded-3xl border shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${selectedRxId === rx.id ? 'border-primary/50 ring-2 ring-primary/20' : 'border-slate-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rx.source === 'OCR' ? 'bg-primary/10' : 'bg-amber-50'}`}>
                    <span className="material-symbols-outlined text-xl" style={{ color: rx.source === 'OCR' ? '#006b2c' : '#b45309' }}>
                      {rx.source === 'OCR' ? 'smart_toy' : 'wifi_tethering'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Prescription #{rx.id}</p>
                    <p className="text-xs text-secondary">Patient #{rx.patientId}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${statusStyle(rx.status)}`}>{rx.status}</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${rx.source === 'OCR' ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'}`}>
                    {rx.source === 'OCR' ? '🤖 OCR Processed' : '📡 Direct Broadcast'}
                  </span>
                  {rx.ocrConfidence !== undefined && (
                    <span className="text-[11px] text-secondary">Confidence: <strong>{rx.ocrConfidence}%</strong></span>
                  )}
                </div>
                <span className="text-[11px] text-secondary">{rx.receivedAt}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {rx.medicines.map((m) => (
                  <span key={m.name} className="text-[11px] bg-surface-container-low border border-outline-variant/20 px-2.5 py-1 rounded-lg text-on-surface">
                    {m.name} × {m.requestedQuantity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-8 h-fit">
          {!selectedRx ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-secondary h-64 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">receipt_long</span>
              <p className="text-sm font-semibold">Select a prescription to review</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Detail Header */}
              <div className="px-7 py-6 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Prescription #{selectedRx.id}</h3>
                  <p className="text-xs text-secondary mt-0.5">Patient #{selectedRx.patientId} · {selectedRx.receivedAt}</p>
                </div>
                <button onClick={() => setSelectedRxId(null)} className="p-2 rounded-xl hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-secondary text-base">close</span>
                </button>
              </div>

              <div className="p-7 space-y-6">
                {/* Source Banner */}
                {selectedRx.source === 'OCR' ? (
                  <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    <div>
                      <p className="text-xs font-bold text-primary">AI OCR Processed</p>
                      <p className="text-[11px] text-secondary">Confidence: <strong>{selectedRx.ocrConfidence}%</strong> — Please verify medicine names and quantities.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <span className="material-symbols-outlined text-amber-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>wifi_tethering</span>
                    <div>
                      <p className="text-xs font-bold text-amber-700">📡 Direct Prescription Request</p>
                      <p className="text-[11px] text-amber-700/80">OCR could not process this prescription. Manual review required.</p>
                    </div>
                  </div>
                )}

                {/* Prescription Image Placeholder */}
                <div className="rounded-2xl bg-surface-container-low border border-outline-variant/20 h-36 flex items-center justify-center">
                  <div className="text-center text-secondary">
                    <span className="material-symbols-outlined text-3xl block mb-1 text-outline-variant">image</span>
                    <p className="text-xs font-semibold">Prescription Image</p>
                    <p className="text-[11px]">Secure image viewer will display here</p>
                  </div>
                </div>

                {/* Medicine Availability Review */}
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Medicine Availability Check</p>
                  <div className="space-y-3">
                    {selectedRx.medicines.map((med: PrescriptionMedicineItem) => (
                      <div key={med.name} className="p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-bold text-on-surface">{med.name}</p>
                            <p className="text-xs text-secondary">Requested: {med.requestedQuantity} unit(s)</p>
                          </div>
                          {med.available === true && <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">✓ Available</span>}
                          {med.available === false && <span className="text-[11px] font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full">✗ Unavailable</span>}
                          {med.available === null && <span className="text-[11px] font-bold text-secondary bg-surface-container-high px-3 py-1.5 rounded-full">Not Reviewed</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAvailabilityToggle(med.name, true)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${med.available === true ? 'bg-emerald-600 text-white' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                          >
                            ✓ Available
                          </button>
                          <button
                            onClick={() => handleAvailabilityToggle(med.name, false)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${med.available === false ? 'bg-red-500 text-white' : 'border border-red-200 text-red-700 hover:bg-red-50'}`}
                          >
                            ✗ Not Available
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                  <button
                    onClick={() => respondToRx(selectedRx.id, 'Available')}
                    className="w-full bg-primary text-on-primary py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    Confirm Availability
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => respondToRx(selectedRx.id, 'Partially Available')}
                      className="py-3 border border-primary/30 text-primary rounded-2xl font-bold text-xs hover:bg-primary/5 transition-all"
                    >
                      Partially Available
                    </button>
                    <button
                      onClick={() => respondToRx(selectedRx.id, 'Unavailable')}
                      className="py-3 border border-error/30 text-error rounded-2xl font-bold text-xs hover:bg-error/5 transition-all"
                    >
                      Not Available
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
