'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';

interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  items: string;
  cartTotal: number;
  timeAgo: string;
  step: 'Address Filled' | 'Payment Failed' | 'Cart Reviewed';
  status: 'pending' | 'recovered' | 'contacted';
}

export default function AbandonedCartsPage() {
  const { showToast } = useToast();
  const [carts, setCarts] = useState<AbandonedCart[]>([
    {
      id: 'ab_101',
      customerName: 'Pooja Sharma',
      phone: '+91 98201 44892',
      items: 'Banarasi Katan Silk Saree (Plum)',
      cartTotal: 2999,
      timeAgo: '18 mins ago',
      step: 'Payment Failed',
      status: 'pending',
    },
    {
      id: 'ab_102',
      customerName: 'Rahul Mehta',
      phone: '+91 99302 11840',
      items: 'Lumina Travertine Table Lamp',
      cartTotal: 4499,
      timeAgo: '42 mins ago',
      step: 'Address Filled',
      status: 'pending',
    },
    {
      id: 'ab_103',
      customerName: 'Sneha Kapoor',
      phone: '+91 98114 90218',
      items: 'Carbon Plate Runner Pro (Size UK 6)',
      cartTotal: 3299,
      timeAgo: '2 hours ago',
      step: 'Cart Reviewed',
      status: 'recovered',
    },
    {
      id: 'ab_104',
      customerName: 'Ananya Verma',
      phone: '+91 97182 33419',
      items: 'Chikankari Georgette Kurta Set',
      cartTotal: 1899,
      timeAgo: '4 hours ago',
      step: 'Address Filled',
      status: 'pending',
    },
  ]);

  const totalRecoverable = carts.reduce((acc, c) => acc + (c.status === 'pending' ? c.cartTotal : 0), 0);
  const totalRecovered = carts.reduce((acc, c) => acc + (c.status === 'recovered' ? c.cartTotal : 0), 0);

  const handleSendRecoveryWhatsApp = (cart: AbandonedCart) => {
    const cleanPhone = cart.phone.replace(/[^0-9]/g, '');
    const text = `Hi ${cart.customerName}! ✨ We noticed you left the *${cart.items}* (₹${cart.cartTotal.toLocaleString('en-IN')}) in your bag.\n\nUse secret code *RECOVER10* for an extra 10% off + Free Express Shipping! 🛍️\n\nComplete your order in 1 click here: https://mavenco-storefront.vercel.app/stores/demo?coupon=RECOVER10`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    setCarts(carts.map((c) => (c.id === cart.id ? { ...c, status: 'contacted' } : c)));
    showToast(`WhatsApp recovery nudge sent to ${cart.customerName}!`, 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            Revenue Recovery Engine
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Abandoned Checkouts &amp; WhatsApp Recovery</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated and manual 1-click WhatsApp cart recovery sequences with instant discount links.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#161822] rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-rose-400 font-mono">
            Recoverable Cart Value
          </div>
          <div className="text-2xl font-black font-mono text-white">₹{totalRecoverable.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-400">{carts.filter((c) => c.status === 'pending').length} checkouts awaiting recovery</div>
        </div>

        <div className="p-4 bg-[#161822] rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-400 font-mono">
            Recovered Revenue (Past 7d)
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">₹{totalRecovered.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-400">38.4% recovery conversion rate</div>
        </div>

        <div className="p-4 bg-[#161822] rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-sky-400 font-mono">
            Auto-Nudge Delivery
          </div>
          <div className="text-2xl font-black font-mono text-white">99.8%</div>
          <div className="text-[11px] text-slate-400">Meta WhatsApp Cloud Ingress</div>
        </div>
      </div>

      {/* Cart List Table */}
      <div className="bg-[#161822] rounded-xl border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 bg-[#141620] border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-300">
            Recent Dropped Checkouts (Past 24 Hours)
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Live Queue</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          {carts.map((cart) => (
            <div key={cart.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1A1D2B] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{cart.customerName}</span>
                  <span className="font-mono text-[11px] text-slate-400">{cart.phone}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    cart.status === 'recovered'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : cart.status === 'contacted'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {cart.status}
                  </span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Cart:</span> {cart.items}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{cart.timeAgo}</span>
                  </span>
                  <span>•</span>
                  <span>Drop Step: <strong className="text-slate-300">{cart.step}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-emerald-400">₹{cart.cartTotal.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-500">Cart Total</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendRecoveryWhatsApp(cart)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Recovery</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
