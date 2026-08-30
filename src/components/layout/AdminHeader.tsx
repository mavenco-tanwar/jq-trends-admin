'use client';

import React, { useState, useEffect } from 'react';
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
  Store,
  ChevronDown,
  Shield,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { GlobalSearchModal } from './GlobalSearchModal';
import { PlatformService, TenantStore } from '@/services/platform';

export function AdminHeader({
  onOpenMobileSidebar,
}: {
  onOpenMobileSidebar: () => void;
}) {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);

  // Multi-Tenant Context
  const [tenants, setTenants] = useState<TenantStore[]>([]);
  const [activeTenant, setActiveTenant] = useState<TenantStore>(PlatformService.getActiveTenant());
  const [impersonationState, setImpersonationState] = useState(PlatformService.getImpersonationState());

  useEffect(() => {
    PlatformService.listTenants().then((list) => {
      setTenants(list);
      setActiveTenant(PlatformService.getActiveTenant());
      setImpersonationState(PlatformService.getImpersonationState());
    });
  }, []);

  const handleSelectStore = (store: TenantStore) => {
    PlatformService.setActiveTenantId(store.id);
    setActiveTenant(store);
    setIsStoreSwitcherOpen(false);
    window.location.href = `/stores/${store.slug}`;
  };

  const handleExitImpersonation = () => {
    PlatformService.stopImpersonation();
    setImpersonationState({ isImpersonating: false });
    window.location.href = '/platform';
  };

  const notifications = [
    { id: '1', title: 'New Order Received', desc: 'Customer placed order #ORD-847291', time: '10m ago', icon: Package, color: 'text-emerald-400' },
    { id: '2', title: 'Inventory Alert', desc: 'Featured stock item is low on inventory', time: '1h ago', icon: AlertTriangle, color: 'text-amber-400' },
    { id: '3', title: 'New Product Review', desc: '5-star review verified and published', time: '2h ago', icon: Sparkles, color: 'text-rose-400' },
  ];

  return (
    <>
      {/* Superadmin Impersonation Banner */}
      {impersonationState.isImpersonating && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
            <span>
              👑 You are viewing <span className="underline">{activeTenant.name}</span> in Superadmin Impersonation Mode (Audit Active)
            </span>
          </div>

          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-md text-[11px] font-bold text-white transition-all"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Exit Impersonation</span>
          </button>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-[#12141D]/90 backdrop-blur-md border-b border-slate-800/90 h-16 flex items-center justify-between px-4 sm:px-6 select-none">
        {/* Left: Mobile Hamburger, Store Switcher & Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Store Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreSwitcherOpen(!isStoreSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center text-[10px] text-white shrink-0 font-bold"
                style={{ backgroundColor: activeTenant.theme?.primaryColor || '#111111' }}
              >
                {activeTenant.code || activeTenant.name.substring(0, 1)}
              </div>
              <span className="max-w-[120px] sm:max-w-[160px] truncate">{activeTenant.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isStoreSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-[#161822] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40 text-xs animate-in fade-in">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Active Store
                </div>

                <div className="py-1 space-y-0.5 max-h-56 overflow-y-auto">
                  {tenants.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleSelectStore(store)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTenant.id === store.id
                          ? 'bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                          style={{ backgroundColor: store.theme?.primaryColor || '#111111' }}
                        >
                          {store.code || store.name.substring(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{store.name}</div>
                          <div className="text-[10px] text-slate-500">{store.planName}</div>
                        </div>
                      </div>

                      {activeTenant.id === store.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-800">
                  <Link
                    href="/platform"
                    onClick={() => setIsStoreSwitcherOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Provision New Store</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all w-36 sm:w-56"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search catalog, orders...</span>
            <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Superadmin Control Plane Shortcut */}
          <Link
            href="/platform"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-lg shadow-sm transition-all"
            title="Superadmin SaaS Platform Control Plane"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Superadmin</span>
          </Link>

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
            href={`http://localhost:3005?tenant=${activeTenant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161822] hover:bg-[#1C1F2C] border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title={`Open Live Storefront for ${activeTenant.name}`}
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
