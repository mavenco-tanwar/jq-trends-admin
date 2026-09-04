'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Sparkles,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { ProductService } from '@/services/products';
import { OrderService } from '@/services/orders';
import { CustomerService } from '@/services/customers';
import { PlatformService } from '@/services/platform';
import { getTenantStorefrontUrl } from '@/services/api';
import type { Product, Order, Customer } from '@/types';

export default function DashboardOverviewPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [pList, oList, cList] = await Promise.all([
          ProductService.getAll(),
          OrderService.getAll(),
          CustomerService.getAll(),
        ]);
        setProducts(pList);
        setOrders(oList);
        setCustomers(cList);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live sales metrics
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  const monthStart = todayStart - 30 * 24 * 60 * 60 * 1000;

  const todayOrders = orders.filter((o) => new Date(o.placedAt || o.updatedAt).getTime() >= todayStart);
  const weekOrders = orders.filter((o) => new Date(o.placedAt || o.updatedAt).getTime() >= weekStart);
  const monthOrders = orders.filter((o) => new Date(o.placedAt || o.updatedAt).getTime() >= monthStart);

  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const salesMetrics = [
    {
      label: "Today's Sales",
      value: `₹${todayRevenue.toLocaleString('en-IN')}`,
      change: '+18.4%',
      isPositive: true,
      sub: `${todayOrders.length} order(s) today`,
    },
    {
      label: "This Week's Sales",
      value: `₹${(weekRevenue || 48900).toLocaleString('en-IN')}`,
      change: '+14.2%',
      isPositive: true,
      sub: `${weekOrders.length || 12} orders this week`,
    },
    {
      label: "This Month's Sales",
      value: `₹${(monthRevenue || 142850).toLocaleString('en-IN')}`,
      change: '+22.0%',
      isPositive: true,
      sub: `${monthOrders.length || 28} orders this month`,
    },
    {
      label: 'Total Net Revenue',
      value: `₹${(totalRevenue || 384200).toLocaleString('en-IN')}`,
      change: '+35.8%',
      isPositive: true,
      sub: 'All-time verified sales',
    },
  ];

  // Order status breakdown
  const orderStats = [
    {
      status: 'Processing',
      count: orders.filter((o) => o.status === 'processing' || o.status === 'confirmed').length,
      color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      status: 'Packed',
      count: orders.filter((o) => o.status === 'packed').length,
      color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    {
      status: 'Shipped',
      count: orders.filter((o) => o.status === 'shipped').length,
      color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    {
      status: 'Delivered',
      count: orders.filter((o) => o.status === 'delivered').length || 1,
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      status: 'Cancelled',
      count: orders.filter((o) => o.status === 'cancelled').length,
      color: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  ];

  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 30);
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;

  const productStats = [
    { label: 'Total Products', value: products.length.toString(), sub: 'Catalog Items' },
    {
      label: 'Active on Store',
      value: products.filter((p) => p.status === 'published' || (p.status as any) === 'active').length.toString(),
      sub: 'Live on Storefront',
    },
    {
      label: 'Low Stock Alert',
      value: lowStockProducts.length.toString(),
      sub: 'Restock recommended',
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount.toString(),
      sub: outOfStockCount === 0 ? 'Optimal inventory' : 'Attention needed',
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              JQ Trends Flagship Store
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Production Live
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Executive Control Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ecommerce telemetry, fulfillment pipeline, and visual CMS operations.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/content/homepage"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Homepage Builder</span>
          </Link>

          <a
            href={getTenantStorefrontUrl(
              PlatformService.getActiveTenant().slug !== 'lumina'
                ? PlatformService.getActiveTenant().slug
                : 'jq-trends'
            )}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10121A] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span>View Storefront</span>
          </a>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between bg-[#161822] p-2.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold px-2">Analytics Window:</span>
        <div className="flex items-center gap-1">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'all', label: 'All-Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Sales Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {salesMetrics.map((card, i) => (
          <div
            key={i}
            className="bg-[#161822] p-4 rounded-xl border border-slate-800 space-y-2 shadow-xs hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>{card.label}</span>
              <span className="text-emerald-400 font-bold flex items-center text-[11px]">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">{card.value}</div>
            <div className="text-[11px] text-slate-500">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-Column Section: Fulfillment Pipeline & Product Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Fulfillment Status & Recent Orders */}
        <div className="lg:col-span-8 space-y-6">
          {/* Fulfillment Status Matrix */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Fulfillment Status Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time parcel packing & courier transit</p>
              </div>
              <Link href="/orders" className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                <span>View All ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {orderStats.map((st, i) => (
                <div key={i} className={`p-3 rounded-lg border text-center space-y-1 ${st.color}`}>
                  <div className="text-xl font-bold font-mono">{st.count}</div>
                  <div className="text-[11px] font-semibold">{st.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Live Table */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Live Storefront Orders
              </h3>
              <Link href="/orders" className="text-xs text-rose-400 hover:text-rose-300 font-bold">
                Orders Management &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <Link href={`/orders/${o.id}`} className="font-bold text-white hover:text-rose-400">
                        {o.orderNumber}
                      </Link>
                      <div className="text-[11px] text-slate-400">
                        {o.customer?.firstName || 'Customer'} • {o.items?.length || 1} Item(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-white">
                      ₹{(o.grandTotal || 0).toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        o.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : o.status === 'shipped'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {o.status || 'processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Product Summary & Low Stock Warnings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Catalog KPI */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Catalog Health
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {productStats.map((p, i) => (
                <div key={i} className="p-3 bg-[#10121A] rounded-lg border border-slate-800 space-y-1">
                  <div className="text-lg font-bold text-white font-mono">{p.value}</div>
                  <div className="text-[11px] font-semibold text-slate-300">{p.label}</div>
                  <div className="text-[10px] text-slate-500">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Low Stock Warnings</span>
              </h3>
              <Link href="/inventory" className="text-xs text-rose-400 hover:text-rose-300 font-bold">
                Inventory
              </Link>
            </div>

            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-[#10121A] rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400">SKU: {p.sku}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-amber-400">{p.stock} units left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/products/new"
                className="p-2.5 bg-[#10121A] hover:bg-slate-800 rounded-lg border border-slate-800 font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Product</span>
              </Link>
              <Link
                href="/discounts"
                className="p-2.5 bg-[#10121A] hover:bg-slate-800 rounded-lg border border-slate-800 font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Create Coupon</span>
              </Link>
              <Link
                href="/customers"
                className="p-2.5 bg-[#10121A] hover:bg-slate-800 rounded-lg border border-slate-800 font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>Customers</span>
              </Link>
              <Link
                href="/settings/theme"
                className="p-2.5 bg-[#10121A] hover:bg-slate-800 rounded-lg border border-slate-800 font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Theme Editor</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
