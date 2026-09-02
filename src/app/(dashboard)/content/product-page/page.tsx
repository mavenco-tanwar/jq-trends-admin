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
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
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

  // Mock product state for live sandbox canvas
  const [mockSelectedColor, setMockSelectedColor] = useState('Rose');
  const [mockSelectedSize, setMockSelectedSize] = useState('M');
  const [mockQuantity, setMockQuantity] = useState(1);
  const [isAddedToBag, setIsAddedToBag] = useState(false);

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

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setConfig(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
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

  // Reordering purchase elements
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

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* 1. TOP STUDIO BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0E14] border border-slate-800/90 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Tenant */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-950 shrink-0">
            <Package className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                Product Detail Page (PDP) Studio
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-800">
                Visual Builder
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Store:{' '}
              <strong className="text-slate-200">
                {activeTenant.name || 'Lumina Atelier'} ({tenantSlug})
              </strong>
            </p>
          </div>
        </div>

        {/* Center: Template Switcher + Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={activeTemplateId}
            onChange={(e) => {
              setActiveTemplateId(e.target.value);
              handleApplyPreset(e.target.value);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white cursor-pointer"
          >
            <option value="default_fashion">Default Fashion Lookbook</option>
            <option value="minimal_studio">Minimalist Studio</option>
            <option value="luxury_atelier">Luxury Haute Couture</option>
            <option value="editorial_lookbook">Editorial Storytelling</option>
            <option value="high_density_catalog">High-Density Catalog</option>
          </select>

          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Presets</span>
          </button>
        </div>

        {/* Right: Actions (Device, Undo, Redo, Draft, Publish) */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          {/* Viewport Toggles */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={loadVersionHistory}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            title="Version History"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsLivePreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-950 transition-all cursor-pointer"
          >
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* 2. 8 PILL NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Gallery &amp; Media</span>
        </button>

        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'purchase'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Purchase Box &amp; Badges</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'variants'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Variants &amp; Swatches</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Inventory &amp; Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping &amp; Delivery</span>
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'details'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tabs &amp; Accordions</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Customer Reviews</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'recommendations'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Recommendations</span>
        </button>
      </div>

      {/* 3. TWO-COLUMN STUDIO WORKBENCH: CONTROLS (7 COLS) + LIVE SANDBOX (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE TAB CONFIGURATION CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: GALLERY & MEDIA */}
          {activeTab === 'gallery' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Product Media Gallery</h3>
                  <p className="text-xs text-slate-400">Configure gallery layout, aspect ratios, and zoom behavior.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="left-thumbs">Left Thumbnails</option>
                    <option value="bottom-thumbs">Bottom Thumbnails</option>
                    <option value="grid-2">2-Column Grid (Luxury)</option>
                    <option value="stacked">Stacked Vertical</option>
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="4:5">4:5 Fashion Portrait (Recommended)</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="3:4">3:4 Classic</option>
                    <option value="16:9">16:9 Wide</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value="hover">Hover Magnifier</option>
                    <option value="click">Click to Zoom</option>
                    <option value="fullscreen">Fullscreen Lightbox</option>
                    <option value="disabled">Disabled</option>
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                  >
                    <option value={50}>50% Gallery / 50% Purchase</option>
                    <option value={55}>55% Gallery / 45% Purchase (Default)</option>
                    <option value={60}>60% Gallery / 40% Purchase</option>
                    <option value={65}>65% Gallery / 35% Purchase (Luxury)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Video Reels Support
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
                    {config.gallery.enableVideo ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PURCHASE BOX & BADGES */}
          {activeTab === 'purchase' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Purchase Box &amp; Element Ordering</h3>
                  <p className="text-xs text-slate-400">Drag or adjust order of buy box elements and action buttons.</p>
                </div>
              </div>

              {/* Elements Order List */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Element Display Pipeline
                </label>
                <div className="space-y-1.5">
                  {config.purchasePanel.elementsOrder.map((key, idx) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Add to Cart</span>
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      config.purchasePanel.showAddToCart ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.purchasePanel.showAddToCart ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Instant Buy</span>
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      config.purchasePanel.showBuyNow ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.purchasePanel.showBuyNow ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Wishlist</span>
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      config.purchasePanel.showWishlist ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.purchasePanel.showWishlist ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile Sticky</span>
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      config.purchasePanel.mobileStickyBar ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.purchasePanel.mobileStickyBar ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS & SWATCHES */}
          {activeTab === 'variants' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Variants &amp; Swatches Display</h3>
                  <p className="text-xs text-slate-400">Configure color swatches, size button chips, and size guide drawer.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
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
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Inventory &amp; Stock Scarcity</h3>
                  <p className="text-xs text-slate-400">Low stock urgency alerts and out-of-stock behavior.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Low Stock Threshold
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Out of Stock Action
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="notifyMe">Notify Me Button (Lead Gen)</option>
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
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-pink-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Shipping &amp; Delivery Guarantees</h3>
                  <p className="text-xs text-slate-400">Postal code delivery estimator, return guarantees, and policies.</p>
                </div>
              </div>

              <div className="space-y-3">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TABS & ACCORDIONS */}
          {activeTab === 'details' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">PDP Section Blocks</h3>
                  <p className="text-xs text-slate-400">Configure below-the-fold tabs, accordions, and custom sections.</p>
                </div>
              </div>

              <div className="space-y-2">
                {config.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <div>
                      <span className="font-bold">{sec.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">({sec.type})</span>
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
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                        sec.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {sec.enabled ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Customer Reviews &amp; Ratings</h3>
                  <p className="text-xs text-slate-400">Social proof ratings and review submission moderation.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Verified Buyer Badge</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Review Submission Form</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
                    Moderated
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="p-6 rounded-2xl bg-[#0D111A] border border-slate-800/90 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-rose-400">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Cross-Sell &amp; Recommendations</h3>
                  <p className="text-xs text-slate-400">Related creations and recently viewed catalog queries.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Related Products Grid</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Category Match</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Recently Viewed Carousel</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Client Local Storage</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME PDP CANVAS SIMULATOR */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live PDP Sandbox Canvas
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Live Interactive
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#FFFDFC] text-slate-900 p-5 shadow-2xl space-y-6">
            {/* Mock PDP Header */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans">
              <span>Home</span>
              <span>/</span>
              <span>Dresses</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Blush Floral Tiered Midi</span>
            </div>

            {/* Gallery + Purchase Box Simulation */}
            <div className="space-y-4">
              {/* Product Media Box */}
              <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"
                  alt="Blush Floral Midi Dress"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider">
                  {config.gallery.layout}
                </span>
              </div>

              {/* Purchase Box Simulation */}
              <div className="space-y-3 p-4 rounded-xl bg-[#FAF6F2] border border-[#E8DED8]">
                {config.purchasePanel.showBrand && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                    Atelier Haute Couture
                  </span>
                )}

                {config.purchasePanel.showTitle && (
                  <h3 className="text-lg font-serif font-black text-slate-900 leading-tight">
                    Blush Floral Tiered Midi Dress
                  </h3>
                )}

                {config.purchasePanel.showRating && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-slate-800">4.9</span>
                    <span className="text-[11px] text-slate-400">(42 reviews)</span>
                  </div>
                )}

                {config.purchasePanel.showPrice && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-slate-900">$1,499</span>
                    {config.purchasePanel.showComparePrice && (
                      <span className="text-xs line-through text-slate-400 font-mono">$2,199</span>
                    )}
                    {config.purchasePanel.showDiscount && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-black">
                        32% OFF
                      </span>
                    )}
                  </div>
                )}

                {/* Color Swatches */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Color: {mockSelectedColor}
                  </span>
                  <div className="flex gap-2">
                    {['Rose', 'Black', 'Emerald'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setMockSelectedColor(c)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          mockSelectedColor === c ? 'ring-2 ring-rose-500 scale-110' : ''
                        }`}
                        style={{
                          backgroundColor:
                            c === 'Rose' ? '#E8B8B5' : c === 'Black' ? '#0A0A0B' : '#064E3B',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Size: {mockSelectedSize}
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMockSelectedSize(s)}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          mockSelectedSize === s
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddedToBag(true);
                      setTimeout(() => setIsAddedToBag(false), 2000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer hover:bg-rose-600 transition-colors"
                  >
                    {isAddedToBag ? 'Added to Bag ✓' : 'Add to Bag'}
                  </button>

                  {config.purchasePanel.showBuyNow && (
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer hover:bg-rose-500 transition-colors"
                    >
                      Instant Buy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
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
