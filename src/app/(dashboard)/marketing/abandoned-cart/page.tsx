'use client';

import React, { useState } from 'react';
import { ShoppingBag, Mail, RefreshCw, Send, DollarSign, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { useToast } from '@/lib/toast-context';

interface AbandonedCartItem {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; quantity: number; price: number; image: string }[];
  totalAmount: number;
  abandonedAt: string;
  recoveryStatus: 'pending' | 'email_sent' | 'recovered';
}

const MOCK_ABANDONED_CARTS: AbandonedCartItem[] = [
  {
    id: 'cart_101',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.s@example.com',
    items: [
      { title: 'Hand-Carved Walnut Credenza', quantity: 1, price: 14500, image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200' },
      { title: 'Sculptural Ceramic Pendant', quantity: 2, price: 4200, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200' }
    ],
    totalAmount: 22900,
    abandonedAt: '25m ago',
    recoveryStatus: 'pending',
  },
  {
    id: 'cart_102',
    customerName: 'Rohan Mehta',
    customerEmail: 'rohan.mehta@example.com',
    items: [
      { title: 'Organic Belgian Linen Duvet Set', quantity: 1, price: 8900, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200' }
    ],
    totalAmount: 8900,
    abandonedAt: '2h ago',
    recoveryStatus: 'email_sent',
  },
  {
    id: 'cart_103',
    customerName: 'Priya Sen',
    customerEmail: 'priya.sen@example.com',
    items: [
      { title: 'Nordic Minimalist Oak Lounge Chair', quantity: 1, price: 18500, image: 'https://images.unsplash.com/photo-1580481077197-9b2f676f2f2c?w=200' }
    ],
    totalAmount: 18500,
    abandonedAt: '5h ago',
    recoveryStatus: 'recovered',
  }
];

export default function AbandonedCartPage() {
  const { showToast } = useToast();
  const [carts, setCarts] = useState<AbandonedCartItem[]>(MOCK_ABANDONED_CARTS);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendRecoveryEmail = async (cart: AbandonedCartItem) => {
    setSendingId(cart.id);
    try {
      // Simulate real recovery email dispatch
      await new Promise((r) => setTimeout(r, 900));
      setCarts((prev) =>
        prev.map((c) => (c.id === cart.id ? { ...c, recoveryStatus: 'email_sent' } : c))
      );
      showToast(`Recovery email & discount link dispatched to ${cart.customerEmail}!`, 'success');
    } catch {
      showToast('Failed to dispatch recovery email', 'error');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <FeatureGate
      featureKey="abandonedCart"
      featureName="Abandoned Cart Recovery Engine"
      featureDescription="Automated shopper re-engagement workflows, real-time checkout drop-off recovery, and scheduled SMTP discount reminders."
    >
      <div className="space-y-6 pb-20 select-none max-w-6xl">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Marketing Automation
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">Abandoned Cart Recovery</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Re-engage high-intent customers with automated checkout reminders and dynamic incentives.
            </p>
          </div>

          <button
            onClick={() => showToast('Automated recovery cron is active (Sends after 1hr & 24hrs)', 'info')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg shadow transition-all"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Auto-Schedule: Active</span>
          </button>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">At-Risk Abandoned GMV</div>
            <div className="text-2xl font-black text-white">₹50,300</div>
            <div className="text-[10px] text-amber-400 font-medium">3 Active Unfinished Sessions</div>
          </div>

          <div className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Recovered Revenue (MTD)</div>
            <div className="text-2xl font-black text-emerald-400">₹18,500</div>
            <div className="text-[10px] text-emerald-400 font-medium">36.7% Recovery Rate</div>
          </div>

          <div className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Recovery Email Open Rate</div>
            <div className="text-2xl font-black text-sky-400">68.4%</div>
            <div className="text-[10px] text-slate-500">Delivered via Transactional SMTP</div>
          </div>
        </div>

        {/* Abandoned Sessions List */}
        <div className="bg-[#161822] rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>Recent Abandoned Checkout Sessions</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{carts.length} Sessions</span>
          </div>

          <div className="space-y-3">
            {carts.map((cart) => (
              <div
                key={cart.id}
                className="p-4 rounded-xl bg-[#10121A] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{cart.customerName}</span>
                    <span className="text-[11px] font-mono text-slate-400">({cart.customerEmail})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        cart.recoveryStatus === 'recovered'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : cart.recoveryStatus === 'email_sent'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {cart.recoveryStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{cart.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}</span>
                    <span>•</span>
                    <span className="font-bold text-white font-mono">₹{cart.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Abandoned {cart.abandonedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {cart.recoveryStatus === 'recovered' ? (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Order Completed</span>
                    </span>
                  ) : (
                    <>
                      <a
                        href={`https://wa.me/918239019096?text=${encodeURIComponent(
                          `Hi ${cart.customerName}! We noticed you left ${cart.items[0]?.title} in your shopping bag. Complete your order now with coupon VIP10 for an extra 10% off: https://mavenco-storefront.vercel.app/cart`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
                        title="Send Instant WhatsApp Recovery Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp VIP</span>
                      </a>

                      <button
                        onClick={() => handleSendRecoveryEmail(cart)}
                        disabled={sendingId === cart.id}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingId === cart.id ? 'Dispatching...' : cart.recoveryStatus === 'email_sent' ? 'Resend Email' : 'Send Email'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
