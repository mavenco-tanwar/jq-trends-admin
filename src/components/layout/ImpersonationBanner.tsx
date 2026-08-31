'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, X, ExternalLink } from 'lucide-react';
import { PlatformService, TenantStore } from '@/services/platform';

export function ImpersonationBanner() {
  const [impersonatedTenant, setImpersonatedTenant] = useState<TenantStore | null>(null);

  useEffect(() => {
    const checkState = () => {
      const state = PlatformService.getImpersonationState();
      if (state.isImpersonating && state.tenant) {
        setImpersonatedTenant(state.tenant);
      } else {
        setImpersonatedTenant(null);
      }
    };

    checkState();
    window.addEventListener('storage', checkState);
    return () => window.removeEventListener('storage', checkState);
  }, []);

  const handleExit = () => {
    PlatformService.stopImpersonation();
    setImpersonatedTenant(null);
    window.location.href = '/platform';
  };

  if (!impersonatedTenant) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-xl border-b border-amber-400/30 flex items-center justify-between sticky top-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200 select-none">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
        <span className="font-extrabold tracking-wide uppercase text-[10px] bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
          Superadmin Impersonation
        </span>
        <span className="text-amber-100">
          You are currently managing store <strong>{impersonatedTenant.name}</strong> (<span className="font-mono text-white">{impersonatedTenant.slug}</span>)
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleExit}
          className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 font-bold rounded-lg border border-amber-400/40 transition-all flex items-center gap-1 shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Superadmin Panel</span>
        </button>
      </div>
    </div>
  );
}
