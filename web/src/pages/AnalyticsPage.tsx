import React, { useState } from 'react';

const HEATMAP_DATA = [
  0.15, 0.3, 0.6, 0.85, 0.7, 0.4, 0.2,
  0.2, 0.45, 0.75, 0.95, 0.8, 0.5, 0.25,
  0.3, 0.5, 0.8, 1.0, 0.85, 0.6, 0.3,
  0.25, 0.6, 0.9, 0.9, 0.75, 0.55, 0.35,
  0.2, 0.4, 0.7, 0.8, 0.65, 0.4, 0.2,
  0.1, 0.25, 0.5, 0.6, 0.45, 0.3, 0.15,
];

const DATE_FILTERS = ['Today', 'This Week', 'This Month', 'Last 3 Months'];

const AI_PREDICTIONS = [
  { name: 'Paracetamol 500mg', current: 30, estimated: 50, risk: 'High', icon: 'trending_up', color: 'text-red-600 bg-red-50 border-red-200' },
  { name: 'Amoxicillin 500mg', current: 150, estimated: 120, risk: 'Low', icon: 'trending_flat', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Metformin 850mg', current: 15, estimated: 40, risk: 'Critical', icon: 'trending_up', color: 'text-red-700 bg-red-100 border-red-300' },
];

const SLOW_MOVERS = [
  { name: 'Ibuprofen 400mg', daysSinceLastSale: 62, stock: 200 },
  { name: 'Vitamin C 1000mg', daysSinceLastSale: 45, stock: 150 },
  { name: 'Antacid Syrup', daysSinceLastSale: 38, stock: 80 },
];

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('This Month');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header + Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Pharmacy Performance & Analytics
          </h2>
          <p className="text-sm text-secondary mt-0.5">
            Real-time insights, inventory trends, peak pickup distribution, and AI-powered demand forecasts.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTimeRange(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === f ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: 'ETB 1.2M', change: '+12.5%', icon: 'payments', up: true },
          { label: 'Total Reservations', value: '4,829', change: '+8.2%', icon: 'assignment_turned_in', up: true },
          { label: 'Inventory Value', value: 'ETB 3.8M', change: '12 Low', icon: 'inventory', up: false, warn: true },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary p-2.5 bg-primary/10 rounded-xl">{metric.icon}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${metric.warn ? 'text-on-error bg-error/10' : 'text-emerald-600 bg-emerald-50'}`}>
                <span className="material-symbols-outlined text-[14px]">{metric.warn ? 'warning' : 'trending_up'}</span>
                {metric.change}
              </span>
            </div>
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">{metric.label}</p>
            <h3 className="text-3xl font-bold text-primary mt-1">{metric.value}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Trend Bars */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-lg font-bold text-on-surface">Inventory Trends</h4>
              <p className="text-xs text-secondary mt-0.5">Stock movement over {timeRange.toLowerCase()}</p>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-1.5 border-l-2 border-b-2 border-slate-100 px-2 pb-2">
            {[40, 45, 42, 55, 50, 65, 75, 68, 60, 62, 85, 90, 88, 70, 65].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t-md bg-primary/60 hover:bg-primary transition-all cursor-pointer"
                  style={{ height: `${h}%` }}
                  title={`${h}% activity`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-secondary font-semibold px-2">
            <span>Day 1</span>
            <span>Day 8</span>
            <span>Day 15</span>
          </div>
        </div>

        {/* Peak Pickup Heatmap */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-lg font-bold text-on-surface">Peak Pickup Times</h4>
              <p className="text-xs text-secondary mt-0.5">Hourly distribution of patient reservations</p>
            </div>
            <div className="flex items-center gap-1">
              {[0.15, 0.4, 0.7, 1].map((v) => (
                <div key={v} className="w-3 h-3 rounded" style={{ backgroundColor: `rgba(0,107,44,${v})` }}></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
            {HEATMAP_DATA.map((val, i) => (
              <div
                key={i}
                className="rounded-lg transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: `rgba(0,107,44,${val})` }}
                title={`Activity: ${Math.round(val * 100)}%`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-secondary font-semibold">
            <span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span>
          </div>
        </div>
      </section>

      {/* Fast-Movers + Slow-Movers + Top Customers */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing (Fast Movers) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-lg font-bold text-on-surface mb-2">Fast-Moving Medicines</h4>
          <p className="text-xs text-secondary mb-6">Top-selling products by units sold this period</p>
          <div className="space-y-5">
            {[
              { name: 'Amoxicillin 500mg', units: 1240, pct: 85 },
              { name: 'Metformin 850mg', units: 982, pct: 72 },
              { name: 'Paracetamol 500mg', units: 845, pct: 65 },
              { name: 'Atorvastatin 20mg', units: 612, pct: 48 },
            ].map(({ name, units, pct }) => (
              <div key={name} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-on-surface">{name}</span>
                  <span className="text-xs font-semibold text-secondary">{units.toLocaleString()} sold</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-700 group-hover:opacity-80" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="text-lg font-bold text-on-surface mb-6">Top Customers</h4>
          <div className="space-y-3">
            {[
              { initials: 'AA', name: 'Abebe Alemu', count: 24, top: true },
              { initials: 'MK', name: 'Marta Kebede', count: 19, top: false },
              { initials: 'YT', name: 'Yonas Tadesse', count: 15, top: false },
              { initials: 'HB', name: 'Hirut Bekele', count: 12, top: false },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-2xl transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${c.top ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-secondary'}`}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">{c.name}</p>
                  <p className="text-[11px] text-secondary">{c.count} Reservations</p>
                </div>
                {c.top && <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slow-Moving / Dead Stock */}
      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-bold text-on-surface">Slow-Moving / Dead Stock</h4>
            <p className="text-xs text-secondary mt-0.5">Medicines with no sales activity — review to avoid expiry losses</p>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">{SLOW_MOVERS.length} Items</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SLOW_MOVERS.map((item) => (
            <div key={item.name} className="p-5 rounded-2xl border border-amber-100 bg-amber-50/60">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-amber-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  {item.daysSinceLastSale} days idle
                </span>
              </div>
              <p className="text-sm font-bold text-on-surface">{item.name}</p>
              <p className="text-xs text-secondary mt-1">{item.stock} units in stock</p>
              <p className="text-[11px] text-amber-700 mt-3 font-semibold">⚠ Consider promotions or return to supplier</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Demand Predictions */}
      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-on-surface">AI Demand Predictions</h4>
            <p className="text-xs text-secondary">MedhaNet AI analyzes searches, reservations, and seasonal trends</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {AI_PREDICTIONS.map((pred) => (
            <div key={pred.name} className={`p-5 rounded-2xl border ${pred.color}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-on-surface">{pred.name}</p>
                <span className={`material-symbols-outlined text-xl ${pred.risk === 'High' || pred.risk === 'Critical' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {pred.icon}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary">Current Stock</span>
                  <span className="font-bold text-on-surface">{pred.current} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Est. Demand</span>
                  <span className="font-bold text-on-surface">{pred.estimated} units</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-current/10">
                  <span className="text-secondary">Risk Level</span>
                  <span className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${pred.risk === 'Critical' ? 'bg-red-600 text-white' : pred.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {pred.risk}
                  </span>
                </div>
              </div>
              {pred.risk !== 'Low' && (
                <p className="text-[11px] font-semibold mt-3 pt-3 border-t border-current/10">
                  🤖 Recommendation: Consider restocking immediately.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Growth Banner */}
      <section className="bg-primary-container text-on-primary-container p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-32 h-32 opacity-10 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <div>
            <h4 className="text-xl font-bold">Strong Growth Trend</h4>
            <p className="text-xs opacity-90 max-w-md mt-1 leading-relaxed">
              Your reservations increased by 22% compared to last week. Peak activity recorded on Wednesday between 2 PM – 4 PM.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-center shrink-0">
          <span className="text-5xl font-bold tracking-tight">+22%</span>
          <p className="text-xs uppercase tracking-widest mt-2 font-semibold opacity-90">Weekly Growth</p>
        </div>
      </section>
    </div>
  );
};
