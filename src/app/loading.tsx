'use client';

import React, { useEffect, useState } from 'react';
import { PlatformService } from '@/services/platform';

export default function Loading() {
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    try {
      const activeTenant = PlatformService.getActiveTenant();
      if (activeTenant?.name) {
        setStoreName(activeTenant.name);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const emblemInitial = storeName ? storeName.trim().charAt(0).toUpperCase() : '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F1117] text-white">
      {/* Top Animated Gradient Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-purple-500 animate-pulse" />

      {/* Admin Orb & Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Glowing pulse ring */}
        <div className="w-20 h-20 rounded-full border border-indigo-500/30 animate-ping absolute" />
        
        {/* Spinning gradient ring */}
        <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-rose-500 border-r-indigo-500 animate-spin" />
        
        {/* Central Dynamic Badge */}
        <div className="absolute w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-950/60 font-mono font-bold text-xs">
          {emblemInitial || <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        </div>
      </div>

      {/* Dynamic Status & Loader Label */}
      <div className="mt-6 text-center space-y-1.5 px-4">
        {storeName ? (
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {storeName} Admin
          </h3>
        ) : (
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse mx-auto" />
        )}
        <p className="text-[11px] text-slate-400 font-sans animate-pulse">
          Loading workspace &amp; store configuration...
        </p>
      </div>
    </div>
  );
}
