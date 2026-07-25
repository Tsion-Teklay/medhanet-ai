import React from 'react';

interface FABProps {
  onOpenScan: () => void;
}

export const FAB: React.FC<FABProps> = ({ onOpenScan }) => {
  return (
    <button
      onClick={onOpenScan}
      aria-label="Verify Patient OTP Code"
      className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl hover:shadow-2xl hover:bg-primary-container transition-all active:scale-95 z-50 flex items-center justify-center group cursor-pointer"
    >
      <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>
        verified
      </span>
      <span className="absolute right-16 bg-on-surface text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
        Verify Patient OTP
      </span>
    </button>
  );
};
