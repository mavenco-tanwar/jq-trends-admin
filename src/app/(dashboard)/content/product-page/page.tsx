'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Eye,
  RotateCcw,
  CheckCircle2,
  Layers,
  ShoppingBag,
  Sliders,
  Check,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Zap,
  Smartphone,
  Monitor,
  Tablet,
  ChevronDown,
  Info,
  Heart,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function ProductPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'gallery' | 'buybox' | 'accordions' | 'badges' | 'crosssell'>('gallery');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Config State
  const [config, setConfig] = useState({
    galleryLayout: 'grid-2' as 'grid-2' | 'stacked' | 'carousel' | 'thumbnails-left',
    imageZoom: true,
    showVideoBadge: true,
    stickyBuyBar: true,
    showStockUrgency: true,
    stockThreshold: 5,
    enableDeliveryEstimator: true,
    defaultEstimatedDays: '2-4 Days',
    enableSizeGuideModal: true,
    enableFabricCareAccordion: true,
    enableArtisanProvenance: true,
    trustBadges: [
      { id: 'auth', title: '100% Handcrafted Authenticity', desc: 'Direct from artisan weavers', enabled: true },
      { id: 'shipping', title: 'Complimentary Express Delivery', desc: 'Dispatched in 24 hours', enabled: true },
      { id: 'exchange', title: '7-Day Easy Exchange', desc: 'Doorstep pickup available', enabled: true },
      { id: 'secure', title: '0% Platform Fee Protected', desc: 'Encrypted SSL checkout', enabled: true },
    ],
    showFrequentlyBoughtTogether: true,
    showCustomerReviews: true,
    showRelatedProducts: true,
    accentColor: '#E11D48',
  });

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Product Page draft saved successfully!', 'success');
    }, 600);
  };

  const handlePublishLive = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      showToast('Product Page template published live to all storefront PDP routes!', 'success');
    }, 800);
  };

  const handleReset = () => {
    setConfig({
      galleryLayout: 'grid-2',
      imageZoom: true,
      showVideoBadge: true,
      stickyBuyBar: true,
      showStockUrgency: true,
      stockThreshold: 5,
      enableDeliveryEstimator: true,
      defaultEstimatedDays: '2-4 Days',
      enableSizeGuideModal: true,
      enableFabricCareAccordion: true,
      enableArtisanProvenance: true,
      trustBadges: [
        { id: 'auth', title: '100% Handcrafted Authenticity', desc: 'Direct from artisan weavers', enabled: true },
        { id: 'shipping', title: 'Complimentary Express Delivery', desc: 'Dispatched in 24 hours', enabled: true },
        { id: 'exchange', title: '7-Day Easy Exchange', desc: 'Doorstep pickup available', enabled: true },
        { id: 'secure', title: '0% Platform Fee Protected', desc: 'Encrypted SSL checkout', enabled: true },
      ],
      showFrequentlyBoughtTogether: true,
      showCustomerReviews: true,
      showRelatedProducts: true,
      accentColor: '#E11D48',
    });
    showToast('Reset to default high-converting luxury PDP layout', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Visual Headless CMS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Product Detail Page (PDP)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Product Page Visual Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure image galleries, sticky buy boxes, size guides, trust seals, and cross-sell bundles for all product routes.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center bg-[#161822] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-all ${device === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Work Area (Controls + Real-Time Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#121522] border border-slate-800 p-5 rounded-2xl shadow-xl">
          {/* Customizer Tabs */}
          <div className="flex border-b border-slate-800 pb-2 gap-1 overflow-x-auto text-xs">
            {[
              { id: 'gallery', label: '1. Gallery' },
              { id: 'buybox', label: '2. Buy Box' },
              { id: 'accordions', label: '3. Details' },
              { id: 'badges', label: '4. Trust' },
              { id: 'crosssell', label: '5. Upsell' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Gallery */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider block">Gallery Grid Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'grid-2', label: '2-Column Luxury Grid' },
                    { id: 'stacked', label: 'Full Width Stacked' },
                    { id: 'carousel', label: 'Swipe Carousel' },
                    { id: 'thumbnails-left', label: 'Left Thumbnails' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setConfig({ ...config, galleryLayout: item.id as any })}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        config.galleryLayout === item.id
                          ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                          : 'border-slate-800 bg-[#0C0E17] text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                  <span className="text-slate-300">High-Resolution Hover Zoom</span>
                  <input
                    type="checkbox"
                    checked={config.imageZoom}
                    onChange={(e) => setConfig({ ...config, imageZoom: e.target.checked })}
                    className="accent-rose-500 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                  <span className="text-slate-300">Shoppable Video &amp; 360° Badge</span>
                  <input
                    type="checkbox"
                    checked={config.showVideoBadge}
                    onChange={(e) => setConfig({ ...config, showVideoBadge: e.target.checked })}
                    className="accent-rose-500 w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tab 2: Buy Box */}
          {activeTab === 'buybox' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-white">Sticky Buy Bar on Scroll</div>
                  <div className="text-[10px] text-slate-400">Keeps CTA accessible on mobile &amp; long scrolls</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.stickyBuyBar}
                  onChange={(e) => setConfig({ ...config, stickyBuyBar: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-white">Low Stock Scarcity Alert</div>
                  <div className="text-[10px] text-slate-400">Displays "Only {config.stockThreshold} left" badge</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showStockUrgency}
                  onChange={(e) => setConfig({ ...config, showStockUrgency: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <div className="space-y-1.5 p-3 rounded-xl bg-[#0C0E17] border border-slate-800">
                <label className="text-slate-300 font-semibold block">Estimated Delivery Window</label>
                <input
                  type="text"
                  value={config.defaultEstimatedDays}
                  onChange={(e) => setConfig({ ...config, defaultEstimatedDays: e.target.value })}
                  className="w-full p-2 bg-[#161822] border border-slate-700 rounded-lg text-white text-xs"
                  placeholder="e.g. 2-4 Days"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Accordions */}
          {activeTab === 'accordions' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Size &amp; Fit Guide Interactive Drawer</span>
                <input
                  type="checkbox"
                  checked={config.enableSizeGuideModal}
                  onChange={(e) => setConfig({ ...config, enableSizeGuideModal: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Fabric Composition &amp; Care Details</span>
                <input
                  type="checkbox"
                  checked={config.enableFabricCareAccordion}
                  onChange={(e) => setConfig({ ...config, enableFabricCareAccordion: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Artisan Heritage &amp; Provenance Story</span>
                <input
                  type="checkbox"
                  checked={config.enableArtisanProvenance}
                  onChange={(e) => setConfig({ ...config, enableArtisanProvenance: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          )}

          {/* Tab 4: Trust Badges */}
          {activeTab === 'badges' && (
            <div className="space-y-2.5 text-xs animate-in fade-in duration-150">
              <div className="text-slate-400 font-medium">Toggle and edit merchant trust guarantees:</div>
              {config.trustBadges.map((b, idx) => (
                <div key={b.id} className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{b.title}</span>
                    <input
                      type="checkbox"
                      checked={b.enabled}
                      onChange={(e) => {
                        const updated = [...config.trustBadges];
                        updated[idx].enabled = e.target.checked;
                        setConfig({ ...config, trustBadges: updated });
                      }}
                      className="accent-rose-500 w-4 h-4 rounded"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">{b.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Upsell */}
          {activeTab === 'crosssell' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Frequently Bought Together Bundle Block</span>
                <input
                  type="checkbox"
                  checked={config.showFrequentlyBoughtTogether}
                  onChange={(e) => setConfig({ ...config, showFrequentlyBoughtTogether: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Customer UGC Photo Reviews &amp; Breakdown</span>
                <input
                  type="checkbox"
                  checked={config.showCustomerReviews}
                  onChange={(e) => setConfig({ ...config, showCustomerReviews: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Complete The Look / Related Products</span>
                <input
                  type="checkbox"
                  checked={config.showRelatedProducts}
                  onChange={(e) => setConfig({ ...config, showRelatedProducts: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Live Reactive Device Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-3">
            <span>LIVE REACTIVE PREVIEW</span>
            <span className="text-emerald-400 font-bold">● Active Storefront Ingress</span>
          </div>

          <div
            className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#0D0F18] p-4 sm:p-6 space-y-6 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Mock PDP Header */}
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-b border-slate-800 pb-2">
              <span>HOME / WOMEN / SILK SAREES</span>
              <span className="text-emerald-400">IN STOCK</span>
            </div>

            {/* Gallery + Buybox Mock */}
            <div className={`grid ${device === 'desktop' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 items-start`}>
              {/* Product Gallery */}
              <div className="space-y-2">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
                    alt="Sample Product"
                    className="w-full h-full object-cover"
                  />
                  {config.showVideoBadge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      🎬 360° Lookbook
                    </span>
                  )}
                </div>
              </div>

              {/* Product Buybox */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Signature Collection</span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Banarasi Katan Silk Saree in Royal Plum
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-slate-400 font-normal">(128 verified reviews)</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-white font-mono">₹2,999</span>
                  <span className="text-xs text-slate-500 line-through font-mono">₹4,999</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                    40% OFF
                  </span>
                </div>

                {config.showStockUrgency && (
                  <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1.5 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Hurry! Only {config.stockThreshold} pieces left in ready stock.</span>
                  </div>
                )}

                {/* Size Selector */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-300">Select Size</span>
                    {config.enableSizeGuideModal && (
                      <span className="text-rose-400 underline cursor-pointer">Size Guide 📏</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {['Free Size', 'Custom Fit'].map((sz, i) => (
                      <span
                        key={sz}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          i === 0
                            ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                            : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 hover:text-white"
                  >
                    Instant 1-Click Checkout ⚡
                  </button>
                </div>

                {/* Delivery info */}
                {config.enableDeliveryEstimator && (
                  <div className="text-[10px] text-slate-300 flex items-center gap-1.5 pt-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Estimated Delivery: <strong>{config.defaultEstimatedDays}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges Mock */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
              {config.trustBadges
                .filter((b) => b.enabled)
                .slice(0, 4)
                .map((b) => (
                  <div key={b.id} className="p-2 bg-[#080A10] rounded-lg border border-slate-800/80 text-[10px] space-y-0.5">
                    <div className="font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{b.title}</span>
                    </div>
                    <div className="text-slate-400 truncate">{b.desc}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
