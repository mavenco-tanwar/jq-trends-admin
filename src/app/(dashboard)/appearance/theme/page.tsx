'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Type,
  Square,
  Sliders,
  LayoutTemplate,
  Tag,
  ExternalLink,
  Sparkles,
  Boxes,
  Smartphone,
  Minus,
  CheckCircle2,
  Layers,
  Code,
  Share2,
  RotateCcw,
  Save,
  Check,
  Eye,
  Monitor,
  Tablet,
  Clock,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronRight,
  Heart,
  ShoppingBag,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  Info,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ThemeDocument } from '@/types/theme.types';
import { getDefaultTheme, THEME_PRESETS } from '@/lib/theme-presets';
import { generateThemeCssVariables } from '@/lib/theme-engine';
import { POPULAR_FONTS } from '@/components/builder/tokens/themeTokens';

type ActiveCategory =
  | 'colors'
  | 'typography'
  | 'buttons'
  | 'forms'
  | 'cards'
  | 'badges'
  | 'links'
  | 'icons'
  | 'spacing'
  | 'responsive'
  | 'borders'
  | 'radius'
  | 'shadows'
  | 'custom_css'
  | 'import_export'
  | 'versions';

export default function ThemeBuilderStudio() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('colors');
  const [activeTenant, setActiveTenant] = useState(PlatformService.getActiveTenant());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [jsonExportString, setJsonExportString] = useState('');
  const [jsonImportString, setJsonImportString] = useState('');

  // Core Theme State
  const [theme, setTheme] = useState<ThemeDocument>(getDefaultTheme('lumina', 'Lumina Atelier'));

  // Undo / Redo History
  const [history, setHistory] = useState<ThemeDocument[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const pushHistory = (newTheme: ThemeDocument) => {
    const next = history.slice(0, historyIdx + 1);
    next.push(JSON.parse(JSON.stringify(newTheme)));
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setTheme(JSON.parse(JSON.stringify(prev)));
      setHistoryIdx(historyIdx - 1);
      showToast('Undid last change', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setTheme(JSON.parse(JSON.stringify(next)));
      setHistoryIdx(historyIdx + 1);
      showToast('Redid change', 'info');
    }
  };

  // Load Initial Theme
  useEffect(() => {
    async function loadTheme() {
      setIsLoading(true);
      try {
        const tenant = PlatformService.getActiveTenant();
        setActiveTenant(tenant);
        const slug = (tenant?.slug || 'lumina').toLowerCase().trim();

        const res = await ApiClient.get<ThemeDocument>(`/api/v1/theme?tenant=${slug}&preview=draft&_t=${Date.now()}`);
        if (res.data) {
          setTheme(res.data);
          setHistory([JSON.parse(JSON.stringify(res.data))]);
          setHistoryIdx(0);
        } else {
          const fallback = getDefaultTheme(slug, tenant?.name || 'Lumina Atelier');
          setTheme(fallback);
          setHistory([JSON.parse(JSON.stringify(fallback))]);
          setHistoryIdx(0);
        }
      } catch (err) {
        console.warn('Failed to load theme from API, using default preset:', err);
        const t = PlatformService.getActiveTenant();
        const fallback = getDefaultTheme(t?.slug || 'lumina', t?.name || 'Lumina Atelier');
        setTheme(fallback);
        setHistory([JSON.parse(JSON.stringify(fallback))]);
        setHistoryIdx(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadTheme();
  }, []);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      await ApiClient.put(`/api/v1/theme?tenant=${slug}`, {
        ...theme,
        tenantId: slug,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      });
      showToast('Draft theme configuration saved to MongoDB Atlas', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save draft theme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Live
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      const nextVersion = (theme.version || 1) + 1;
      const pubDoc: ThemeDocument = {
        ...theme,
        tenantId: slug,
        version: nextVersion,
        status: 'published',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ApiClient.put(`/api/v1/theme?tenant=${slug}`, pubDoc);
      setTheme(pubDoc);
      pushHistory(pubDoc);
      showToast(`Design System Version ${nextVersion} published live to storefront!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish theme', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Load Version History
  const handleOpenVersions = async () => {
    setIsVersionsModalOpen(true);
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      const res = await ApiClient.get<any[]>(`/api/v1/theme/versions?tenant=${slug}`);
      if (res.data) {
        setVersionHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load version history:', err);
    }
  };

  // Restore Version
  const handleRestoreVersion = async (vNum: number) => {
    try {
      const slug = activeTenant?.slug || theme.tenantId || 'lumina';
      const res = await ApiClient.post<any>(`/api/v1/theme/versions?tenant=${slug}`, { version: vNum });
      if (res.data) {
        setTheme({ ...res.data, status: 'draft' });
        pushHistory({ ...res.data, status: 'draft' });
        setIsVersionsModalOpen(false);
        showToast(`Restored Version ${vNum} to draft`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to restore version', 'error');
    }
  };

  // Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const slug = activeTenant?.slug || 'lumina';
    const name = activeTenant?.name || 'Lumina Atelier';
    const newTheme = preset.getTheme(slug, name);
    newTheme.status = 'draft';
    setTheme(newTheme);
    pushHistory(newTheme);
    setIsPresetsModalOpen(false);
    showToast(`Applied ${preset.name} Preset`, 'info');
  };

  // Dynamic CSS Variables String
  const previewCss = useMemo(() => {
    return generateThemeCssVariables(theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant?.name ? `${activeTenant.name} ` : ''}Design System Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col select-none">
      {/* Dynamic CSS Token Sandbox for Live Preview */}
      <style dangerouslySetInnerHTML={{ __html: previewCss }} />

      {/* 1. TOP STUDIO BAR */}
      <header className="h-16 border-b border-slate-800/90 bg-[#0B0F19]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 z-30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/40 shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white tracking-wide truncate">
                Global Theme &amp; Design System Builder
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0">
                Studio
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              Store: <strong className="text-white">{activeTenant?.name || 'Lumina Atelier'}</strong>{' '}
              <span className="text-slate-600">({activeTenant?.slug || 'lumina'})</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Presets Button */}
          <button
            onClick={() => setIsPresetsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme Presets</span>
          </button>

          {/* Device Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${
                device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop Preview"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${
                device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet Preview (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Preview (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className={`p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ${
                historyIdx <= 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className={`p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors ${
                historyIdx >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Redo"
            >
              <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" />
            </button>
          </div>

          {/* Version History Button */}
          <button
            onClick={handleOpenVersions}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all"
            title="Version History"
          >
            <Clock className="w-4 h-4 text-sky-400" />
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Publish Live */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </header>

      {/* 2. THREE-PANE STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: CATEGORY NAVIGATION */}
        <aside className="w-64 border-r border-slate-800/80 bg-[#090D15] p-4 flex flex-col gap-6 overflow-y-auto shrink-0">
          {/* DESIGN CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
              Design System
            </span>
            <button
              onClick={() => setActiveCategory('colors')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'colors'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Colors &amp; Gradients</span>
            </button>

            <button
              onClick={() => setActiveCategory('typography')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'typography'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Type className="w-4 h-4 text-indigo-400" />
              <span>Typography &amp; Scale</span>
            </button>

            <button
              onClick={() => setActiveCategory('buttons')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'buttons'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Square className="w-4 h-4 text-amber-400" />
              <span>Buttons &amp; CTAs</span>
            </button>

            <button
              onClick={() => setActiveCategory('forms')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'forms'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Forms &amp; Inputs</span>
            </button>

            <button
              onClick={() => setActiveCategory('cards')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'cards'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <LayoutTemplate className="w-4 h-4 text-sky-400" />
              <span>Cards &amp; Product Cards</span>
            </button>

            <button
              onClick={() => setActiveCategory('badges')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'badges'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Tag className="w-4 h-4 text-pink-400" />
              <span>Badges &amp; Tags</span>
            </button>

            <button
              onClick={() => setActiveCategory('links')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'links'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Links &amp; Hover States</span>
            </button>
          </div>

          {/* LAYOUT CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
              Layout &amp; Structure
            </span>
            <button
              onClick={() => setActiveCategory('spacing')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'spacing'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Spacing &amp; Containers</span>
            </button>

            <button
              onClick={() => setActiveCategory('responsive')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'responsive'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span>Responsive Breakpoints</span>
            </button>
          </div>

          {/* EFFECTS CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
              Effects &amp; Elevation
            </span>
            <button
              onClick={() => setActiveCategory('borders')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'borders'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Minus className="w-4 h-4 text-violet-400" />
              <span>Borders &amp; Strokes</span>
            </button>

            <button
              onClick={() => setActiveCategory('radius')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'radius'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Corner Radius Scale</span>
            </button>

            <button
              onClick={() => setActiveCategory('shadows')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'shadows'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Elevation &amp; Shadows</span>
            </button>
          </div>

          {/* ADVANCED CATEGORY */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
              Advanced &amp; Dev
            </span>
            <button
              onClick={() => setActiveCategory('custom_css')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                activeCategory === 'custom_css'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Code className="w-4 h-4 text-amber-400" />
              <span>Tenant Custom CSS</span>
            </button>

            <button
              onClick={() => {
                setJsonExportString(JSON.stringify(theme, null, 2));
                setIsImportExportModalOpen(true);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 flex items-center gap-2.5 transition-all text-left"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Import / Export JSON</span>
            </button>
          </div>
        </aside>

        {/* CENTER PANE: LIVE STOREFRONT PREVIEW SANDBOX */}
        <main className="flex-1 bg-[#05070B] overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-start relative">
          <div
            className={`transition-all duration-300 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${
              device === 'desktop'
                ? 'w-full max-w-5xl'
                : device === 'tablet'
                ? 'w-[768px]'
                : 'w-[390px]'
            }`}
            style={{
              backgroundColor: 'var(--theme-color-background)',
              color: 'var(--theme-color-text)',
              fontFamily: 'var(--theme-font-body)',
            }}
          >
            {/* Storefront Header Sample */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{
                backgroundColor: 'var(--theme-color-surface)',
                borderColor: 'var(--theme-color-border)',
              }}
            >
              <span
                className="font-black tracking-widest uppercase text-base"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  color: 'var(--theme-color-heading)',
                }}
              >
                {activeTenant?.name || 'STOREFRONT'}
              </span>

              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
                <span style={{ color: 'var(--theme-color-text)' }}>New Arrivals</span>
                <span style={{ color: 'var(--theme-color-text)' }}>Women</span>
                <span style={{ color: 'var(--theme-color-text)' }}>Men</span>
                <span style={{ color: 'var(--theme-color-accent)' }}>Sale</span>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" style={{ color: 'var(--theme-color-text)' }} />
                <ShoppingBag className="w-4 h-4" style={{ color: 'var(--theme-color-text)' }} />
              </div>
            </div>

            {/* Hero Campaign Sample Banner */}
            <div className="p-8 sm:p-12 text-center space-y-4">
              <span
                className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider inline-block rounded"
                style={{
                  backgroundColor: 'var(--theme-color-accent)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--theme-radius-sm)',
                }}
              >
                Spring Drop 2026
              </span>

              <h2
                className="font-black tracking-tight"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  fontSize: 'var(--theme-h1-size)',
                  lineHeight: 'var(--theme-h1-line-height)',
                  color: 'var(--theme-color-heading)',
                }}
              >
                Elegance Designed For You.
              </h2>

              <p
                className="max-w-lg mx-auto text-xs sm:text-sm"
                style={{ color: 'var(--theme-color-text-secondary)' }}
              >
                Discover precision tailoring, handcrafted essentials, and seamless shopping engineered by Mavenco Commerce.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: 'var(--theme-btn-primary-bg)',
                    color: 'var(--theme-btn-primary-text)',
                    borderRadius: 'var(--theme-btn-radius)',
                  }}
                >
                  Shop The Collection
                </button>
                <button
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-color-surface)',
                    color: 'var(--theme-color-text)',
                    borderColor: 'var(--theme-color-border)',
                    borderRadius: 'var(--theme-btn-radius)',
                  }}
                >
                  Explore Lookbook
                </button>
              </div>
            </div>

            {/* Sample Product Cards Grid */}
            <div className="p-6 sm:p-8 border-t" style={{ borderColor: 'var(--theme-color-border)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="font-bold text-lg"
                  style={{
                    fontFamily: 'var(--theme-font-heading)',
                    color: 'var(--theme-color-heading)',
                  }}
                >
                  Featured Essentials
                </h3>
                <span className="text-xs font-bold cursor-pointer" style={{ color: 'var(--theme-color-accent)' }}>
                  View All &rarr;
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: '1', title: 'Silk Organza Co-Ord Set', price: '$280.00', compare: '$340.00', badge: 'NEW' },
                  { id: '2', title: 'Artisanal Chanderi Blazer', price: '$420.00', compare: '', badge: 'FEATURED' },
                  { id: '3', title: 'Merino Wool Trench Coat', price: '$590.00', compare: '$750.00', badge: 'SALE' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="border p-4 transition-all"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      borderColor: 'var(--theme-card-border)',
                      borderRadius: 'var(--theme-card-radius)',
                      boxShadow: 'var(--theme-card-shadow)',
                    }}
                  >
                    <div
                      className="h-44 w-full bg-slate-200 dark:bg-slate-800 relative mb-4 flex items-center justify-center font-bold text-xs uppercase text-slate-400"
                      style={{ borderRadius: 'var(--theme-radius-md)' }}
                    >
                      Product Preview Image
                      {item.badge && (
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase"
                          style={{
                            backgroundColor: item.badge === 'SALE' ? 'var(--theme-color-accent)' : 'var(--theme-color-primary)',
                            color: '#FFFFFF',
                            borderRadius: 'var(--theme-radius-xs)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h4
                      className="text-xs font-bold truncate mb-1"
                      style={{ color: 'var(--theme-color-text)' }}
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-black" style={{ color: 'var(--theme-color-heading)' }}>
                        {item.price}
                      </span>
                      {item.compare && (
                        <span className="text-[11px] line-through" style={{ color: 'var(--theme-color-text-muted)' }}>
                          {item.compare}
                        </span>
                      )}
                    </div>

                    <button
                      className="w-full py-2 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--theme-color-primary)',
                        color: '#FFFFFF',
                        borderRadius: 'var(--theme-radius-sm)',
                      }}
                    >
                      Add To Bag
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter & Footer Sample */}
            <div
              className="p-8 border-t text-center space-y-3"
              style={{
                backgroundColor: 'var(--theme-color-surface-secondary)',
                borderColor: 'var(--theme-color-border)',
              }}
            >
              <h4
                className="font-bold text-sm"
                style={{
                  fontFamily: 'var(--theme-font-heading)',
                  color: 'var(--theme-color-heading)',
                }}
              >
                Subscribe to Atelier VIP Updates
              </h4>
              <div className="max-w-md mx-auto flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  className="flex-1 px-4 text-xs border"
                  style={{
                    backgroundColor: 'var(--theme-form-bg)',
                    color: 'var(--theme-form-text)',
                    borderColor: 'var(--theme-form-border)',
                    borderRadius: 'var(--theme-form-radius)',
                    height: 'var(--theme-form-height)',
                  }}
                  disabled
                />
                <button
                  className="px-5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{
                    backgroundColor: 'var(--theme-color-accent)',
                    borderRadius: 'var(--theme-form-radius)',
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: INSPECTOR & CONTROLS */}
        <aside className="w-80 sm:w-96 border-l border-slate-800/80 bg-[#090D15] p-5 overflow-y-auto shrink-0 space-y-6">
          {/* CATEGORY 1: COLORS */}
          {activeCategory === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Semantic Colors</h3>
                <p className="text-xs text-slate-400">Global palette tokens inherited by all compatible storefront elements.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'primary', label: 'Primary Brand Color', val: theme.colors.primary },
                  { key: 'accent', label: 'Accent / CTA Color', val: theme.colors.accent },
                  { key: 'background', label: 'Page Background', val: theme.colors.background },
                  { key: 'surface', label: 'Card Surface', val: theme.colors.surface },
                  { key: 'surfaceSecondary', label: 'Surface Secondary', val: theme.colors.surfaceSecondary },
                  { key: 'text', label: 'Body Text Color', val: theme.colors.text },
                  { key: 'heading', label: 'Heading Title Color', val: theme.colors.heading },
                  { key: 'border', label: 'Border / Stroke Color', val: theme.colors.border },
                  { key: 'success', label: 'Success / In-Stock', val: theme.colors.success },
                  { key: 'error', label: 'Error / Alert', val: theme.colors.error },
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {item.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.val}
                        onChange={(e) => {
                          const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                          setTheme(updated);
                          pushHistory(updated);
                        }}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={item.val}
                        onChange={(e) => {
                          const updated = { ...theme, colors: { ...theme.colors, [item.key]: e.target.value } };
                          setTheme(updated);
                          pushHistory(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY 2: TYPOGRAPHY */}
          {activeCategory === 'typography' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Typography &amp; Scale</h3>
                <p className="text-xs text-slate-400">Heading, body, and UI fonts with responsive scales.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Heading Font Family
                  </label>
                  <select
                    value={theme.typography.headingFont}
                    onChange={(e) => {
                      const updated = {
                        ...theme,
                        typography: { ...theme.typography, headingFont: e.target.value },
                      };
                      setTheme(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-sans"
                  >
                    {POPULAR_FONTS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Body Font Family
                  </label>
                  <select
                    value={theme.typography.bodyFont}
                    onChange={(e) => {
                      const updated = {
                        ...theme,
                        typography: { ...theme.typography, bodyFont: e.target.value },
                      };
                      setTheme(updated);
                      pushHistory(updated);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-sans"
                  >
                    {POPULAR_FONTS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* H1 Heading Size */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">H1 Desktop Font Size</span>
                    <span className="font-mono text-slate-400">{theme.typography.h1.fontSize}</span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="72"
                    value={parseInt(theme.typography.h1.fontSize) || 48}
                    onChange={(e) => {
                      const updated = {
                        ...theme,
                        typography: {
                          ...theme.typography,
                          h1: { ...theme.typography.h1, fontSize: `${e.target.value}px` },
                        },
                      };
                      setTheme(updated);
                      pushHistory(updated);
                    }}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 3: BUTTONS */}
          {activeCategory === 'buttons' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Button Styling</h3>
                <p className="text-xs text-slate-400">Global button radius shapes and primary/secondary variant presets.</p>
              </div>

              {/* Shape Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Button Shape
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'square', label: 'Square (0px)', r: '0px' },
                    { id: 'slight', label: 'Slight (4px)', r: '4px' },
                    { id: 'rounded', label: 'Rounded (10px)', r: '10px' },
                    { id: 'pill', label: 'Pill (9999px)', r: '9999px' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        const updated = {
                          ...theme,
                          buttons: { ...theme.buttons, shape: s.id as any, borderRadius: s.r },
                        };
                        setTheme(updated);
                        pushHistory(updated);
                      }}
                      className={`p-2.5 text-xs font-bold border rounded-xl transition-all ${
                        theme.buttons.borderRadius === s.r
                          ? 'border-rose-500 bg-rose-950/30 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 4: FORMS */}
          {activeCategory === 'forms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Forms &amp; Inputs</h3>
                <p className="text-xs text-slate-400">Styling for text inputs, select boxes, search bars, and newsletter captures.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Input Height
                </label>
                <input
                  type="text"
                  value={theme.forms.height}
                  onChange={(e) => {
                    const updated = { ...theme, forms: { ...theme.forms, height: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* CATEGORY 5: CARDS */}
          {activeCategory === 'cards' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cards &amp; Product Cards</h3>
                <p className="text-xs text-slate-400">Default styling for catalog product tiles, blog cards, and content cards.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Card Corner Radius
                </label>
                <input
                  type="text"
                  value={theme.cards.borderRadius}
                  onChange={(e) => {
                    const updated = { ...theme, cards: { ...theme.cards, borderRadius: e.target.value } };
                    setTheme(updated);
                    pushHistory(updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* CATEGORY 6: CUSTOM CSS */}
          {activeCategory === 'custom_css' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tenant Custom CSS</h3>
                <p className="text-xs text-slate-400">Scoped CSS rules injected automatically into your tenant storefront.</p>
              </div>

              <textarea
                rows={12}
                value={theme.customCss || ''}
                onChange={(e) => {
                  const updated = { ...theme, customCss: e.target.value };
                  setTheme(updated);
                  pushHistory(updated);
                }}
                placeholder="/* Custom CSS overrides for your storefront */"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </aside>
      </div>

      {/* MODAL 1: PRESETS MODAL */}
      {isPresetsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Curated Design System Presets
                </h3>
              </div>
              <button onClick={() => setIsPresetsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {THEME_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer group"
                >
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400 mb-1">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERSION HISTORY MODAL */}
      {isVersionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Published Theme Version History
                </h3>
              </div>
              <button onClick={() => setIsVersionsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {versionHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No previous published versions recorded yet.
                </div>
              ) : (
                versionHistory.map((v) => (
                  <div
                    key={v._id || v.version}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{v.name || `Version ${v.version}`}</span>
                      <p className="text-[10px] text-slate-500">{new Date(v.publishedAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreVersion(v.version)}
                      className="px-3 py-1 rounded-lg bg-sky-600/20 text-sky-300 hover:bg-sky-600 hover:text-white font-bold text-[11px] transition-colors"
                    >
                      Restore Draft
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT / EXPORT JSON */}
      {isImportExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Theme JSON Import / Export
              </h3>
              <button onClick={() => setIsImportExportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={8}
              readOnly
              value={jsonExportString}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonExportString);
                  showToast('Copied JSON to clipboard', 'info');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
              >
                Copy JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
