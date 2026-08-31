'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Mail, RefreshCw, Send, DollarSign, Clock, CheckCircle2, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { useToast } from '@/lib/toast-context';

interface AbandonedCartItem {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { title: string; quantity: number; price: number; image: string }[];
  totalAmount: number;
  abandonedAt: string;
  recoveryStatus: 'pending' | 'email_sent' | 'whatsapp_sent' | 'recovered';
}

export default function AbandonedCartPage() {
  const { showToast } = useToast();
  const [carts, setCarts] = useState<AbandonedCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadCartsFromDb = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/marketing/abandoned-carts').then((r) => r.json());
      if (res?.data && Array.isArray(res.data)) {
        setCarts(res.data);
      }
    } catch (e) {
      console.warn('Failed to load abandoned carts from MongoDB Atlas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCartsFromDb();
  }, []);

  const handleSendRecoveryEmail = async (cart: AbandonedCartItem) => {
    setSendingId(cart.id);
    try {
      await fetch('/api/v1/marketing/abandoned-carts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cart.id, recoveryStatus: 'email_sent' }),
      });

      setCarts((prev) =>
        prev.map((c) => (c.id === cart.id ? { ...c, recoveryStatus: 'email_sent' } : c))
      );
      showToast(`Recovery email dispatched & synced with MongoDB Atlas for ${cart.customerEmail}!`, 'success');
    } catch {
      showToast('Failed to dispatch recovery email', 'error');
    } finally {
      setSendingId(null);
    }
  };

  const handleSendWhatsAppRecovery = async (cart: AbandonedCartItem) => {
    try {
      await fetch('/api/v1/marketing/abandoned-carts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cart.id, recoveryStatus: 'whatsapp_sent' }),
      });

      setCarts((prev) =>
        prev.map((c) => (c.id === cart.id ? { ...c, recoveryStatus: 'whatsapp_sent' } : c))
      );
      showToast(`WhatsApp recovery triggered & recorded in MongoDB for ${cart.customerName}!`, 'success');
    } catch (e) {
      console.warn('Error updating status:', e);
    }
  };

  const totalAtRisk = carts.reduce((acc, c) => acc + (c.recoveryStatus !== 'recovered' ? c.totalAmount : 0), 0);
  const totalRecovered = carts.reduce((acc, c) => acc + (c.recoveryStatus === 'recovered' ? c.totalAmount : 0), 0);

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
              Marketing Automation • MongoDB Atlas Synced
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">Abandoned Cart Recovery</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Re-engage high-intent customers with automated checkout reminders and dynamic incentives.
            </p>
          </div>

          <button
            onClick={() => {
              loadCartsFromDb();
              showToast('Refreshed live abandoned carts from MongoDB Atlas', 'info');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg shadow transition-all"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Sync Live DB</span>
          </button>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">At-Risk Abandoned GMV</div>
            <div className="text-2xl font-black text-white">₹{totalAtRisk.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-amber-400 font-medium">
              {carts.filter((c) => c.recoveryStatus !== 'recovered').length} Active Sessions
            </div>
          </div>

          <div className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Recovered Revenue (MTD)</div>
            <div className="text-2xl font-black text-emerald-400">₹{totalRecovered.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-400 font-medium">Live MongoDB Records</div>
          </div>

          <div className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-1">
            <div className="text-[11px] uppercase font-bold text-slate-400">Recovery Delivery Channels</div>
            <div className="text-2xl font-black text-sky-400">WhatsApp &amp; SMTP</div>
            <div className="text-[10px] text-slate-500">1-Click Direct Re-engagement</div>
          </div>
        </div>

        {/* Abandoned Sessions List */}
        <div className="bg-[#161822] rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span>Live Checkout Drop-offs (MongoDB Atlas)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{carts.length} Sessions</span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
              <span>Loading abandoned sessions from database...</span>
            </div>
          ) : (
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
                            : cart.recoveryStatus === 'whatsapp_sent'
                            ? 'bg-emerald-500/20 text-emerald-300'
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
                          href={`https://wa.me/${cart.customerPhone || '918239019096'}?text=${encodeURIComponent(
                            `Hi ${cart.customerName}! We noticed you left ${cart.items[0]?.title} in your shopping bag. Complete your order now with coupon VIP10 for an extra 10% off: https://mavenco-storefront.vercel.app/cart`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleSendWhatsAppRecovery(cart)}
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
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
