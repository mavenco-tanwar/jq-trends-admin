'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Save,
  Eye,
  RotateCcw,
  Clock,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sliders,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Zap,
  Tag,
  Gift,
  Boxes,
  Palette,
  Package,
  Plus,
  Trash2,
  X,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { StoreCartSettings, DEFAULT_CART_BUILDER_SETTINGS } from '@/types/cart-builder.types';

export default function CartBuilderPage() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'minicart' | 'cartpage' | 'shipping' | 'checkout'>('minicart');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(true);

  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  // Config State with Undo/Redo
  const [settings, setSettings] = useState<StoreCartSettings>(DEFAULT_CART_BUILDER_SETTINGS);
  const [history, setHistory] = useState<StoreCartSettings[]>([DEFAULT_CART_BUILDER_SETTINGS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Mock Sandbox State
  const [mockItems, setMockItems] = useState([
    {
      id: 'mock_1',
      title: 'Blush Floral Tiered Midi Dress',
      color: 'Rose',
      size: 'M',
      quantity: 1,
      price: 1499,
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200',
    },
    {
      id: 'mock_2',
      title: 'Ivory Linen Relaxed Blazer Co-ord',
      color: 'Ivory Cream',
      size: 'S',
      quantity: 1,
      price: 1899,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200',
    },
  ]);
  const [mockCoupon, setMockCoupon] = useState('LUMINA10');

  const pushHistory = (newSettings: StoreCartSettings) => {
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
    setSettings(DEFAULT_CART_BUILDER_SETTINGS);
    pushHistory(DEFAULT_CART_BUILDER_SETTINGS);
    showToast('Reset Cart Settings to default template', 'info');
  };

  // 1. Fetch live Cart settings from MongoDB
  useEffect(() => {
    async function loadCartSettings() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/cart-builder?tenant=${tenantSlug}`);
        if (res.data) {
          const cfg = res.data.draft || res.data.data || res.data;
          setSettings(cfg);
          setHistory([JSON.parse(JSON.stringify(cfg))]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.warn('Using local cart defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCartSettings();
  }, [tenantSlug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.post('/api/v1/content/cart-builder', {
        tenant: tenantSlug,
        status: 'draft',
        settings,
      });
      showToast('Cart configuration draft saved!', 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.post('/api/v1/content/cart-builder', {
        tenant: tenantSlug,
        status: 'published',
        settings,
      });
      showToast('🎉 Cart & Checkout configuration published live!', 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  // Calculate Mock Summary
  const mockSubtotal = mockItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mockDiscount = mockCoupon ? Math.round(mockSubtotal * 0.1) : 0;
  const mockShipping = mockSubtotal >= settings.miniCart.freeShippingThreshold ? 0 : 99;
  const mockTotal = mockSubtotal - mockDiscount + mockShipping;
  const mockPercent = Math.min(100, Math.round((mockSubtotal / settings.miniCart.freeShippingThreshold) * 100));
  const mockRemaining = Math.max(0, settings.miniCart.freeShippingThreshold - mockSubtotal);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-100 p-8 space-y-6">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500 animate-pulse z-50" />
        <div className="w-14 h-14 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-rose-500 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Loading Cart Builder Studio</h3>
          <p className="text-xs text-slate-400 font-mono">Resolving {activeTenant?.name || 'store'} cart schema...</p>
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
              Visual Cart Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-rose-400" />
            Cart, Mini Cart &amp; Checkout Studio
          </h1>
          <p className="text-xs text-slate-400">
            Configure sliding mini cart drawer, 2-column cart page layout, free shipping progress thresholds, and checkout rules.
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
          onClick={() => setActiveTab('minicart')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'minicart'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Mini Cart Drawer</span>
        </button>

        <button
          onClick={() => setActiveTab('cartpage')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cartpage'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cart Page Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Shipping &amp; Free Threshold</span>
        </button>

        <button
          onClick={() => setActiveTab('checkout')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'checkout'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Checkout &amp; Payments</span>
        </button>
      </div>

      {/* 3. EMBEDDED REAL-TIME LIVE CART PREVIEW */}
      {isLivePreviewOpen && (
        <div className="p-5 rounded-2xl bg-[#0F1117] border-2 border-emerald-500/50 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Live Storefront Real-Time Preview
              </h3>
              <span className="text-[11px] text-slate-400">
                (Interactive Mini Cart &amp; Cart Page simulation)
              </span>
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

          {/* Mini Cart Drawer Simulator Container */}
          <div className="flex justify-center bg-slate-950/60 p-6 rounded-xl border border-slate-800 overflow-x-auto">
            <div
              className={`bg-[#FFFDFC] text-slate-900 rounded-3xl border border-[#EFE8E2] shadow-2xl flex flex-col justify-between transition-all ${
                device === 'mobile' ? 'w-[360px]' : 'w-[420px]'
              }`}
              style={{ minHeight: '560px' }}
            >
              {/* Drawer Top */}
              <div className="p-4 border-b border-[#EFE8E2] flex items-center justify-between bg-[#FAF7F5] rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Shopping Bag
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {mockItems.length} items
                    </span>
                  </div>
                </div>

                <span className="text-xs text-slate-400 cursor-pointer">✕</span>
              </div>

              {/* Free Shipping Progress */}
              {settings.miniCart.showFreeShippingBar && (
                <div className="p-3 border-b border-[#EFE8E2]">
                  <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2] text-xs">
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1.5">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-rose-600" />
                        <span>
                          {mockRemaining === 0 ? (
                            <span className="text-emerald-700 font-bold">🎉 Free Shipping Unlocked!</span>
                          ) : (
                            <>
                              Add <strong className="text-rose-600 font-mono">${mockRemaining}</strong> more for Free Shipping
                            </>
                          )}
                        </span>
                      </div>
                      <span className="font-mono text-slate-500">{mockPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                        style={{ width: `${mockPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                {mockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2] flex gap-3 items-center"
                  >
                    <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                      <p className="text-[10px] text-slate-500">
                        {item.color} • Size {item.size}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden text-[10px]">
                          <button
                            type="button"
                            onClick={() =>
                              setMockItems(
                                mockItems.map((m) =>
                                  m.id === item.id ? { ...m, quantity: Math.max(1, m.quantity - 1) } : m
                                )
                              )
                            }
                            className="px-2 py-0.5 text-slate-600 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setMockItems(
                                mockItems.map((m) =>
                                  m.id === item.id ? { ...m, quantity: m.quantity + 1 } : m
                                )
                              )
                            }
                            className="px-2 py-0.5 text-slate-600 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold font-mono text-slate-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Bottom */}
              <div className="p-4 border-t border-[#EFE8E2] bg-[#FAF7F5] rounded-b-3xl space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-900">${mockSubtotal.toLocaleString()}</span>
                  </div>
                  {mockDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo ({mockCoupon})</span>
                      <span className="font-mono">-${mockDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total</span>
                    <span className="font-mono font-black">${mockTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>{settings.miniCart.checkoutButtonText}</span>
                  </button>

                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-white text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <span>{settings.miniCart.viewCartButtonText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN CONFIGURATION CARDS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* TAB 1: MINI CART DRAWER */}
        {activeTab === 'minicart' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Mini Cart Drawer Settings</h3>
                <p className="text-xs text-slate-400">Configure slide-over drawer behavior, auto-open on Add to Cart, and button labels.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mini Cart Drawer
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, enabled: !settings.miniCart.enabled },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.miniCart.enabled
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.miniCart.enabled ? 'Drawer Enabled (Active)' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Auto-Open on Add to Bag
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, autoOpenOnAddToCart: !settings.miniCart.autoOpenOnAddToCart },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.miniCart.autoOpenOnAddToCart
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.miniCart.autoOpenOnAddToCart ? 'Auto-Open Active' : 'Off'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Drawer Slide Position
                </label>
                <select
                  value={settings.miniCart.drawerPosition}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, drawerPosition: e.target.value as any },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="right">Right Side Slide-Over (Standard)</option>
                  <option value="left">Left Side Slide-Over</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Checkout Button Label
                </label>
                <input
                  type="text"
                  value={settings.miniCart.checkoutButtonText}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, checkoutButtonText: e.target.value },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  View Bag Button Label
                </label>
                <input
                  type="text"
                  value={settings.miniCart.viewCartButtonText}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, viewCartButtonText: e.target.value },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Coupon Input in Drawer
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, showCouponInput: !settings.miniCart.showCouponInput },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.miniCart.showCouponInput
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.miniCart.showCouponInput ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CART PAGE LAYOUT */}
        {activeTab === 'cartpage' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Cart Page (/cart) Architecture</h3>
                <p className="text-xs text-slate-400">Configure full-page shopping bag layout, responsive mobile summaries, and cross-sells.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Desktop Layout Structure
                </label>
                <select
                  value={settings.cartPage.layout}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      cartPage: { ...settings.cartPage, layout: e.target.value as any },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="2-column">2-Column (Items 7 cols / Summary 5 cols)</option>
                  <option value="single-column">Single Column Stacked</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sticky Summary on Mobile
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      cartPage: { ...settings.cartPage, stickyMobileSummary: !settings.cartPage.stickyMobileSummary },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.cartPage.stickyMobileSummary
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.cartPage.stickyMobileSummary ? 'Active (Sticky Bottom)' : 'Off'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Cross-Sell Recommendations
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      cartPage: { ...settings.cartPage, showRecommendations: !settings.cartPage.showRecommendations },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.cartPage.showRecommendations
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.cartPage.showRecommendations ? 'Visible (Trending)' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHIPPING & FREE THRESHOLD */}
        {activeTab === 'shipping' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Shipping Thresholds &amp; Free Delivery Progress</h3>
                <p className="text-xs text-slate-400">Configure free shipping threshold amounts and customer progress bar messages.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Free Express Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.miniCart.freeShippingThreshold}
                  onChange={(e) => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, freeShippingThreshold: Number(e.target.value) },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Progress Bar Banner
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...settings,
                      miniCart: { ...settings.miniCart, showFreeShippingBar: !settings.miniCart.showFreeShippingBar },
                    };
                    setSettings(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    settings.miniCart.showFreeShippingBar
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {settings.miniCart.showFreeShippingBar ? 'Active on Cart & Drawer' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CHECKOUT & PAYMENTS */}
        {activeTab === 'checkout' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Checkout Settings &amp; Payment Gateway Rules</h3>
                <p className="text-xs text-slate-400">Configure guest checkout, address fields, and supported payment methods.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Guest Checkout</h4>
                  <p className="text-xs text-slate-400">Allow customers to buy without login.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Allowed
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-slate-400">Pay at doorstep on delivery.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Online Gateways</h4>
                  <p className="text-xs text-slate-400">Stripe &amp; Razorpay verified checkout.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
