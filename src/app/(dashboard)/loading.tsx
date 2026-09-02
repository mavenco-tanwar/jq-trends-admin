'use client';

import React, { useEffect, useState } from 'react';
import { PlatformService } from '@/services/platform';

export default function DashboardLoading() {
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
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-rose-500 border-r-indigo-500 animate-spin" />
        <div className="absolute w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-md text-[10px] font-bold text-white">
          {emblemInitial || <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </div>
      </div>
      <div className="text-center space-y-1">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          {storeName ? `${storeName} Workspace` : 'Loading Module'}
        </h4>
        <p className="text-[11px] text-slate-400">
          Syncing data and platform settings...
        </p>
      </div>
    </div>
  );
}
