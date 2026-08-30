'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, Sparkles, RefreshCw, Type, Layout, Store, Eye, CheckCircle2, Megaphone } from 'lucide-react';
import { SettingsService } from '@/services/settings';
import { PlatformService, TenantStore } from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { getTenantStorefrontUrl } from '@/services/api';

export default function ThemeCustomizerPage() {
  const { showToast } = useToast();
  const [activeTenant, setActiveTenant] = useState<TenantStore>(PlatformService.getActiveTenant());
  const [storeName, setStoreName] = useState(activeTenant.name);
  const [storeTagline, setStoreTagline] = useState(activeTenant.tagline);
  const [primaryColor, setPrimaryColor] = useState(activeTenant.theme?.primaryColor || '#111111');
  const [accentColor, setAccentColor] = useState(activeTenant.theme?.accentColor || '#B77A68');
  const [backgroundColor, setBackgroundColor] = useState(activeTenant.theme?.secondaryColor || '#FFFDFC');
  const [textColor, setTextColor] = useState('#111111');
  const [headingFont, setHeadingFont] = useState(activeTenant.theme?.headingFont || 'Playfair Display, serif');
  const [bodyFont, setBodyFont] = useState(activeTenant.theme?.bodyFont || 'Plus Jakarta Sans, sans-serif');
  const [announcementText, setAnnouncementText] = useState('New Season Drops Live Now • EXPLORE FRESH ARRIVALS');
  const [announcementCallout, setAnnouncementCallout] = useState('Exclusive Boutique Access');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const tenant = PlatformService.getActiveTenant();
    setActiveTenant(tenant);
    setStoreName(tenant.name);
    setStoreTagline(tenant.tagline);
    setPrimaryColor(tenant.theme?.primaryColor || '#111111');
    setAccentColor(tenant.theme?.accentColor || '#B77A68');
    setBackgroundColor(tenant.theme?.secondaryColor || '#FFFDFC');
    setHeadingFont(tenant.theme?.headingFont || 'Playfair Display, serif');
    setBodyFont(tenant.theme?.bodyFont || 'Plus Jakarta Sans, sans-serif');
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await SettingsService.updateThemeSettings({
        storeName,
        storeTagline,
        colors: {
          primary: primaryColor,
          accent: accentColor,
          background: backgroundColor,
          surface: '#FFFFFF',
          text: textColor,
          textMuted: '#6B7280',
        },
        typography: {
          headingFont,
          bodyFont,
        },
        announcements: {
          leftCallout: announcementCallout,
          mainText: announcementText,
          highlightText: 'EXPLORE NOW',
          link: '/sale',
        },
      });

      PlatformService.updateTenant(activeTenant.id, {
        name: storeName,
        tagline: storeTagline,
        theme: {
          primaryColor,
          secondaryColor: backgroundColor,
          accentColor,
          headingFont,
          bodyFont,
          borderRadius: 'md',
        },
      });

      showToast(`Brand & Theme settings for ${storeName} updated and synced live!`, 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            {activeTenant.name} • Brand &amp; Theme Customizer
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Live Theme Tokens &amp; Styling</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize colors, typography, logos, announcement bar, and design tokens for {activeTenant.name}. Changes publish instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getTenantStorefrontUrl(activeTenant.slug)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-lg border border-slate-700 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span>View Live Storefront</span>
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Tokens'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left: Token Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Brand Identity */}
          <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <Store className="w-4 h-4 text-rose-400" />
              <span>Store Identity &amp; Positioning</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Brand Color Palette</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Primary / Header Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Accent / Button Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Store Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <Type className="w-4 h-4 text-rose-400" />
              <span>Typography &amp; Fonts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Heading Font Family</label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Playfair Display, serif">Playfair Display (Luxury Editorial)</option>
                  <option value="Cinzel, serif">Cinzel (Nordic Classical)</option>
                  <option value="Montserrat, sans-serif">Montserrat (Modern Athletic)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Clean Tech)</option>
                  <option value="Cormorant Garamond, serif">Cormorant Garamond (High Fashion)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Body Text Font Family</label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Default)</option>
                  <option value="Inter, sans-serif">Inter (Clean Neutral)</option>
                  <option value="Roboto, sans-serif">Roboto (Universal)</option>
                  <option value="Outfit, sans-serif">Outfit (Modern Geometric)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Announcement Bar Customizer */}
          <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
              <Megaphone className="w-4 h-4 text-rose-400" />
              <span>Announcement Bar Messaging</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Left Callout Badge</label>
                <input
                  type="text"
                  value={announcementCallout}
                  onChange={(e) => setAnnouncementCallout(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Center Announcement Banner Text</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 bg-[#161822] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-xs uppercase tracking-wider">Live Storefront Preview</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Real-Time CSS Tokens
              </span>
            </div>

            {/* Rendered Preview Card */}
            <div
              className="rounded-xl p-5 space-y-4 border shadow-inner transition-all duration-300"
              style={{
                backgroundColor: backgroundColor,
                color: textColor,
                borderColor: `${accentColor}44`,
              }}
            >
              {/* Simulated Header */}
              <div
                className="p-3 rounded-lg flex items-center justify-between shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    {storeName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-white text-xs tracking-wider" style={{ fontFamily: headingFont }}>
                    {storeName.toUpperCase()}
                  </span>
                </div>
                <div className="text-[9px] text-slate-300 uppercase tracking-widest">
                  CART (0)
                </div>
              </div>

              {/* Simulated Hero */}
              <div className="p-5 rounded-xl text-center space-y-2 bg-white/70 backdrop-blur-xs border border-black/5 shadow-xs">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: accentColor, backgroundColor: `${accentColor}1A` }}
                >
                  {storeTagline}
                </span>
                <h3 className="text-xl font-bold leading-tight" style={{ fontFamily: headingFont }}>
                  Luxury Handcrafted Elegance
                </h3>
                <p className="text-[11px] opacity-75 max-w-xs mx-auto" style={{ fontFamily: bodyFont }}>
                  Experience effortless distinction with our newest curated drop.
                </p>
                <div className="pt-2">
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: accentColor }}
                  >
                    Shop New In →
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Save &amp; Push to Live Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
