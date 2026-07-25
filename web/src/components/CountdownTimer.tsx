import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  /** Total minutes given to the patient for pickup */
  totalMinutes: number;
  /** Show a compact single-line version (for cards) vs full display */
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ totalMinutes, compact = false }) => {
  // We initialize with the full duration each time this component mounts.
  // In a real backend, the server would send the *remaining* seconds, not the total.
  // TODO: Replace initialSeconds with `reservation.remainingSeconds` from backend.
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset when totalMinutes changes (new reservation selected)
    setSecondsLeft(totalMinutes * 60);
  }, [totalMinutes]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [secondsLeft === totalMinutes * 60]); // re-attach only on reset

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const totalSecs = totalMinutes * 60;
  const pct = secondsLeft / totalSecs;

  // Color transitions: green > 50%, amber 20-50%, red < 20%
  const colorClass =
    pct > 0.5
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : pct > 0.2
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-red-700 bg-red-50 border-red-200 animate-pulse';

  const dotColor =
    pct > 0.5 ? 'bg-emerald-500' : pct > 0.2 ? 'bg-amber-500' : 'bg-red-500';

  const expired = secondsLeft <= 0;

  if (expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
        <span className="material-symbols-outlined text-[13px]">timer_off</span>
        EXPIRED
      </span>
    );
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></span>
        <span className="material-symbols-outlined text-[12px]">timer</span>
        {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  // Full display with ring
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - pct);
  const strokeColor = pct > 0.5 ? '#16a34a' : pct > 0.2 ? '#d97706' : '#dc2626';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 52 52">
          {/* Track */}
          <circle cx="26" cy="26" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          {/* Progress arc */}
          <circle
            cx="26"
            cy="26"
            r="22"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color: strokeColor }}>
            {hours > 0 ? `${pad(hours)}:${pad(minutes)}` : `${pad(minutes)}:${pad(seconds)}`}
          </span>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pct < 0.2 ? 'animate-ping' : 'animate-pulse'}`}></span>
        {pct > 0.5 ? 'On Time' : pct > 0.2 ? 'Running Low' : 'URGENT'}
      </div>
    </div>
  );
};
