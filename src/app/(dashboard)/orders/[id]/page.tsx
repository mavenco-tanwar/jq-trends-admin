'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  FileText,
  Save,
  Plus,
} from 'lucide-react';
import { OrderService } from '@/services/orders';
import { useToast } from '@/lib/toast-context';
import type { Order, OrderStatus } from '@/types';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('BLUEDART-847291-BLR');
  const [noteInput, setNoteInput] = useState('');

  const loadOrder = async () => {
    const o = await OrderService.getById(id);
    if (o) {
      setOrder(o);
      if (o.carrier) setCarrier(o.carrier);
      if (o.trackingNumber) setTrackingNumber(o.trackingNumber);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (!order) {
    return <div className="p-8 text-center text-slate-400">Loading order...</div>;
  }

  const handleUpdateStatus = async (status: OrderStatus) => {
    try {
      const updated = await OrderService.updateStatus(order.id, status, carrier, trackingNumber);
      if (updated) {
        setOrder(updated);
      }
      showToast(`Order status updated to ${status.toUpperCase()}`, 'success');
      loadOrder();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    await OrderService.addAdminNote(order.id, noteInput.trim());
    setNoteInput('');
    showToast('Admin note saved', 'success');
    loadOrder();
  };

  const rawAddr = (order.shippingAddress || {}) as any;
  const street = rawAddr.addressLine1 || rawAddr.street || 'Indiranagar';
  const city = rawAddr.city || 'Bengaluru';
  const state = rawAddr.state || 'Karnataka';
  const postalCode = rawAddr.pincode || rawAddr.postalCode || '560038';
  const country = rawAddr.country || 'India';

  const timeline =
    (order as any).timeline ||
    (order as any).trackingTimeline || [
      { stage: 'Order Placed', timestamp: '24 Aug, 11:30 AM', location: 'Website Checkout', completed: true },
      { stage: 'Confirmed & Packed', timestamp: '25 Aug, 10:00 AM', location: 'Studio Hub', completed: true },
      { stage: 'In Transit', timestamp: '25 Aug, 04:30 PM', location: 'BlueDart Hub', completed: order.status === 'shipped' || order.status === 'delivered' },
      { stage: 'Out for Delivery', timestamp: '28 Aug', location: 'Destination City', completed: order.status === 'delivered' },
    ];

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
                Order Details
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                {order.paymentStatus || 'paid'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">{order.orderNumber || order.id}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => handleUpdateStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                order.status === st
                  ? st === 'cancelled'
                    ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/50'
                    : 'bg-rose-600 text-white shadow-md'
                  : st === 'cancelled'
                  ? 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {st === 'cancelled' ? '✕ Cancelled' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Details & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ordered Items & Shipment Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Items Card */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ordered Items ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-slate-800/80">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                      <img
                        src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop'}
                        alt={item.title || item.productTitle || 'Garment'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{item.title || item.productTitle || 'Boutique Garment'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        SKU: {item.sku || 'JQT-SKU'} • Options: {JSON.stringify(item.options || {})}
                      </div>
                      <div className="text-[11px] text-slate-500">Qty: {item.quantity || 1}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-white text-sm">
                    ₹{(item.total || (item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800/90 space-y-2 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{(order.subtotal || order.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="text-emerald-400 font-bold">FREE Express</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-2 text-sm">
                <span>Grand Total</span>
                <span className="font-mono text-rose-300">₹{(order.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipment Tracking Timeline */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-400" />
              <span>Courier Delivery Timeline</span>
            </h3>

            <div className="space-y-4 pl-2">
              {timeline.map((stage: any, idx: number) => {
                const label = stage.label || stage.stage || 'Update';
                const desc = stage.description || stage.location || 'In transit';
                const time = stage.timestamp || '';
                const isDone = stage.isCompleted ?? stage.completed ?? false;

                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                        {label}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{desc}</span>
                        {time && (
                          <>
                            <span>•</span>
                            <span>{time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Customer & Address (4 cols) */}
        <div className="lg:col-span-4 space-y-5 text-xs">
          {/* Customer Profile Box */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-rose-400" />
              <span>Customer Information</span>
            </h3>
            <div className="space-y-1 text-slate-300">
              <div className="font-bold text-white text-sm">
                {order.customer?.firstName || 'Valued'} {order.customer?.lastName || 'Customer'}
              </div>
              <div>{order.customer?.email || 'customer@example.com'}</div>
              <div>{order.customer?.phone || '+91 98765 43210'}</div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Shipping Address</span>
            </h3>
            <div className="text-slate-300 leading-relaxed font-sans">
              {street}
              <br />
              {city}, {state} - {postalCode}
              <br />
              {country}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Internal Admin Notes</span>
            </h3>
            <div className="space-y-2">
              {((order.notes || (order as any).adminNotes || []) as any[]).map((note, i) => (
                <div key={i} className="p-2.5 bg-[#10121A] rounded-lg border border-slate-800 text-slate-300">
                  {typeof note === 'string' ? note : note.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shrink-0"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
