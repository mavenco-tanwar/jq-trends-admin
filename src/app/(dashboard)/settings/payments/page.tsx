'use client';

import React, { useState } from 'react';
import { CreditCard, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function PaymentsPage() {
  const { showToast } = useToast();
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayKey, setRazorpayKey] = useState('rzp_live_jqtrends_94829471');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [upiQrEnabled, setUpiQrEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Payment gateways configuration saved', 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Checkout Gateways
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Payment Gateways &amp; UPI</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Process UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and COD.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Gateways</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Razorpay Card */}
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                RZP
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Razorpay India (Cards, UPI, Netbanking)</h3>
                <div className="text-[11px] text-slate-400">Instant settlements, auto-refunds &amp; instant OTPs</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={razorpayEnabled}
                onChange={(e) => setRazorpayEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {razorpayEnabled && (
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Secret</label>
                <input
                  type="password"
                  value="••••••••••••••••••••••••"
                  readOnly
                  className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* UPI Direct Gateway */}
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                UPI
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Direct UPI Deep Links (GPay, PhonePe, BHIM)</h3>
                <div className="text-[11px] text-slate-400">Zero transaction fees for merchant</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={upiQrEnabled}
              onChange={(e) => setUpiQrEnabled(e.target.checked)}
              className="accent-rose-600 w-5 h-5 rounded cursor-pointer"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
