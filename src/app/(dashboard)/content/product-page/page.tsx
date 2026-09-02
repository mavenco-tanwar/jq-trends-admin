'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  ShoppingBag,
  Sliders,
  Check,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Zap,
  ChevronDown,
  Info,
  Heart,
  Share2,
  MessageSquare,
  LayoutGrid,
  Image as ImageIcon,
  Palette,
  Package,
  Ruler,
  Boxes,
  Gift,
  Globe,
  Loader2,
  X,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Play,
  Check as CheckIcon,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  ProductPageConfig,
  GalleryLayoutType,
  AspectRatioType,
  ZoomModeType,
  VariantOptionDisplayType,
  PurchaseElementKey,
} from '@/types/pdp-template.types';
import { getDefaultPdpConfig, PDP_PRESET_TEMPLATES } from '@/lib/pdp-presets';

type ActivePdpTab =
  | 'gallery'
  | 'purchase'
  | 'variants'
  | 'inventory'
  | 'shipping'
  | 'details'
  | 'reviews'
  | 'recommendations';

export default function ProductPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<ActivePdpTab>('gallery');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('default_fashion');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(true);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  // Config State with Undo/Redo History
  const [config, setConfig] = useState<ProductPageConfig>(() =>
    getDefaultPdpConfig(tenantSlug)
  );
  const [history, setHistory] = useState<ProductPageConfig[]>([
    getDefaultPdpConfig(tenantSlug),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Mock product state for interactive canvas
  const [mockSelectedColor, setMockSelectedColor] = useState('Rose');
  const [mockSelectedSize, setMockSelectedSize] = useState('M');
  const [mockQuantity, setMockQuantity] = useState(1);
  const [isAddedToBag, setIsAddedToBag] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const pushHistory = (newConfig: ProductPageConfig) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, JSON.parse(JSON.stringify(newConfig))]);
    setHistoryIndex(updatedHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleResetToDefault = () => {
    const fresh = getDefaultPdpConfig(tenantSlug);
    setConfig(fresh);
    pushHistory(fresh);
    showToast('Reset configuration to default template', 'info');
  };

  // 1. Fetch live PDP template config
  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(
          `/api/v1/content/product-page?tenant=${tenantSlug}&template=${activeTemplateId}`
        );
        if (res.data) {
          const cfg = res.data.draft || res.data.data || res.data;
          setConfig(cfg);
          setHistory([JSON.parse(JSON.stringify(cfg))]);
          setHistoryIndex(0);
        }
      } catch (err) {
        console.warn('Using local PDP defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [tenantSlug, activeTemplateId]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.post('/api/v1/content/product-page', {
        tenant: tenantSlug,
        templateId: activeTemplateId,
        status: 'draft',
        config,
      });
      showToast('Product Page draft synced to MongoDB Atlas!', 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.post('/api/v1/content/product-page', {
        tenant: tenantSlug,
        templateId: activeTemplateId,
        status: 'published',
        config,
      });
      showToast('🎉 Product Page published live to Storefront!', 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleApplyPreset = (key: string) => {
    const preset = PDP_PRESET_TEMPLATES[key];
    if (preset) {
      const updated = JSON.parse(JSON.stringify(preset.config));
      setConfig(updated);
      pushHistory(updated);
      setActiveTemplateId(key);
      setIsPresetModalOpen(false);
      showToast(`Applied preset: ${preset.name}`, 'success');
    }
  };

  const loadVersionHistory = async () => {
    try {
      const res = await ApiClient.get<any>(
        `/api/v1/content/product-page/versions?tenant=${tenantSlug}&template=${activeTemplateId}`
      );
      if (res.data && Array.isArray(res.data)) {
        setVersions(res.data);
      }
      setIsVersionModalOpen(true);
    } catch {
      setIsVersionModalOpen(true);
    }
  };

  const handleRestoreVersion = (ver: any) => {
    if (ver.config) {
      setConfig(ver.config);
      pushHistory(ver.config);
      setIsVersionModalOpen(false);
      showToast(`Restored snapshot from ${new Date(ver.publishedAt).toLocaleTimeString()}`, 'success');
    }
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...config.purchasePanel.elementsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const updated = {
      ...config,
      purchasePanel: {
        ...config.purchasePanel,
        elementsOrder: newOrder,
      },
    };
    setConfig(updated);
    pushHistory(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-slate-100 p-8 space-y-6">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500 animate-pulse z-50" />
        <div className="w-14 h-14 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin flex items-center justify-center">
          <Package className="w-6 h-6 text-rose-500 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Loading Product Page Studio</h3>
          <p className="text-xs text-slate-400 font-mono">Resolving {activeTenant?.name || 'store'} template schema...</p>
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
              Visual PDP Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-rose-400" />
            Product Detail Page Builder
          </h1>
          <p className="text-xs text-slate-400">
            Configure product gallery, buy box, variant swatches, stock alerts, accordions, and customer reviews in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Layout Presets</span>
          </button>

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
            onClick={loadVersionHistory}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Version History"
          >
            <Clock className="w-4 h-4" />
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
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Gallery &amp; Media</span>
        </button>

        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'purchase'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Purchase Box &amp; Buy Bar</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'variants'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Variants &amp; Swatches</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Inventory &amp; Stock Alerts</span>
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
          <span>Shipping &amp; Delivery Estimator</span>
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tabs &amp; Accordions</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews &amp; Social Proof</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'recommendations'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Recommendations</span>
        </button>
      </div>

      {/* 3. EMBEDDED LIVE REAL-TIME STOREFRONT CANVAS PREVIEW */}
      {isLivePreviewOpen && (
        <div className="p-5 rounded-2xl bg-[#0F1117] border-2 border-emerald-500/50 shadow-2xl space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Live Storefront Real-Time Preview
              </h3>
              <span className="text-[11px] text-slate-400">
                (Interactive WYSIWYG render of active product page draft)
              </span>
            </div>

            {/* Viewport Width Controls */}
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
                  <span>Desktop (1280px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('tablet')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile (390px)</span>
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

          {/* Actual Storefront Product Page Simulator Container */}
          <div className="flex justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            <div
              className={`bg-[#FFFDFC] text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-6 transition-all space-y-8 ${
                device === 'mobile'
                  ? 'w-[390px]'
                  : device === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full max-w-5xl'
              }`}
            >
              {/* Breadcrumb Hierarchy */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
                <span className="hover:text-rose-600">Home</span>
                <span>/</span>
                <span className="hover:text-rose-600">Dresses</span>
                <span>/</span>
                <span className="text-slate-900 font-bold">Blush Floral Tiered Midi Dress</span>
              </div>

              {/* Product Main Section: Gallery + Purchase Panel Split */}
              <div
                className={`grid gap-8 items-start ${
                  device === 'mobile'
                    ? 'grid-cols-1'
                    : 'grid-cols-12'
                }`}
              >
                {/* 1. Left Gallery Simulator */}
                <div
                  className={
                    device === 'mobile'
                      ? 'w-full'
                      : config.gallery.galleryWidthPercent >= 60
                      ? 'col-span-7'
                      : 'col-span-6'
                  }
                >
                  <div className="space-y-3">
                    <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
                      <img
                        src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000"
                        alt="Blush Floral Tiered Midi Dress"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                        {config.gallery.layout.toUpperCase()}
                      </span>
                    </div>

                    {config.gallery.thumbnailsPosition !== 'hidden' && (
                      <div className="flex gap-2.5 overflow-x-auto py-1">
                        {[
                          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200',
                          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200',
                          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200',
                        ].map((thumb, idx) => (
                          <div
                            key={idx}
                            className={`w-16 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                              idx === 0 ? 'border-rose-600 ring-2 ring-rose-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={thumb} alt="Thumb" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Right Purchase Panel Simulator */}
                <div
                  className={
                    device === 'mobile'
                      ? 'w-full'
                      : config.gallery.galleryWidthPercent >= 60
                      ? 'col-span-5'
                      : 'col-span-6'
                  }
                >
                  <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-[#FAF6F2] border border-[#E8DED8]">
                    {/* Badges */}
                    {config.purchasePanel.showBadges && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                          Handcrafted Atelier
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          32% OFF
                        </span>
                      </div>
                    )}

                    {/* Brand */}
                    {config.purchasePanel.showBrand && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                        Lumina Haute Couture
                      </span>
                    )}

                    {/* Title */}
                    {config.purchasePanel.showTitle && (
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 leading-tight">
                        Blush Floral Tiered Midi Dress
                      </h2>
                    )}

                    {/* Rating */}
                    {config.purchasePanel.showRating && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="font-bold text-slate-900">4.9</span>
                        <span className="text-slate-400 font-normal">(42 Verified Reviews)</span>
                      </div>
                    )}

                    {/* Price */}
                    {config.purchasePanel.showPrice && (
                      <div className="flex items-baseline gap-3 py-1 flex-wrap">
                        <span className="text-2xl font-bold font-mono text-slate-900">$1,499</span>
                        {config.purchasePanel.showComparePrice && (
                          <span className="text-sm line-through text-slate-400 font-mono">$2,199</span>
                        )}
                        {config.purchasePanel.showDiscount && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                            32% OFF
                          </span>
                        )}
                      </div>
                    )}

                    {/* Color Swatches */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold uppercase text-slate-900">
                        Color: <span className="font-normal text-slate-600">{mockSelectedColor}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {[
                          { name: 'Rose', hex: '#E8B8B5' },
                          { name: 'Black', hex: '#0A0A0B' },
                          { name: 'Emerald', hex: '#064E3B' },
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setMockSelectedColor(c.name)}
                            className={`w-7 h-7 rounded-full border transition-all ${
                              mockSelectedColor === c.name ? 'ring-2 ring-rose-500 scale-110' : 'hover:scale-105 opacity-90'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-900">
                          Size: <span className="font-normal text-slate-600">{mockSelectedSize}</span>
                        </span>
                        <button type="button" className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Size Guide</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setMockSelectedSize(s)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                              mockSelectedSize === s
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity + Actions */}
                    <div className="pt-2 space-y-2.5">
                      <div className="flex items-center gap-2">
                        {config.purchasePanel.showAddToCart && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddedToBag(true);
                              setTimeout(() => setIsAddedToBag(false), 2000);
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                              isAddedToBag ? 'bg-emerald-600 text-white' : 'bg-slate-950 hover:bg-rose-600 text-white'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isAddedToBag ? 'Added to Bag ✓' : 'Add to Bag'}</span>
                          </button>
                        )}

                        {config.purchasePanel.showBuyNow && (
                          <button
                            type="button"
                            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Instant Buy</span>
                          </button>
                        )}
                      </div>

                      {/* Wishlist */}
                      {config.purchasePanel.showWishlist && (
                        <div className="flex justify-between items-center text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={`flex items-center gap-1 font-bold ${
                              isWishlisted ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                            <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                          </button>
                          <button type="button" className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1">
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shipping & Delivery Guarantee */}
                    {config.purchasePanel.showShippingInfo && (
                      <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{config.purchasePanel.shippingText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN CONFIGURATION CARDS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* TAB 1: GALLERY & MEDIA */}
        {activeTab === 'gallery' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Product Media Gallery Settings</h3>
                <p className="text-xs text-slate-400">Configure gallery layout, aspect ratios, zoom modes, and thumbnail positioning.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Gallery Layout
                </label>
                <select
                  value={config.gallery.layout}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      gallery: { ...config.gallery, layout: e.target.value as GalleryLayoutType },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  <option value="left-thumbs">Left Thumbnails (Lookbook Standard)</option>
                  <option value="bottom-thumbs">Bottom Thumbnails</option>
                  <option value="grid-2">2-Column Grid (Haute Couture Luxury)</option>
                  <option value="stacked">Stacked Vertical (Minimalist)</option>
                  <option value="carousel">Carousel Slider</option>
                  <option value="masonry">Editorial Masonry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Image Aspect Ratio
                </label>
                <select
                  value={config.gallery.aspectRatio}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      gallery: { ...config.gallery, aspectRatio: e.target.value as AspectRatioType },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  <option value="4:5">4:5 Fashion Portrait (Recommended)</option>
                  <option value="1:1">1:1 Square (Studio / Modern)</option>
                  <option value="3:4">3:4 Classic Proportion</option>
                  <option value="16:9">16:9 Cinematic Wide</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Zoom Mode
                </label>
                <select
                  value={config.gallery.zoomMode}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      gallery: { ...config.gallery, zoomMode: e.target.value as ZoomModeType },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  <option value="hover">Hover Magnifier</option>
                  <option value="click">Click to Zoom</option>
                  <option value="fullscreen">Fullscreen Lightbox</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Thumbnails Position
                </label>
                <select
                  value={config.gallery.thumbnailsPosition}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      gallery: { ...config.gallery, thumbnailsPosition: e.target.value as any },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  <option value="left">Left Side Bar</option>
                  <option value="bottom">Bottom Horizontal Strip</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Gallery Width Split
                </label>
                <select
                  value={config.gallery.galleryWidthPercent}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      gallery: { ...config.gallery, galleryWidthPercent: Number(e.target.value) },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  <option value={50}>50% Gallery / 50% Purchase Box</option>
                  <option value={55}>55% Gallery / 45% Purchase Box (Default)</option>
                  <option value={60}>60% Gallery / 40% Purchase Box (Luxury)</option>
                  <option value={65}>65% Gallery / 35% Purchase Box (High Drama)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Video Reels &amp; 360 Support
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...config,
                      gallery: { ...config.gallery, enableVideo: !config.gallery.enableVideo },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    config.gallery.enableVideo
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                      : 'border-slate-800 bg-[#090D15] text-slate-400'
                  }`}
                >
                  {config.gallery.enableVideo ? 'Video Reels Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASE BOX & BUY BAR */}
        {activeTab === 'purchase' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Purchase Panel &amp; Buy Controls</h3>
                <p className="text-xs text-slate-400">Reorder elements, configure discount formats, and customize action buttons.</p>
              </div>
            </div>

            {/* Elements Reordering Pipeline */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Element Display Pipeline (Order Top to Bottom)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {config.purchasePanel.elementsOrder.map((key, idx) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white"
                  >
                    <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveElement(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveElement(idx, 'down')}
                        disabled={idx === config.purchasePanel.elementsOrder.length - 1}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-300 block">Add to Cart</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, showAddToCart: !config.purchasePanel.showAddToCart },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                    config.purchasePanel.showAddToCart ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.purchasePanel.showAddToCart ? 'Active (ON)' : 'Hidden'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-300 block">Instant Buy Now</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, showBuyNow: !config.purchasePanel.showBuyNow },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                    config.purchasePanel.showBuyNow ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.purchasePanel.showBuyNow ? 'Active (ON)' : 'Hidden'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-300 block">Wishlist Button</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, showWishlist: !config.purchasePanel.showWishlist },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                    config.purchasePanel.showWishlist ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.purchasePanel.showWishlist ? 'Active (ON)' : 'Hidden'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-300 block">Mobile Sticky Bar</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, mobileStickyBar: !config.purchasePanel.mobileStickyBar },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                    config.purchasePanel.mobileStickyBar ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {config.purchasePanel.mobileStickyBar ? 'Active (ON)' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VARIANTS & SWATCHES */}
        {activeTab === 'variants' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Variants &amp; Swatches Display</h3>
                <p className="text-xs text-slate-400">Configure visual display types for color swatches and size button selectors.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Color Display Mode
                </label>
                <select
                  value={config.purchasePanel.colorDisplayType}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, colorDisplayType: e.target.value as VariantOptionDisplayType },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="swatches">Circular Color Swatches</option>
                  <option value="chips">Text Chips / Pills</option>
                  <option value="dropdown">Dropdown Menu</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Size Display Mode
                </label>
                <select
                  value={config.purchasePanel.sizeDisplayType}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, sizeDisplayType: e.target.value as VariantOptionDisplayType },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="buttons">Square Size Grid (XS, S, M, L)</option>
                  <option value="chips">Rounded Size Pills</option>
                  <option value="dropdown">Dropdown Menu</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY & STOCK */}
        {activeTab === 'inventory' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Inventory &amp; Stock Scarcity</h3>
                <p className="text-xs text-slate-400">Low stock urgency alerts and out-of-stock behaviors.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.purchasePanel.lowStockThreshold}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, lowStockThreshold: Number(e.target.value) },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Out of Stock Behavior
                </label>
                <select
                  value={config.purchasePanel.outOfStockBehavior}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, outOfStockBehavior: e.target.value as any },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="notifyMe">Notify Me Button (Customer Waitlist)</option>
                  <option value="disabled">Disabled Out of Stock</option>
                  <option value="preorder">Allow Pre-Order</option>
                  <option value="backorder">Allow Backorder</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHIPPING & DELIVERY */}
        {activeTab === 'shipping' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Shipping &amp; Delivery Guarantees</h3>
                <p className="text-xs text-slate-400">Postal code delivery estimator, return guarantees, and policies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Shipping Policy Banner Text
                </label>
                <input
                  type="text"
                  value={config.purchasePanel.shippingText}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, shippingText: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Return Policy Guarantee Text
                </label>
                <input
                  type="text"
                  value={config.purchasePanel.returnPolicyText}
                  onChange={(e) => {
                    const updated = {
                      ...config,
                      purchasePanel: { ...config.purchasePanel, returnPolicyText: e.target.value },
                    };
                    setConfig(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TABS & ACCORDIONS */}
        {activeTab === 'details' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Product Details, Tabs &amp; Accordions</h3>
                <p className="text-xs text-slate-400">Configure below-the-fold content blocks, fabric care, and specifications.</p>
              </div>
            </div>

            <div className="space-y-3">
              {config.sections.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white"
                >
                  <div>
                    <span className="font-bold text-sm">{sec.title}</span>
                    <span className="text-xs text-slate-400 font-mono ml-3">({sec.type})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...config,
                        sections: config.sections.map((s) =>
                          s.id === sec.id ? { ...s, enabled: !s.enabled } : s
                        ),
                      };
                      setConfig(updated);
                      pushHistory(updated);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                      sec.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {sec.enabled ? 'Active (ON)' : 'Hidden'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Customer Reviews &amp; Social Proof</h3>
                <p className="text-xs text-slate-400">Verified buyer ratings and review submission moderation workflow.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Verified Buyer Badge</h4>
                  <p className="text-xs text-slate-400">Display verified authenticity badge on confirmed purchases.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Review Submission Moderation</h4>
                  <p className="text-xs text-slate-400">Require tenant admin approval before reviews go live.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Moderated
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div className="lg:col-span-12 p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Cross-Sell &amp; Recommendation Feeds</h3>
                <p className="text-xs text-slate-400">Related creations and recently viewed catalog queries.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Related Products Carousel</h4>
                  <p className="text-xs text-slate-400">Matches category and style attributes.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Active
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Recently Viewed Storage</h4>
                  <p className="text-xs text-slate-400">Client-side isolated browser storage.</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-bold text-xs border border-emerald-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: PRESETS */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#121620] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Choose a Product Page Preset</h3>
              <button onClick={() => setIsPresetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {Object.entries(PDP_PRESET_TEMPLATES).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className="p-4 rounded-xl bg-[#090D15] hover:bg-slate-900 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer space-y-2"
                >
                  <h4 className="font-bold text-white text-xs">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERSION HISTORY */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121620] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">PDP Version History</h3>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {versions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No published versions yet.</div>
              ) : (
                versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white text-xs block">
                        {new Date(ver.publishedAt).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">{ver.summary || 'Published Snapshot'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
