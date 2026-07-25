import React from 'react';
import type { TabType } from '../types/pharmacy';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  reservationCount?: number;
  lowStockCount?: number;
  prescriptionCount?: number;
  notificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  reservationCount = 0,
  lowStockCount = 0,
  prescriptionCount = 0,
  notificationCount = 0,
}) => {
  const navItems: { id: TabType; label: string; icon: string; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2', badge: lowStockCount, badgeColor: 'bg-error-container text-on-error-container' },
    { id: 'bulk-import', label: 'Bulk Import', icon: 'upload_file' },
    { id: 'reservations', label: 'Reservations', icon: 'event_available', badge: reservationCount, badgeColor: 'bg-primary-container text-on-primary-container' },
    { id: 'prescriptions', label: 'Prescriptions', icon: 'receipt_long', badge: prescriptionCount, badgeColor: 'bg-blue-100 text-blue-700' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: notificationCount, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full z-40 hidden md:flex w-64 flex-col border-r border-outline-variant/30 bg-surface-container-low pt-20">
      <div className="px-6 py-2">
        <span className="text-xs uppercase tracking-wider text-secondary font-medium">Main Navigation</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant/30 space-y-3">
        <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>MedhaNet Secure v2.4</span>
          </div>
          <p className="text-[11px] text-secondary mt-1">Ethiopian FDA & Clinical Compliant</p>
        </div>
        <div className="h-1.5 tilet-border w-full rounded-full opacity-30"></div>
      </div>
    </aside>
  );
};
