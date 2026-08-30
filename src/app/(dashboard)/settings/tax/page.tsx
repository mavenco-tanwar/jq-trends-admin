'use client';

import React, { useState } from 'react';
import { Receipt, Save } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function TaxSettingsPage() {
  const { showToast } = useToast();
  const [gstin, setGstin] = useState('29AABCJ1234F1Z5');
  const [taxInclusive, setTaxInclusive] = useState(true);
  const [apparelGstRate, setApparelGstRate] = useState('5');
  const [luxuryGstRate, setLuxuryGstRate] = useState('12');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('GST & Tax rules saved', 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Compliance &amp; Invoicing
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Goods &amp; Services Tax (GST)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Indian GST slabs (5% under ₹1,000 / 12% above ₹1,000) and GSTIN billing.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Tax Rules</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-rose-400" />
            <span>Merchant GST Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">GSTIN Registration Number *</label>
              <input
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono uppercase"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={(e) => setTaxInclusive(e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <span>All Catalog Prices Are Inclusive of GST</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Garment Tax Slabs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Standard Apparel GST (&lt; ₹1,000)</label>
              <input
                type="text"
                value={`${apparelGstRate}% GST (CGST 2.5% + SGST 2.5%)`}
                readOnly
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-800 rounded-lg text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Boutique Luxury Apparel GST (&gt; ₹1,000)</label>
              <input
                type="text"
                value={`${luxuryGstRate}% GST (CGST 6.0% + SGST 6.0%)`}
                readOnly
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-800 rounded-lg text-slate-400 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
