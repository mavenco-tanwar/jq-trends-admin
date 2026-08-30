'use client';

import React, { useState } from 'react';
import { Truck, Save, Plus, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function ShippingSettingsPage() {
  const { showToast } = useToast();
  const [freeThreshold, setFreeThreshold] = useState('999');
  const [standardRate, setStandardRate] = useState('99');
  const [expressRate, setExpressRate] = useState('199');
  const [enableCod, setEnableCod] = useState(true);
  const [codExtraFee, setCodExtraFee] = useState('49');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Shipping delivery rates saved', 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Logistics &amp; Rates
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Shipping &amp; Delivery Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure free shipping order thresholds, express courier surcharges, and COD rates.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-rose-400" />
            <span>Pan-India Delivery Thresholds</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Free Shipping Threshold (₹) *</label>
              <input
                type="number"
                required
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Orders above this qualify for free shipping.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={standardRate}
                onChange={(e) => setStandardRate(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Express Air Delivery (₹)</label>
              <input
                type="number"
                value={expressRate}
                onChange={(e) => setExpressRate(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cash On Delivery (COD) Options</h3>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={enableCod}
                onChange={(e) => setEnableCod(e.target.checked)}
                className="accent-rose-600 rounded"
              />
              <span>Enable Cash on Delivery (COD) at Checkout</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">COD Handling Surcharge:</span>
              <input
                type="number"
                value={codExtraFee}
                onChange={(e) => setCodExtraFee(e.target.value)}
                className="w-20 px-2 py-1 bg-[#10121A] border border-slate-700 rounded text-white font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
