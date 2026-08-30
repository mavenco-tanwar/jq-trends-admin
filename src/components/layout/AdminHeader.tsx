'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ExternalLink,
  Plus,
  Package,
  Layers,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GlobalSearchModal } from './GlobalSearchModal';

export function AdminHeader({
  onOpenMobileSidebar,
}: {
  onOpenMobileSidebar: () => void;
}) {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const notifications = [
    { id: '1', title: 'New Order Received', desc: 'Aanya Kapoor placed order #JQT-847291 (₹1,499)', time: '10m ago', icon: Package, color: 'text-emerald-400' },
    { id: '2', title: 'Low Stock Alert', desc: 'Dusty Rose Organza Saree is down to 5 units', time: '1h ago', icon: AlertTriangle, color: 'text-amber-400' },
    { id: '3', title: 'New Product Review', desc: '5-star review submitted for Chanderi Kurti', time: '2h ago', icon: Sparkles, color: 'text-rose-400' },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#12141D]/90 backdrop-blur-md border-b border-slate-800/90 h-16 flex items-center justify-between px-4 sm:px-6 select-none">
        {/* Left: Mobile Hamburger & Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all w-44 sm:w-64"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search products, orders...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Create Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md shadow-rose-950/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {isQuickCreateOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#161822] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in">
                <Link
                  href="/products/new"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Package className="w-3.5 h-3.5 text-rose-400" />
                  <span>Add Product</span>
                </Link>
                <Link
                  href="/collections"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  <span>Create Collection</span>
                </Link>
                <Link
                  href="/discounts"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Percent className="w-3.5 h-3.5 text-rose-400" />
                  <span>Create Coupon</span>
                </Link>
                <Link
                  href="/content/homepage"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border-t border-slate-800/80 mt-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Homepage Block</span>
                </Link>
              </div>
            )}
          </div>

          {/* View Live Storefront */}
          <a
            href="http://localhost:3005"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title="Open Live Customer Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Storefront</span>
          </a>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#161822] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-40 animate-in fade-in">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-slate-400">3 unread</span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="p-3 hover:bg-slate-800/40 transition-colors flex items-start gap-2.5 text-xs">
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${n.color}`} />
                        <div>
                          <div className="font-bold text-white text-[11px]">{n.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{n.desc}</div>
                          <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Cmd+K Search Modal */}
      {isSearchOpen && <GlobalSearchModal onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
