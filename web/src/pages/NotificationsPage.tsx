import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import type { Notification, TabType } from '../types/pharmacy';

const TYPE_TABS = ['All', 'Inventory', 'Reservations', 'Prescriptions', 'AI', 'System'];

const typeStyle: Record<Notification['type'], { bg: string; text: string; icon: string }> = {
  Inventory: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
  Reservation: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
  Prescription: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  AI: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  System: { bg: 'bg-surface-container-high', text: 'text-secondary', icon: 'text-secondary' },
};

interface NotificationsPageProps {
  setActiveTab: (tab: TabType) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ setActiveTab }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePharmacy();
  const [activeFilter, setActiveFilter] = useState('All');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Reservations') return n.type === 'Reservation';
    if (activeFilter === 'Prescriptions') return n.type === 'Prescription';
    return n.type === activeFilter;
  });

  const handleNotificationClick = (notif: Notification) => {
    markNotificationRead(notif.id);
    if (notif.linkTab) {
      setActiveTab(notif.linkTab);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
            Notifications & Alerts
            {unreadCount > 0 && (
              <span className="text-base font-bold bg-primary text-on-primary px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-secondary mt-0.5">Stay on top of inventory alerts, patient reservations, and AI-powered insights.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-base">done_all</span>
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TYPE_TABS.map((tab) => {
          const count = tab === 'All'
            ? notifications.filter((n) => !n.isRead).length
            : notifications.filter((n) => !n.isRead && (
              tab === 'Reservations' ? n.type === 'Reservation' :
              tab === 'Prescriptions' ? n.type === 'Prescription' :
              n.type === tab
            )).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === tab ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center text-secondary">
            <span className="material-symbols-outlined text-4xl block mb-3 text-outline-variant">notifications_off</span>
            <p className="font-semibold text-sm">No notifications in this category</p>
          </div>
        )}

        {filtered.map((notif) => {
          const style = typeStyle[notif.type];
          return (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`group bg-white rounded-3xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md flex items-start gap-5 ${
                !notif.isRead ? 'border-primary/20 ring-1 ring-primary/10' : 'border-slate-100'
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${style.bg}`}>
                <span className={`material-symbols-outlined text-xl ${style.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {notif.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold leading-snug ${!notif.isRead ? 'text-on-surface' : 'text-on-surface/70'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-secondary mt-1 leading-relaxed line-clamp-2">{notif.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!notif.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1"></div>}
                    <span className="text-[11px] text-secondary whitespace-nowrap">{notif.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>{notif.type}</span>
                  {notif.linkTab && (
                    <span className="text-[11px] text-primary font-semibold flex items-center gap-1 group-hover:underline">
                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      View {notif.linkTab === 'bulk-import' ? 'Bulk Import' : notif.linkTab.charAt(0).toUpperCase() + notif.linkTab.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
