import React from 'react';
import type { TabType } from '../types/pharmacy';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  notificationCount?: number;
  prescriptionCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  notificationCount = 0,
  prescriptionCount = 0,
}) => {
  const items: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'inventory', label: 'Stock', icon: 'inventory_2' },
    { id: 'reservations', label: 'Orders', icon: 'event_available' },
    { id: 'prescriptions', label: 'Rx', icon: 'receipt_long', badge: prescriptionCount },
    { id: 'notifications', label: 'Alerts', icon: 'notifications', badge: notificationCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-2 bg-surface-container-lowest border-t border-outline-variant/40 z-50 shadow-lg">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all cursor-pointer ${
              isActive
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'text-on-secondary-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-[11px] leading-tight">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-on-primary rounded-full text-[9px] font-bold flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
