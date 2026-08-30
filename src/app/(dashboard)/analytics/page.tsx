'use client';

import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, BarChart2, Globe, Smartphone, Laptop } from 'lucide-react';
import { FeatureGate } from '@/components/ui/FeatureGate';

export default function AdvancedAnalyticsPage() {
  return (
    <FeatureGate
      featureKey="advancedAnalytics"
      featureName="Advanced Analytics &amp; Cohort Retention"
      featureDescription="Full-funnel conversion tracking, cohort customer retention analytics, real-time GMV forecasting, and device breakdown metrics."
    >
      <div className="space-y-6 pb-20 select-none max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Intelligence &amp; Metrics
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">Advanced Storefront Analytics</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep conversion funnel tracking, customer cohort retention, and revenue projections.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 font-mono">
            Live Stream Active
          </span>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#161822] border border-slate-800 p-5 rounded-xl space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Conversion Rate</div>
            <div className="text-2xl font-black text-white">4.82%</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+1.2% vs last week</span>
            </div>
          </div>

          <div className="bg-[#161822] border border-slate-800 p-5 rounded-xl space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Average Order Value (AOV)</div>
            <div className="text-2xl font-black text-white">₹3,450</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+₹420 from bundles</span>
            </div>
          </div>

          <div className="bg-[#161822] border border-slate-800 p-5 rounded-xl space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Repeat Customer Rate</div>
            <div className="text-2xl font-black text-white">31.4%</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+4.6% cohort lift</span>
            </div>
          </div>

          <div className="bg-[#161822] border border-slate-800 p-5 rounded-xl space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Projected 30-Day GMV</div>
            <div className="text-2xl font-black text-rose-400">₹8,45,000</div>
            <div className="text-xs text-slate-400">Based on trailing velocity</div>
          </div>
        </div>

        {/* Full-Funnel Conversion Matrix */}
        <div className="bg-[#161822] rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            <span>Storefront Conversion Funnel</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-bold uppercase">1. Storefront Visits</div>
              <div className="text-xl font-black text-white">48,200</div>
              <div className="text-[10px] text-slate-500">100% Top of Funnel</div>
            </div>

            <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-bold uppercase">2. Product Views</div>
              <div className="text-xl font-black text-white">24,100</div>
              <div className="text-[10px] text-emerald-400">50.0% Click-through</div>
            </div>

            <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-bold uppercase">3. Added to Bag</div>
              <div className="text-xl font-black text-white">6,800</div>
              <div className="text-[10px] text-emerald-400">28.2% Add-to-Cart</div>
            </div>

            <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-bold uppercase">4. Reached Checkout</div>
              <div className="text-xl font-black text-white">3,200</div>
              <div className="text-[10px] text-amber-400">47.0% Checkout Intent</div>
            </div>

            <div className="p-4 bg-[#10121A] rounded-xl border border-emerald-500/30 space-y-1 bg-emerald-500/5">
              <div className="text-[11px] text-emerald-400 font-bold uppercase">5. Purchased Orders</div>
              <div className="text-xl font-black text-emerald-300">2,320</div>
              <div className="text-[10px] text-emerald-400 font-bold">72.5% Checkout Rate</div>
            </div>
          </div>
        </div>

        {/* Device & Channel Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#161822] rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Traffic by Device Channel</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Mobile Web (iOS &amp; Android)</span>
                  <span>78.4% (37,800 visits)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[78.4%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Desktop &amp; Laptop</span>
                  <span>18.6% (8,960 visits)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[18.6%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Tablet Devices</span>
                  <span>3.0% (1,440 visits)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[3%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161822] rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Top Regional Markets</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#10121A] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-white font-medium">🇮🇳 Mumbai &amp; Pune Region</span>
                <span className="font-mono text-emerald-400 font-bold">₹2,84,000 (34%)</span>
              </div>
              <div className="p-3 bg-[#10121A] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-white font-medium">🇮🇳 Bengaluru &amp; South Tech Corridor</span>
                <span className="font-mono text-emerald-400 font-bold">₹2,12,000 (25%)</span>
              </div>
              <div className="p-3 bg-[#10121A] rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-white font-medium">🇮🇳 Delhi NCR Region</span>
                <span className="font-mono text-emerald-400 font-bold">₹1,95,000 (23%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
