import React, { useState } from 'react';
import type { PharmacyProfile } from '../types/pharmacy';

interface SettingsPageProps {
  profile: PharmacyProfile;
}

type SettingTab = 'info' | 'location' | 'hours' | 'docs' | 'alerts' | 'security';

export const SettingsPage: React.FC<SettingsPageProps> = ({ profile }) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingTab>('info');

  // Operational Settings Preferences
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [reservationAlerts, setReservationAlerts] = useState(true);
  const [prescriptionAlerts, setPrescriptionAlerts] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);

  // Security Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Verification status document list
  const docsList = [
    { label: 'Certificate of Competency (CoC)', status: 'Approved', style: 'text-emerald-700 bg-emerald-50 border-emerald-200', num: 'CoC-88219-ET', expiry: 'Aug 12, 2027' },
    { label: 'Pharmacy Business License', status: 'Approved', style: 'text-emerald-700 bg-emerald-50 border-emerald-200', num: 'LIC-2024-998', expiry: 'Dec 30, 2026' },
    { label: 'Pharmacist Professional License', status: 'Approved', style: 'text-emerald-700 bg-emerald-50 border-emerald-200', num: 'PPL-10023-AM', expiry: 'Jan 15, 2027' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
          Pharmacy Profile & Settings
        </h2>
        <p className="text-xs md:text-sm text-secondary mt-0.5">
          Manage pharmacy identity, operating hours, compliance licenses, and alert preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sub Navigation Settings Tabs */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar border-b lg:border-b-0 lg:border-r border-outline-variant/30 pb-4 lg:pb-0 lg:pr-4">
          {[
            { id: 'info', label: 'Pharmacy Info', icon: 'storefront' },
            { id: 'location', label: 'Location & Map', icon: 'location_on' },
            { id: 'hours', label: 'Operating Hours', icon: 'schedule' },
            { id: 'docs', label: 'Verification Docs', icon: 'verified_user' },
            { id: 'alerts', label: 'Alert Preferences', icon: 'notifications_active' },
            { id: 'security', label: 'Security & 2FA', icon: 'security' },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SettingTab)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer text-left ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          
          {/* TAB 1: PHARMACY INFO */}
          {activeSubTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Pharmacy Details</h3>
                <p className="text-xs text-secondary mt-0.5">Basic information about your business entity.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Official Pharmacy Name</label>
                    <input type="text" readOnly value={profile.name} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Owner / Manager Full Name</label>
                    <input type="text" readOnly value="Abebe Kebede" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">TIN Number</label>
                    <input type="text" readOnly value="123456789" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-mono text-on-surface" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Business Registration Number</label>
                    <input type="text" readOnly value="REG-2024-ET-0001" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-mono text-on-surface" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Pharmacy Designation / Role</label>
                  <input type="text" readOnly value={profile.staffTitle} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & MAP */}
          {activeSubTab === 'location' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Store Location</h3>
                <p className="text-xs text-secondary mt-0.5">Physical address and geo-coordinates for the patient search distance.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Region</label>
                    <input type="text" readOnly value="Addis Ababa" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">City</label>
                    <input type="text" readOnly value={profile.city} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Sub-City</label>
                    <input type="text" readOnly value="Bole" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">Woreda</label>
                    <input type="text" readOnly value="Woreda 03" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">GPS Latitude</label>
                    <input type="text" readOnly value="9.005401" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">GPS Longitude</label>
                    <input type="text" readOnly value="38.763611" className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm font-semibold text-on-surface" />
                  </div>
                </div>
                <div className="rounded-2xl border border-outline-variant/30 overflow-hidden h-40 bg-surface-container-low flex items-center justify-center">
                  <div className="text-center text-secondary">
                    <span className="material-symbols-outlined text-3xl mb-1 text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                    <p className="text-xs font-semibold">📍 Store Location Pin</p>
                    <p className="text-[10px]">Google Maps View</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATING HOURS */}
          {activeSubTab === 'hours' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Store Operating Hours</h3>
                <p className="text-xs text-secondary mt-0.5">Configured hours visible to patients on MedhaNet app.</p>
              </div>
              <div className="space-y-3">
                {[
                  { day: 'Monday', hours: '08:00 AM – 10:00 PM' },
                  { day: 'Tuesday', hours: '08:00 AM – 10:00 PM' },
                  { day: 'Wednesday', hours: '08:00 AM – 10:00 PM' },
                  { day: 'Thursday', hours: '08:00 AM – 10:00 PM' },
                  { day: 'Friday', hours: '08:00 AM – 10:00 PM' },
                  { day: 'Saturday', hours: '09:00 AM – 08:00 PM' },
                  { day: 'Sunday', hours: '09:00 AM – 06:00 PM' },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-2.5 border-b border-outline-variant/20 last:border-none">
                    <span className="text-xs font-bold text-on-surface">{item.day}</span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION DOCUMENTS */}
          {activeSubTab === 'docs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Compliance & Licenses</h3>
                <p className="text-xs text-secondary mt-0.5">Documents verified by the MedhaNet AI Admin Portal.</p>
              </div>
              <div className="space-y-4">
                {docsList.map((doc) => (
                  <div key={doc.label} className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-on-surface">{doc.label}</p>
                      <p className="text-[11px] text-secondary mt-0.5">Doc ID: <strong className="font-mono">{doc.num}</strong> · Expires: {doc.expiry}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border self-start sm:self-auto ${doc.style}`}>
                      ✓ {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ALERT PREFERENCES */}
          {activeSubTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Notification Preferences</h3>
                <p className="text-xs text-secondary mt-0.5">Configure SMS & Portal alert notifications.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Low Stock Alerts', desc: 'Notify when a medicine level falls below its threshold', val: lowStockAlerts, set: setLowStockAlerts },
                  { label: 'Expiry Alerts', desc: 'Notify when medicines are within 90 days of expiry date', val: expiryAlerts, set: setExpiryAlerts },
                  { label: 'New Reservation Alerts', desc: 'Receive real-time notifications for patient medicine reservations', val: reservationAlerts, set: setReservationAlerts },
                  { label: 'Prescription Request Alerts', desc: 'Receive real-time notifications for OCR prescription requests', val: prescriptionAlerts, set: setPrescriptionAlerts },
                  { label: 'AI Demand Forecast Alerts', desc: 'Get smart suggestions when local demand for critical medicines goes up', val: aiAlerts, set: setAiAlerts },
                ].map((pref) => (
                  <label key={pref.label} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high/50 cursor-pointer transition-colors border border-outline-variant/10">
                    <div>
                      <p className="text-xs font-bold text-on-surface">{pref.label}</p>
                      <p className="text-[10px] text-secondary mt-0.5">{pref.desc}</p>
                    </div>
                    <input type="checkbox" checked={pref.val} onChange={(e) => pref.set(e.target.checked)} className="w-5 h-5 accent-primary rounded cursor-pointer shrink-0" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & 2FA */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-on-surface">Security & Authentication</h3>
                <p className="text-xs text-secondary mt-0.5">Update credentials and secure portal sessions.</p>
              </div>

              {/* Change Password Form */}
              <div className="space-y-3 border-b border-outline-variant/20 pb-6">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Change Password</p>
                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 border border-outline-variant/30 rounded-xl text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-outline-variant/30 rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-outline-variant/30 rounded-xl text-xs" />
                  </div>
                </div>
                <button className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer mt-2">
                  Update Password
                </button>
              </div>

              {/* Two-Factor Authentication (2FA) */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                  <div>
                    <p className="font-bold text-xs text-on-surface">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-secondary mt-0.5">Require an SMS code or Google Authenticator PIN at login</p>
                  </div>
                </div>
                <input type="checkbox" checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} className="w-5 h-5 accent-primary rounded cursor-pointer shrink-0" />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
