'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { PlatformService, TenantPlan } from '@/services/platform';

interface FeatureGateProps {
  featureKey: keyof TenantPlan['features'];
  featureName: string;
  featureDescription: string;
  children: React.ReactNode;
}

export function FeatureGate({
  featureKey,
  featureName,
  featureDescription,
  children,
}: FeatureGateProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<TenantPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkFeature = async () => {
      try {
        const activeTenant = PlatformService.getActiveTenant();
        const plans = await PlatformService.listPlans();
        
        let plan = plans.find((p) => p.id === activeTenant?.planId) || plans[1]; // default pro
        setCurrentPlan(plan);

        if (plan && plan.features && plan.features[featureKey] !== undefined) {
          setIsEnabled(plan.features[featureKey]);
        } else {
          setIsEnabled(true);
        }
      } catch {
        setIsEnabled(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkFeature();
  }, [featureKey]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Checking feature access...</div>;
  }

  if (isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 select-none">
      <div className="bg-gradient-to-br from-[#161822] via-[#12141F] to-[#1a1324] border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Professional &amp; Enterprise Feature
          </span>
          <h2 className="text-2xl font-black text-white">{featureName} is Locked</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {featureDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-xs text-left">
          <div className="p-3 bg-[#0C0E15]/80 rounded-xl border border-slate-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Included in Professional Scale</span>
          </div>
          <div className="p-3 bg-[#0C0E15]/80 rounded-xl border border-slate-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">Zero Maintenance Downtime</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/platform?tab=plans"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Enable in Superadmin Plans</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
