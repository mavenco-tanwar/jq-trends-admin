'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  IndianRupee,
} from 'lucide-react';
import { OrderService } from '@/services/orders';
import { useToast } from '@/lib/toast-context';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Order } from '@/types';

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const list = await OrderService.getAll();
    setOrders(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      sortable: true,
      render: (o) => {
        const dateStr = o.placedAt || o.updatedAt || new Date().toISOString();
        let formattedDate = 'Recent';
        try {
          formattedDate = new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        } catch {
          // fallback
        }
        return (
          <div>
            <Link
              href={`/orders/${o.id}`}
              className="font-mono font-bold text-white hover:text-rose-400 transition-colors"
            >
              {o.orderNumber || o.id}
            </Link>
            <div className="text-[10px] text-slate-500 font-mono">
              {formattedDate}
            </div>
          </div>
        );
      },
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <div className="font-bold text-white">
            {o.customer?.firstName || 'Valued'} {o.customer?.lastName || 'Customer'}
          </div>
          <div className="text-[11px] text-slate-400">{o.customer?.email || 'customer@example.com'}</div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => <span className="text-slate-300 font-medium">{o.items?.length || 0} Item(s)</span>,
    },
    {
      key: 'grandTotal',
      header: 'Total (₹)',
      sortable: true,
      render: (o) => (
        <span className="font-bold text-white font-mono">₹{(o.grandTotal || 0).toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (o) => (
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {o.paymentStatus || 'paid'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Fulfillment Status',
      sortable: true,
      render: (o) => (
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
            o.status === 'delivered'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : o.status === 'shipped'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {o.status || 'processing'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (o) => (
        <Link
          href={`/orders/${o.id}`}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-slate-700"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Fulfillment &amp; Sales
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Orders &amp; Shipments</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Process boutique parcel packaging, dispatch couriers, and track delivery timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {orders.length} Active Orders
          </span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={orders}
        columns={columns}
        searchPlaceholder="Search order #, customer name, email..."
        searchKey={(o) => `${o.orderNumber || ''} ${o.customer?.firstName || ''} ${o.customer?.lastName || ''} ${o.customer?.email || ''}`}
        filterOptions={[
          { label: 'Shipped', value: 'shipped', filterFn: (o) => o.status === 'shipped' },
          { label: 'Delivered', value: 'delivered', filterFn: (o) => o.status === 'delivered' },
        ]}
      />
    </div>
  );
}
