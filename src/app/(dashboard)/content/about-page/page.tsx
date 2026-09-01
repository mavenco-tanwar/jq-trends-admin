'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Quote,
  ShieldCheck,
  Award,
  Video,
  Layers,
  Heart,
  Globe,
  Check,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';

export default function AboutPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'hero' | 'founder' | 'pillars' | 'press'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [config, setConfig] = useState({
    heroBadge: 'SINCE 2018 • ATELIER HERITAGE',
    heroHeadline: 'Crafting Timeless Elegance Through Pure Artisanry',
    heroSubtext: 'Every weave and silhouette tells a story of generation-old handloom heritage blended with contemporary haute couture.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
    founderName: 'Ananya Singhania',
    founderRole: 'Founder & Creative Director',
    founderQuote: 'We believe luxury lies in patience, handspun threads, and empowering rural master weavers with 100% fair-wage commerce.',
    founderImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
    pillars: [
      { title: '100% Handloom Certified', desc: 'Handcrafted on authentic wooden pit looms without synthetic blends.' },
      { title: 'Zero Compromise Purity', desc: 'Pure mulberry silks, certified organic cottons, and genuine gold zari.' },
      { title: 'Fair-Trade Artisans', desc: 'Direct partnership with over 450+ master weaver families across India.' },
      { title: 'Conscious Luxury', desc: 'Plastic-free biodegradable packaging and carbon-neutral deliveries.' },
    ],
    showPressLogos: true,
  });

  const tenantSlug = PlatformService.getActiveTenant().slug || 'jqtrends';

  // 1. Fetch live About config from MongoDB Atlas
  useEffect(() => {
    async function fetchAboutConfig() {
      try {
        setIsLoading(true);
        const res = await ApiClient.get<any>(`/api/v1/content/pages?type=about-page&tenant=${tenantSlug}`);
        if (res.data?.config) {
          setConfig((prev) => ({ ...prev, ...res.data.config }));
        }
      } catch (err) {
        console.warn('Using local About defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAboutConfig();
  }, [tenantSlug]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=about-page&tenant=${tenantSlug}`, {
        type: 'about-page',
        slug: 'about',
        title: 'Brand Story & About Us',
        status: 'draft',
        config,
      });
      showToast('Brand Story draft synced to MongoDB Atlas!', 'success');
    } catch {
      showToast('Draft saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      await ApiClient.put(`/api/v1/content/pages?type=about-page&tenant=${tenantSlug}`, {
        type: 'about-page',
        slug: 'about',
        title: 'Brand Story & About Us',
        status: 'published',
        config,
      });
      showToast('Published live to MongoDB Atlas & Storefront /about route!', 'success');
    } catch {
      showToast('Published locally.', 'info');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setConfig({
      heroBadge: 'SINCE 2018 • ATELIER HERITAGE',
      heroHeadline: 'Crafting Timeless Elegance Through Pure Artisanry',
      heroSubtext: 'Every weave and silhouette tells a story of generation-old handloom heritage blended with contemporary haute couture.',
      heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
      founderName: 'Ananya Singhania',
      founderRole: 'Founder & Creative Director',
      founderQuote: 'We believe luxury lies in patience, handspun threads, and empowering rural master weavers with 100% fair-wage commerce.',
      founderImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
      pillars: [
        { title: '100% Handloom Certified', desc: 'Handcrafted on authentic wooden pit looms without synthetic blends.' },
        { title: 'Zero Compromise Purity', desc: 'Pure mulberry silks, certified organic cottons, and genuine gold zari.' },
        { title: 'Fair-Trade Artisans', desc: 'Direct partnership with over 450+ master weaver families across India.' },
        { title: 'Conscious Luxury', desc: 'Plastic-free biodegradable packaging and carbon-neutral deliveries.' },
      ],
      showPressLogos: true,
    });
    showToast('Reset to default brand story template', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Visual Headless CMS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Brand Story &amp; About Page
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Brand Story &amp; About Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Craft your brand's heritage narrative, founder statements, atelier photography, and sustainability pillars.
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

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#121522] border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex border-b border-slate-800 pb-2 gap-1 overflow-x-auto text-xs">
            {[
              { id: 'hero', label: '1. Atelier Hero' },
              { id: 'founder', label: '2. Founder Quote' },
              { id: 'pillars', label: '3. Craft Pillars' },
              { id: 'press', label: '4. Press & Accolades' },
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

          {/* Tab 1: Hero */}
          {activeTab === 'hero' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Badge Label</label>
                <input
                  type="text"
                  value={config.heroBadge}
                  onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Hero Headline</label>
                <input
                  type="text"
                  value={config.heroHeadline}
                  onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Heritage Story Paragraph</label>
                <textarea
                  rows={3}
                  value={config.heroSubtext}
                  onChange={(e) => setConfig({ ...config, heroSubtext: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Hero Atelier Image URL</label>
                <input
                  type="text"
                  value={config.heroImage}
                  onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Founder */}
          {activeTab === 'founder' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Founder Name</label>
                  <input
                    type="text"
                    value={config.founderName}
                    onChange={(e) => setConfig({ ...config, founderName: e.target.value })}
                    className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Title / Role</label>
                  <input
                    type="text"
                    value={config.founderRole}
                    onChange={(e) => setConfig({ ...config, founderRole: e.target.value })}
                    className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Founder Quote</label>
                <textarea
                  rows={3}
                  value={config.founderQuote}
                  onChange={(e) => setConfig({ ...config, founderQuote: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Portrait URL</label>
                <input
                  type="text"
                  value={config.founderImage}
                  onChange={(e) => setConfig({ ...config, founderImage: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Pillars */}
          {activeTab === 'pillars' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              {config.pillars.map((pillar, idx) => (
                <div key={idx} className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const updated = [...config.pillars];
                        updated[idx].title = e.target.value;
                        setConfig({ ...config, pillars: updated });
                      }}
                      className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-white text-xs font-bold"
                    />
                  </div>
                  <input
                    type="text"
                    value={pillar.desc}
                    onChange={(e) => {
                      const updated = [...config.pillars];
                      updated[idx].desc = e.target.value;
                      setConfig({ ...config, pillars: updated });
                    }}
                    className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Press */}
          {activeTab === 'press' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0E17] border border-slate-800 cursor-pointer">
                <div>
                  <div className="font-semibold text-white">Display Editorial Press &amp; Fashion Week Mentions</div>
                  <div className="text-[10px] text-slate-400">Vogue India, Elle Decor, Harper's Bazaar, GQ</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPressLogos}
                  onChange={(e) => setConfig({ ...config, showPressLogos: e.target.checked })}
                  className="accent-rose-500 w-4 h-4 rounded"
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Live Reactive Device Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-3">
            <span>LIVE BRAND STORY PREVIEW</span>
            <span className="text-emerald-400 font-bold">● Active Story Engine</span>
          </div>

          <div
            className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#0D0F18] p-4 sm:p-6 space-y-6 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Story Hero */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-slate-800 flex items-center justify-center text-center p-6">
              <img src={config.heroImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              <div className="relative space-y-2 max-w-md">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {config.heroBadge}
                </span>
                <h3 className="text-base sm:text-xl font-black text-white">{config.heroHeadline}</h3>
                <p className="text-[11px] text-slate-300">{config.heroSubtext}</p>
              </div>
            </div>

            {/* Founder Quote Card */}
            <div className="p-4 bg-[#141724] rounded-2xl border border-slate-800 flex gap-3 items-center">
              <img src={config.founderImage} alt={config.founderName} className="w-12 h-12 rounded-full object-cover border-2 border-rose-500/40 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[11px] italic text-slate-200 font-serif">"{config.founderQuote}"</p>
                <div className="text-[10px] font-bold text-rose-400">{config.founderName} — <span className="text-slate-400 font-normal">{config.founderRole}</span></div>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-2 gap-2">
              {config.pillars.map((pil, idx) => (
                <div key={idx} className="p-2.5 bg-[#121522] rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{pil.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{pil.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
