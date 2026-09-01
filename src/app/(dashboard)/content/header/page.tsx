'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Palette,
  Layers,
  Check,
  Globe,
  Sliders,
  Menu,
  ShoppingBag,
  Heart,
  Search,
  User,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  Calendar,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  HeaderConfig,
  HeaderBlock,
  NavigationItem,
  getDefaultHeaderConfig,
} from '@/lib/header-config';

export default function HeaderBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'canvas' | 'navigation' | 'styles' | 'sticky'>('canvas');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Core Configuration State
  const [config, setConfig] = useState<HeaderConfig>(getDefaultHeaderConfig('lumina'));

  // Modals & Drawers State
  const [editingBlock, setEditingBlock] = useState<HeaderBlock | null>(null);
  const [editingNavIndex, setEditingNavIndex] = useState<number | null>(null);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Undo / Redo History
  const [history, setHistory] = useState<HeaderConfig[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newConfig: HeaderConfig) => {
    const next = history.slice(0, historyIdx + 1);
    next.push(JSON.parse(JSON.stringify(newConfig)));
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setConfig(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx(historyIdx - 1);
      showToast('Undid last change', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setConfig(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      showToast('Redid change', 'info');
    }
  };

  const fetchHeaderConfig = async () => {
    try {
      setIsLoading(true);
      const tenant = PlatformService.getActiveTenant();
      setActiveTenant(tenant);
      const slug = tenant.slug || 'lumina';

      const res = await ApiClient.get<any>(`/api/v1/content/header?tenant=${slug}&_t=${Date.now()}`);
      const headerData = res?.data || res;
      if (headerData && (headerData.navigationMenu || headerData.mainHeader || headerData.announcementBar)) {
        setConfig(headerData);
        pushHistory(headerData);
      } else {
        const def = getDefaultHeaderConfig(slug);
        setConfig(def);
        pushHistory(def);
      }
    } catch {
      const def = getDefaultHeaderConfig(activeTenant.slug || 'lumina');
      setConfig(def);
      pushHistory(def);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderConfig();
  }, []);

  const handlePublishLive = async () => {
    try {
      setIsPublishing(true);
      const slug = activeTenant.slug || config.tenantSlug || 'lumina';
      const payload: HeaderConfig = {
        ...config,
        tenantSlug: slug,
        status: 'published',
        updatedAt: new Date().toISOString(),
      };

      const res = await ApiClient.put(`/api/v1/content/header?tenant=${slug}`, payload);
      const savedConfig = res?.data || payload;
      setConfig(savedConfig);
      pushHistory(savedConfig);
      showToast(`Header configuration for ${slug.toUpperCase()} published live to MongoDB Atlas!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to publish header', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const slug = activeTenant.slug || config.tenantSlug || 'lumina';
      const payload = {
        ...config,
        tenantSlug: slug,
        status: 'draft',
      };
      await ApiClient.put(`/api/v1/content/header?tenant=${slug}`, payload);
      showToast('Draft header configuration saved to database.', 'success');
    } catch {
      showToast('Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Reset header to default platform template for this store?')) {
      const def = getDefaultHeaderConfig(activeTenant.slug || 'lumina');
      setConfig(def);
      pushHistory(def);
      showToast('Reset to default header template', 'info');
    }
  };

  // Block Helpers
  const updateBlock = (updated: HeaderBlock) => {
    const isAnn = updated.zone.startsWith('announcement');
    if (isAnn) {
      const nextBlocks = config.announcementBar.blocks.map((b) => (b.id === updated.id ? updated : b));
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    } else {
      const nextBlocks = config.mainHeader.blocks.map((b) => (b.id === updated.id ? updated : b));
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    }
    setEditingBlock(null);
    showToast(`Updated block ${updated.type}`, 'success');
  };

  const deleteBlock = (id: string, isAnnouncement: boolean) => {
    if (isAnnouncement) {
      const nextBlocks = config.announcementBar.blocks.filter((b) => b.id !== id);
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    } else {
      const nextBlocks = config.mainHeader.blocks.filter((b) => b.id !== id);
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    }
    showToast('Block removed', 'info');
  };

  const toggleBlockVisibility = (id: string, isAnnouncement: boolean) => {
    if (isAnnouncement) {
      const nextBlocks = config.announcementBar.blocks.map((b) =>
        b.id === id ? { ...b, enabled: b.enabled === false ? true : false } : b
      );
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    } else {
      const nextBlocks = config.mainHeader.blocks.map((b) =>
        b.id === id ? { ...b, enabled: b.enabled === false ? true : false } : b
      );
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: nextBlocks } };
      setConfig(next);
      pushHistory(next);
    }
  };

  const moveBlock = (id: string, isAnnouncement: boolean, direction: 'up' | 'down') => {
    const list = isAnnouncement
      ? [...config.announcementBar.blocks]
      : [...config.mainHeader.blocks];
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }

    const reordered = list.map((b, i) => ({ ...b, order: i + 1 }));
    if (isAnnouncement) {
      const next = { ...config, announcementBar: { ...config.announcementBar, blocks: reordered } };
      setConfig(next);
      pushHistory(next);
    } else {
      const next = { ...config, mainHeader: { ...config.mainHeader, blocks: reordered } };
      setConfig(next);
      pushHistory(next);
    }
  };

  const addBlockToZone = (zone: HeaderBlock['zone'], type: HeaderBlock['type']) => {
    const isAnn = zone.startsWith('announcement');
    const newId = `${type}_${Date.now().toString().slice(-4)}`;

    const newBlock: HeaderBlock = {
      id: newId,
      type,
      zone,
      enabled: true,
      order: 99,
      settings:
        type === 'logo'
          ? { logoText: activeTenant.name, badgeText: activeTenant.tagline }
          : type === 'search'
          ? { mode: 'icon-label', label: 'SEARCH', placeholder: 'Search...' }
          : type === 'announcement'
          ? { text: 'Special seasonal promotion live now • Limited quantities available •', ctaText: 'EXPLORE', ctaUrl: '/sale' }
          : type === 'whatsapp'
          ? { label: 'WhatsApp Concierge', phone: '18004125864' }
          : type === 'cta'
          ? { label: 'BOOK CONSULTATION', url: '/contact' }
          : { text: activeTenant.name },
      responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
    };

    if (isAnn) {
      const next = {
        ...config,
        announcementBar: {
          ...config.announcementBar,
          blocks: [...config.announcementBar.blocks, newBlock],
        },
      };
      setConfig(next);
      pushHistory(next);
    } else {
      const next = {
        ...config,
        mainHeader: {
          ...config.mainHeader,
          blocks: [...config.mainHeader.blocks, newBlock],
        },
      };
      setConfig(next);
      pushHistory(next);
    }
    showToast(`Added ${type} block to ${zone}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Visual Theme Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({activeTenant.slug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-rose-400" />
            Header &amp; Navigation Builder
          </h1>
          <p className="text-xs text-slate-400">
            Design, arrange, customize colors, typography, and mega menus for your storefront header in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Device Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                device === 'desktop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                device === 'tablet' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                device === 'mobile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            title="Undo"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetToDefault}
            title="Reset to default template"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 rotate-180" />
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing || isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-950/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing Live...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Primary Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'canvas'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Zone Layout &amp; Canvas</span>
        </button>

        <button
          onClick={() => setActiveTab('navigation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'navigation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Navigation &amp; Mega Menus ({config.navigationMenu?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('styles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'styles'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme &amp; Style Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('sticky')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sticky'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Sticky &amp; Responsive Behavior</span>
        </button>
      </div>

      {/* Tab 1: Zone Layout & Canvas */}
      {activeTab === 'canvas' && (
        <div className="space-y-6">
          {/* Zone 1: Announcement Bar */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Announcement &amp; Utility Bar</h3>
                  <p className="text-[11px] text-slate-400">Top row for promo alerts, phone/WhatsApp concierge, and currency switcher.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <span>Enable Bar</span>
                  <input
                    type="checkbox"
                    checked={config.announcementBar.enabled}
                    onChange={(e) => {
                      const next = {
                        ...config,
                        announcementBar: { ...config.announcementBar, enabled: e.target.checked },
                      };
                      setConfig(next);
                      pushHistory(next);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left Zone */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Left Zone</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('announcement.left', e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="icon">✦ Icon + Text</option>
                    <option value="whatsapp">WhatsApp Concierge</option>
                    <option value="phone">Phone Support</option>
                    <option value="text">Static Text</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {config.announcementBar.blocks
                    .filter((b) => b.zone === 'announcement.left')
                    .map((block) => (
                      <div
                        key={block.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          block.enabled !== false
                            ? 'bg-slate-800/80 border-slate-700 text-white'
                            : 'bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-slate-400">#{block.order}</span>
                          <span className="font-bold truncate">{block.settings?.text || block.settings?.label || block.type}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleBlockVisibility(block.id, true)}
                            className="p-1 hover:text-white"
                          >
                            {block.enabled !== false ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBlock(block.id, true)} className="p-1 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Center Zone */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Center Zone (Hero Alert)</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('announcement.center', e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="announcement">Promo Banner + CTA</option>
                    <option value="text">Announcement Text</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {config.announcementBar.blocks
                    .filter((b) => b.zone === 'announcement.center')
                    .map((block) => (
                      <div
                        key={block.id}
                        className="p-2.5 rounded-lg border bg-slate-800/80 border-slate-700 text-white flex items-center justify-between text-xs"
                      >
                        <div className="truncate flex items-center gap-2">
                          <span className="font-bold truncate">{block.settings?.text || 'Announcement'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBlock(block.id, true)} className="p-1 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Right Zone */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Right Zone</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('announcement.right', e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="currency">🌐 Currency Switcher</option>
                    <option value="text">Store Label</option>
                    <option value="cta">Custom CTA</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {config.announcementBar.blocks
                    .filter((b) => b.zone === 'announcement.right')
                    .map((block) => (
                      <div
                        key={block.id}
                        className="p-2.5 rounded-lg border bg-slate-800/80 border-slate-700 text-white flex items-center justify-between text-xs"
                      >
                        <div className="truncate flex items-center gap-2">
                          <span className="font-bold truncate">{block.settings?.text || block.type}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBlock(block.id, true)} className="p-1 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Zone 2: Main Header Row */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  M
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Main Ecommerce Navigation Row</h3>
                  <p className="text-[11px] text-slate-400">Controls Brand Logo, Main Navigation links, Search, Wishlist, Cart, and Account.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Left Zone (Logo) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Main Left (Logo &amp; Brand)</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('main.left', e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="logo">Brand Logo</option>
                    <option value="brand">Brand Name</option>
                    <option value="tagline">Tagline</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {config.mainHeader.blocks
                    .filter((b) => b.zone === 'main.left')
                    .map((block) => (
                      <div
                        key={block.id}
                        className="p-3 rounded-lg border bg-slate-800/80 border-slate-700 text-white flex items-center justify-between text-xs"
                      >
                        <div className="truncate flex items-center gap-2">
                          <span className="font-bold">{block.settings?.logoText || 'Logo Block'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBlock(block.id, false)} className="p-1 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Main Center Zone (Navigation) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Main Center (Navigation)</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('main.center', e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="navigation">Primary Navigation Menu</option>
                    <option value="search">Inline Search Bar</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {config.mainHeader.blocks
                    .filter((b) => b.zone === 'main.center')
                    .map((block) => (
                      <div
                        key={block.id}
                        className="p-3 rounded-lg border bg-slate-800/80 border-slate-700 text-white flex items-center justify-between text-xs"
                      >
                        <div className="truncate flex items-center gap-2">
                          <span className="font-bold">Primary Navigation Menu ({config.navigationMenu?.length} items)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setActiveTab('navigation')} className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold">
                            Manage Links
                          </button>
                          <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Main Right Zone (Utilities) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Main Right (Utilities)</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlockToZone('main.right', e.target.value as any);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                  >
                    <option value="">+ Add Block</option>
                    <option value="search">🔍 Search Button</option>
                    <option value="wishlist">♡ Wishlist Button</option>
                    <option value="cart">🛍 Bag / Cart Button</option>
                    <option value="account">👤 Sign In / Account</option>
                    <option value="currency">🌐 Currency Picker</option>
                    <option value="cta">Custom CTA</option>
                  </select>
                </div>

                <div className="space-y-2 min-h-[120px]">
                  {config.mainHeader.blocks
                    .filter((b) => b.zone === 'main.right')
                    .map((block) => (
                      <div
                        key={block.id}
                        className="p-2.5 rounded-lg border bg-slate-800/80 border-slate-700 text-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold uppercase tracking-wider">{block.settings?.label || block.type}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => moveBlock(block.id, false, 'up')} className="p-1 hover:text-white" title="Move Up">
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button onClick={() => moveBlock(block.id, false, 'down')} className="p-1 hover:text-white" title="Move Down">
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditingBlock(block)} className="p-1 hover:text-rose-400">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteBlock(block.id, false)} className="p-1 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Navigation & Mega Menus */}
      {activeTab === 'navigation' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Store Navigation Menu Items</h3>
              <p className="text-xs text-slate-400">Add, reorder, assign badges (FRESH, HOT, SALE), and configure multi-column Mega Menus.</p>
            </div>
            <button
              onClick={() => {
                const newItem: NavigationItem = {
                  id: `nav_${Date.now()}`,
                  label: 'NEW ITEM',
                  url: '/women',
                  order: (config.navigationMenu?.length || 0) + 1,
                  enabled: true,
                };
                const next = { ...config, navigationMenu: [...(config.navigationMenu || []), newItem] };
                setConfig(next);
                pushHistory(next);
                setEditingNavIndex(next.navigationMenu.length - 1);
                setIsNavModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.navigationMenu?.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">#{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.label}</span>
                      {item.badge && (
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase text-white"
                          style={{ backgroundColor: item.badge.bg || '#F59E0B' }}
                        >
                          {item.badge.text}
                        </span>
                      )}
                      {item.megaMenu?.enabled && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Mega Menu ({item.megaMenu.columns?.length || 0} cols)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (idx > 0) {
                        const list = [...config.navigationMenu];
                        const temp = list[idx];
                        list[idx] = list[idx - 1];
                        list[idx - 1] = temp;
                        const next = { ...config, navigationMenu: list };
                        setConfig(next);
                        pushHistory(next);
                      }
                    }}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (idx < config.navigationMenu.length - 1) {
                        const list = [...config.navigationMenu];
                        const temp = list[idx];
                        list[idx] = list[idx + 1];
                        list[idx + 1] = temp;
                        const next = { ...config, navigationMenu: list };
                        setConfig(next);
                        pushHistory(next);
                      }
                    }}
                    disabled={idx === config.navigationMenu.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingNavIndex(idx);
                      setIsNavModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-rose-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      const next = {
                        ...config,
                        navigationMenu: config.navigationMenu.filter((_, i) => i !== idx),
                      };
                      setConfig(next);
                      pushHistory(next);
                      showToast('Deleted menu item', 'info');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Theme & Style Colors */}
      {activeTab === 'styles' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Header Theme &amp; Color Palette</h3>
            <p className="text-xs text-slate-400">Configure global background, text colors, accent highlights, and typography tokens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Main Header Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.mainHeader.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.mainHeader.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Main Header Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.mainHeader.styles.textColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, textColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.mainHeader.styles.textColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, textColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Accent Highlight Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.mainHeader.styles.accentColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, accentColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.mainHeader.styles.accentColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mainHeader: {
                        ...config.mainHeader,
                        styles: { ...config.mainHeader.styles, accentColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Announcement Bar Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.announcementBar.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        styles: { ...config.announcementBar.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.announcementBar.styles.backgroundColor}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      announcementBar: {
                        ...config.announcementBar,
                        styles: { ...config.announcementBar.styles, backgroundColor: e.target.value },
                      },
                    };
                    setConfig(next);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Typography Font Family</label>
              <select
                value={config.mainHeader.styles.fontFamily}
                onChange={(e) => {
                  const next = {
                    ...config,
                    mainHeader: {
                      ...config.mainHeader,
                      styles: { ...config.mainHeader.styles, fontFamily: e.target.value },
                    },
                  };
                  setConfig(next);
                  pushHistory(next);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
              >
                <option value="Playfair Display, serif">Playfair Display (Luxury Editorial)</option>
                <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Modern Clean)</option>
                <option value="Inter, sans-serif">Inter (Minimalist Neo-Grotesque)</option>
                <option value="Cinzel, serif">Cinzel (Classical Haute Roman)</option>
                <option value="Montserrat, sans-serif">Montserrat (Geometric Bold)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Sticky & Responsive Settings */}
      {activeTab === 'sticky' && (
        <div className="p-6 rounded-2xl bg-[#12141D] border border-slate-800 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Sticky Header &amp; Mobile Drawer Settings</h3>
            <p className="text-xs text-slate-400">Configure scroll thresholds, shrink animations, and mobile drawer styling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sticky Behavior</h4>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sticky.enabled}
                  onChange={(e) => {
                    const next = { ...config, sticky: { ...config.sticky, enabled: e.target.checked } };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Enable Sticky Header</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sticky.shrinkOnScroll}
                  onChange={(e) => {
                    const next = { ...config, sticky: { ...config.sticky, shrinkOnScroll: e.target.checked } };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Shrink Height on Scroll (80px &rarr; 68px)</span>
              </label>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mobile Drawer Settings</h4>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mobile.drawer.showCurrency}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mobile: {
                        ...config.mobile,
                        drawer: { ...config.mobile.drawer, showCurrency: e.target.checked },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Show Currency Selector in Drawer</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mobile.drawer.showSocialIcons}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      mobile: {
                        ...config.mobile,
                        drawer: { ...config.mobile.drawer, showSocialIcons: e.target.checked },
                      },
                    };
                    setConfig(next);
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Show Social Icons in Drawer</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Block Inspector Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#12141D] border border-slate-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Edit {editingBlock.type} Block Settings
              </h3>
              <button onClick={() => setEditingBlock(null)} className="p-1 hover:text-white text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
              {/* Common Label / Text field */}
              {editingBlock.type !== 'divider' && editingBlock.type !== 'spacer' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Text / Label Content</label>
                  <input
                    type="text"
                    value={editingBlock.settings?.text || editingBlock.settings?.label || editingBlock.settings?.logoText || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingBlock({
                        ...editingBlock,
                        settings: {
                          ...editingBlock.settings,
                          text: val,
                          label: val,
                          logoText: val,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                  />
                </div>
              )}

              {/* Logo specific fields */}
              {editingBlock.type === 'logo' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Tagline / Subtitle Badge</label>
                    <input
                      type="text"
                      value={editingBlock.settings?.badgeText || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, badgeText: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">Custom Logo Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://.../logo.png"
                      value={editingBlock.settings?.logoUrl || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, logoUrl: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              {/* Announcement specific CTA fields */}
              {editingBlock.type === 'announcement' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      value={editingBlock.settings?.ctaText || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, ctaText: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300">CTA Link Destination</label>
                    <input
                      type="text"
                      value={editingBlock.settings?.ctaUrl || ''}
                      onChange={(e) => {
                        setEditingBlock({
                          ...editingBlock,
                          settings: { ...editingBlock.settings, ctaUrl: e.target.value },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}

              {/* Search Block Mode */}
              {editingBlock.type === 'search' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Search Display Mode</label>
                  <select
                    value={editingBlock.settings?.mode || 'icon-label'}
                    onChange={(e) => {
                      setEditingBlock({
                        ...editingBlock,
                        settings: { ...editingBlock.settings, mode: e.target.value },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="icon-label">Icon + Label (e.g. 🔍 SEARCH or 🔍 FIND)</option>
                    <option value="icon-only">Icon Only (🔍)</option>
                    <option value="inline">Embedded Input Field</option>
                  </select>
                </div>
              )}

              {/* Scheduling Window */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    Scheduled Campaign Window
                  </span>
                  <input
                    type="checkbox"
                    checked={editingBlock.visibility?.scheduleEnabled || false}
                    onChange={(e) => {
                      setEditingBlock({
                        ...editingBlock,
                        visibility: {
                          ...editingBlock.visibility,
                          scheduleEnabled: e.target.checked,
                        },
                      });
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>

                {editingBlock.visibility?.scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Start Date</label>
                      <input
                        type="date"
                        value={editingBlock.visibility?.startDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          setEditingBlock({
                            ...editingBlock,
                            visibility: {
                              ...editingBlock.visibility,
                              startDate: e.target.value,
                            },
                          });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">End Date</label>
                      <input
                        type="date"
                        value={editingBlock.visibility?.endDate?.split('T')[0] || ''}
                        onChange={(e) => {
                          setEditingBlock({
                            ...editingBlock,
                            visibility: {
                              ...editingBlock.visibility,
                              endDate: e.target.value,
                            },
                          });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => updateBlock(editingBlock)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/30"
              >
                Save Block Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Item & Mega Menu Editor Modal */}
      {isNavModalOpen && editingNavIndex !== null && config.navigationMenu?.[editingNavIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-[#12141D] border border-slate-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Edit Navigation Item: {config.navigationMenu[editingNavIndex].label}
              </h3>
              <button onClick={() => setIsNavModalOpen(false)} className="p-1 hover:text-white text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Menu Label</label>
                  <input
                    type="text"
                    value={config.navigationMenu[editingNavIndex].label}
                    onChange={(e) => {
                      const list = [...config.navigationMenu];
                      list[editingNavIndex].label = e.target.value;
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">URL Destination</label>
                  <input
                    type="text"
                    value={config.navigationMenu[editingNavIndex].url}
                    onChange={(e) => {
                      const list = [...config.navigationMenu];
                      list[editingNavIndex].url = e.target.value;
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Badge Configuration */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white">Callout Badge (e.g. FRESH, HOT, NEW, SALE)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. FRESH or HOT"
                      value={config.navigationMenu[editingNavIndex].badge?.text || ''}
                      onChange={(e) => {
                        const list = [...config.navigationMenu];
                        const text = e.target.value;
                        if (!text) {
                          delete list[editingNavIndex].badge;
                        } else {
                          list[editingNavIndex].badge = {
                            ...(list[editingNavIndex].badge || {}),
                            text,
                            type: 'fresh',
                          };
                        }
                        setConfig({ ...config, navigationMenu: list });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Badge Color</label>
                    <input
                      type="color"
                      value={config.navigationMenu[editingNavIndex].badge?.bg || '#F59E0B'}
                      onChange={(e) => {
                        const list = [...config.navigationMenu];
                        if (list[editingNavIndex].badge) {
                          list[editingNavIndex].badge!.bg = e.target.value;
                          setConfig({ ...config, navigationMenu: list });
                        }
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Mega Menu Toggle */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">Mega Menu Multi-Column Dropdown</h4>
                    <p className="text-[11px] text-slate-400">Exposes multi-column grouped categories and spotlight lookbook banners.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.navigationMenu[editingNavIndex].megaMenu?.enabled || false}
                    onChange={(e) => {
                      const list = [...config.navigationMenu];
                      if (e.target.checked) {
                        list[editingNavIndex].megaMenu = {
                          enabled: true,
                          columns: [
                            {
                              id: 'col_1',
                              title: 'Curated Categories',
                              links: [
                                { label: 'Architectural Silhouettes', url: '/women' },
                                { label: 'Artisanal Linens & Silks', url: '/women' },
                                { label: 'Tailored Sculptural Tops', url: '/women' },
                              ],
                            },
                            {
                              id: 'col_promo',
                              title: 'Spotlight Capsule',
                              links: [],
                              promoBanner: {
                                image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
                                heading: 'Master Capsule 2026',
                                ctaText: 'Shop Lookbook',
                                ctaUrl: '/women',
                              },
                            },
                          ],
                        };
                      } else {
                        if (list[editingNavIndex].megaMenu) {
                          list[editingNavIndex].megaMenu!.enabled = false;
                        }
                      }
                      setConfig({ ...config, navigationMenu: list });
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  pushHistory(config);
                  setIsNavModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Save Navigation Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
