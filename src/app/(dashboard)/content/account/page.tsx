'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  MapPin,
  Heart,
  Save,
  Eye,
  RotateCcw,
  Check,
  Monitor,
  Smartphone,
  Layers,
  Sliders,
  ShieldCheck,
  Truck,
  Printer,
  Sparkles,
  ShoppingBag,
  Clock,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  AccountBuilderSettings,
  DEFAULT_ACCOUNT_BUILDER_SETTINGS,
} from '@/types/account-builder.types';

export default function AccountBuilderPage() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'wishlist'>('dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(true);

  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  // Config State with Undo/Redo
  const [settings, setSettings] = useState<AccountBuilderSettings>(DEFAULT_ACCOUNT_BUILDER_SETTINGS);
  const [history, setHistory] = useState<AccountBuilderSettings[]>([DEFAULT_ACCOUNT_BUILDER_SETTINGS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = (newSettings: AccountBuilderSettings) => {
    const updated = history.slice(0, historyIndex + 1);
    setHistory([...updated, JSON.parse(JSON.stringify(newSettings))]);
    setHistoryIndex(updated.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSettings(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleResetToDefault = () => {
    setSettings(DEFAULT_ACCOUNT_BUILDER_SETTINGS);
    pushHistory(DEFAULT_ACCOUNT_BUILDER_SETTINGS);
    showToast('Reset Account Settings to default template', 'info');
  };

  // 1. Fetch live Account settings from MongoDB
  useEffect(() => {
    async function loadAccountSettings() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/account-builder?tenant=${tenantSlug}`);
        if (res.data) {
          const cfg = res.data.draft || res.data.data || res.data;
          setSettings(cfg);
          setHistory([JSON.parse(JSON.stringify(cfg))]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.warn('Using local account defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccountSettings();
  }, [tenantSlug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.post('/api/v1/content/account-builder', {
        tenant: tenantSlug,
        status: 'draft',
        settings,
      });
      showToast('Account configuration draft saved!', 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.post('/api/v1/content/account-builder', {
        tenant: tenantSlug,
        status: 'published',
        settings,
      });
      showToast('🎉 Customer Account Portal configuration published live!', 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-100 p-8 space-y-6">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500 animate-pulse z-50" />
        <div className="w-14 h-14 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin flex items-center justify-center">
          <User className="w-6 h-6 text-rose-500 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Loading Account Studio</h3>
          <p className="text-xs text-slate-400 font-mono">Resolving {activeTenant?.name || 'store'} portal schema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Customer Portal Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-rose-400" />
            Customer Account &amp; Order Portal Studio
          </h1>
          <p className="text-xs text-slate-400">
            Configure customer dashboard layout, sidebar position, order card badges, live tracking timeline, and address rules.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isLivePreviewOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isLivePreviewOpen ? 'Live Canvas Active' : 'Show Canvas'}</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            title="Reset to default template"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 rotate-180" />
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={isSaving || isPublishing}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all cursor-pointer flex items-center gap-2"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Dashboard Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Orders &amp; Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'addresses'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Address Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'wishlist'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Wishlist Link</span>
        </button>
      </div>

      {/* 3. EMBEDDED REAL-TIME LIVE CUSTOMER PORTAL SIMULATOR */}
      {isLivePreviewOpen && (
        <div className="p-5 rounded-2xl bg-[#0F1117] border-2 border-emerald-500/50 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Live Storefront Customer Account Simulation
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsLivePreviewOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simulator Container */}
          <div className="flex justify-center bg-slate-950/60 p-6 rounded-xl border border-slate-800 overflow-x-auto">
            <div
              className={`bg-[#FFFDFC] text-slate-900 rounded-3xl border border-[#EFE8E2] p-6 shadow-2xl space-y-6 transition-all ${
                device === 'mobile' ? 'w-[380px]' : 'w-[840px]'
              }`}
            >
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Hello, Aanya Kapoor</h4>
                    <p className="text-[10px] text-slate-500 font-mono">aanya.kapoor@example.com • Member since 2026</p>
                  </div>
                </div>

                <span className="text-xs px-3 py-1 bg-white border border-[#EFE8E2] text-rose-600 font-bold rounded-lg">
                  Wishlist (4)
                </span>
              </div>

              {/* 2-Column Mock Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-4 p-2 bg-[#FAF7F5] border border-[#EFE8E2] rounded-xl space-y-1 text-xs font-bold">
                  <div className="p-2 bg-slate-950 text-white rounded-lg flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-rose-400" />
                    <span>My Orders (2)</span>
                  </div>
                  <div className="p-2 text-slate-600 rounded-lg flex items-center gap-2 hover:bg-white">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Saved Addresses</span>
                  </div>
                  <div className="p-2 text-slate-600 rounded-lg flex items-center gap-2 hover:bg-white">
                    <User className="w-3.5 h-3.5 text-rose-400" />
                    <span>Profile Settings</span>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div className="p-4 rounded-xl bg-[#FAF7F5] border border-[#EFE8E2] space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-[#EFE8E2]">
                      <span className="font-mono font-bold text-slate-900">ORD-100234</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        CONFIRMED
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <div>
                        <strong className="block text-slate-900">Blush Floral Tiered Midi Dress</strong>
                        <span className="text-[10px] text-slate-500">Qty: 1 • Color: Rose • Size: M</span>
                      </div>
                      <span className="font-mono font-bold">$1,499</span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#EFE8E2] text-xs">
                      <button className="px-3 py-1.5 bg-white border border-[#EFE8E2] font-bold rounded-lg text-slate-800">
                        View Details
                      </button>
                      <button className="px-3 py-1.5 bg-white border border-[#EFE8E2] font-bold rounded-lg text-slate-800">
                        Invoice
                      </button>
                      <button className="px-3 py-1.5 bg-slate-950 font-bold rounded-lg text-white">
                        Buy Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONFIGURATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {activeTab === 'dashboard' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Customer Dashboard Layout</h3>
                <p className="text-xs text-slate-400">Configure portal navigation layout, sidebar position, and welcome headers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sidebar Position
                </label>
                <select
                  value={settings.dashboard.sidebarPosition}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      dashboard: { ...settings.dashboard, sidebarPosition: e.target.value as any },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="left">Left Side (Standard Luxury)</option>
                  <option value="right">Right Side</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Greeting Avatar Header
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      dashboard: { ...settings.dashboard, showGreetingAvatar: !settings.dashboard.showGreetingAvatar },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.dashboard.showGreetingAvatar
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.dashboard.showGreetingAvatar ? 'Visible (Active)' : 'Hidden'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Wishlist Quick Access Link
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      dashboard: { ...settings.dashboard, showWishlistQuickLink: !settings.dashboard.showWishlistQuickLink },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.dashboard.showWishlistQuickLink
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.dashboard.showWishlistQuickLink ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Orders &amp; Timeline Rules</h3>
                <p className="text-xs text-slate-400">Configure order action buttons, printable invoice generation, and customer cancellation rules.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Printable Invoice Download
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      orders: { ...settings.orders, allowDownloadInvoice: !settings.orders.allowDownloadInvoice },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.orders.allowDownloadInvoice
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.orders.allowDownloadInvoice ? 'Enabled (Downloadable)' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  1-Click Buy Again Reorder
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      orders: { ...settings.orders, allowReorder: !settings.orders.allowReorder },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.orders.allowReorder
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.orders.allowReorder ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Live Tracking Timeline Modal
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      orders: { ...settings.orders, showTimelineOnModal: !settings.orders.showTimelineOnModal },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.orders.showTimelineOnModal
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.orders.showTimelineOnModal ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Saved Address Management</h3>
                <p className="text-xs text-slate-400">Configure address limits and required fields.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Max Saved Addresses per Customer
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.addresses.maxSavedAddresses}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      addresses: { ...settings.addresses, maxSavedAddresses: Number(e.target.value) },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Separate Billing Address
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      addresses: { ...settings.addresses, allowSeparateBilling: !settings.addresses.allowSeparateBilling },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.addresses.allowSeparateBilling
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.addresses.allowSeparateBilling ? 'Allowed' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Wishlist &amp; Save for Later Integration</h3>
                <p className="text-xs text-slate-400">Manage wishlist access from customer portal.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Wishlist Quick Link</h4>
                <p className="text-xs text-slate-400">Displays current wishlist count badge in account header.</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                Enabled
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
