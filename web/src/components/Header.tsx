import React, { useState } from 'react';
import type { PharmacyProfile, TabType } from '../types/pharmacy';

interface HeaderProps {
  profile: PharmacyProfile;
  activeTab: TabType;
  onLogout: () => void;
  onTogglePharmacyStatus?: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, activeTab, onLogout, onTogglePharmacyStatus }) => {
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(profile.isOpen ?? true);

  const toggleStatus = () => {
    const newStatus = !isPharmacyOpen;
    setIsPharmacyOpen(newStatus);
    onTogglePharmacyStatus?.(newStatus);
  };

  const tabLabel = activeTab === 'bulk-import' ? 'Bulk Import' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface dark:bg-inverse-surface border-b border-outline-variant/30 h-16 flex justify-between items-center px-4 md:px-8">
      {/* Left: Logo & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl text-on-primary font-bold text-2xl shadow-sm">
          መ
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg md:text-xl text-primary tracking-tight leading-tight">
            MedhaNet AI Pharmacy
          </h1>
          <span className="text-xs text-secondary hidden sm:inline-block">
            {tabLabel} Module
          </span>
        </div>
      </div>

      {/* Right: Status Toggle + Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Pharmacy Open / Closed Toggle */}
        <button
          onClick={toggleStatus}
          className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
            isPharmacyOpen
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isPharmacyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          Pharmacy {isPharmacyOpen ? 'Open' : 'Closed'}
        </button>

        {/* Profile Info */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-on-surface">{profile.name}</span>
          <span className="text-[11px] text-secondary">{profile.staffTitle} · {profile.city}</span>
        </div>

        {/* Avatar + Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-sm transition-transform active:scale-95">
            <img className="w-full h-full object-cover" src={profile.avatarUrl} alt={profile.name} />
          </div>
          <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-outline-variant/30 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
            <div className="px-4 py-2.5 border-b border-outline-variant/20">
              <p className="text-xs font-bold text-on-surface">{profile.name}</p>
              <p className="text-[10px] text-secondary mt-0.5">{profile.location}</p>
            </div>
            {/* Mobile-only status toggle in dropdown */}
            <button
              onClick={toggleStatus}
              className={`md:hidden w-full px-4 py-2.5 text-left text-xs font-semibold flex items-center gap-2 transition-colors border-b border-outline-variant/10 ${
                isPharmacyOpen ? 'text-emerald-700 hover:bg-emerald-50' : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isPharmacyOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              Mark as {isPharmacyOpen ? 'Closed' : 'Open'}
            </button>
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-left text-xs text-error hover:bg-error/5 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
