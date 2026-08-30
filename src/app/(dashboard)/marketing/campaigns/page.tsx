'use client';

import React from 'react';
import Link from 'next/link';
import { Megaphone, Plus, Sparkles, Calendar, Tag } from 'lucide-react';

export default function CampaignsPage() {
  const campaigns = [
    { id: '1', title: 'Spring / Summer 2026 Launch', status: 'Active', target: 'Women & Kids', discount: '15% Off', ends: '31 March 2026' },
    { id: '2', title: 'Festive Chanderi Drop', status: 'Scheduled', target: 'Ethnic Wear', discount: 'Flat ₹500 Off', ends: '15 April 2026' },
    { id: '3', title: 'Free Express Delivery Weekend', status: 'Draft', target: 'All Orders > ₹999', discount: 'Free Shipping', ends: 'Weekend Only' },
  ];

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Growth &amp; Acquisition
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Marketing Campaigns</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate multi-channel seasonal drops, push promotions, and customer vouchers.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all">
          <Plus className="w-4 h-4" />
          <span>+ Create Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                {c.status}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">{c.ends}</span>
            </div>
            <h3 className="text-base font-bold text-white">{c.title}</h3>
            <div className="text-slate-400 space-y-1">
              <div>Target: <strong className="text-white">{c.target}</strong></div>
              <div>Offer: <strong className="text-rose-300">{c.discount}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
