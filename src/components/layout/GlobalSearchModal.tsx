'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Package, ShoppingCart, Users, Layers, FileText, ArrowRight, X } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS } from '@/lib/mock-data';

export function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredProducts = INITIAL_PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredOrders = INITIAL_ORDERS.filter((o) =>
    o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
    o.customer.email.toLowerCase().includes(query.toLowerCase()) ||
    o.customer.firstName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredCustomers = INITIAL_CUSTOMERS.filter((c) =>
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#161822] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-rose-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search products, SKUs, orders, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {/* Quick Links if empty */}
          {!query && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3">Quick Navigation</span>
              <div className="grid grid-cols-2 gap-2 p-1">
                <Link
                  href="/products/new"
                  onClick={onClose}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span className="font-semibold">+ New Product</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/content/homepage"
                  onClick={onClose}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span className="font-semibold">Homepage Builder</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span className="font-semibold">All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/media"
                  onClick={onClose}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span className="font-semibold">Media Library</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          )}

          {/* Products */}
          {query && filteredProducts.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3">Products</span>
              {filteredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-slate-400">SKU: {p.sku} • ₹{p.price}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">{p.stock} in stock</span>
                </Link>
              ))}
            </div>
          )}

          {/* Orders */}
          {query && filteredOrders.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3">Orders</span>
              {filteredOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-bold text-white">{o.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">{o.customer.firstName} {o.customer.lastName} • ₹{o.grandTotal}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-rose-300 font-bold uppercase">{o.status}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Customers */}
          {query && filteredCustomers.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3">Customers</span>
              {filteredCustomers.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-bold text-white">{c.firstName} {c.lastName}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{c.ordersCount} orders</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
