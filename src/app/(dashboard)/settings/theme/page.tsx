'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, Sparkles, RefreshCw } from 'lucide-react';
import { SettingsService } from '@/services/settings';
import { useToast } from '@/lib/toast-context';
import type { ThemeSettings } from '@/types';

export default function ThemeCustomizerPage() {
  const { showToast } = useToast();
  const [primaryColor, setPrimaryColor] = useState('#E8B8B5');
  const [accentColor, setAccentColor] = useState('#CF9584');
  const [backgroundColor, setBackgroundColor] = useState('#FAF6F2');
  const [textColor, setTextColor] = useState('#111111');
  const [headingFont, setHeadingFont] = useState('Playfair Display, serif');
  const [bodyFont, setBodyFont] = useState('Plus Jakarta Sans, sans-serif');
  const [buttonStyle, setButtonStyle] = useState<'rounded' | 'pill' | 'sharp'>('rounded');

  useEffect(() => {
    SettingsService.getThemeSettings().then((t) => {
      if (t?.colors) {
        setPrimaryColor(t.colors.primary);
        setAccentColor(t.colors.accent);
        setBackgroundColor(t.colors.background);
        setTextColor(t.colors.text);
      }
      if (t?.typography) {
        setHeadingFont(t.typography.headingFont);
        setBodyFont(t.typography.bodyFont);
      }
      if (t?.buttonStyle) {
        setButtonStyle(t.buttonStyle);
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await SettingsService.updateThemeSettings({
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
      buttonStyle,
    });
    showToast('Theme luxury tokens updated!', 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Brand Aesthetics
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">JQ Trends Theme Tokens</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Refine blush pink, dusty rose, and rose-gold hues, editorial serif typography, and glassmorphism styling.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Tokens</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left: Token Controls (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Color Palette Tokens</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blush Pink Primary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rose Gold Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Canvas Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Typography &amp; Button Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Editorial Heading Font</label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                >
                  <option value="Playfair Display, serif">Playfair Display (Boutique Luxury)</option>
                  <option value="Cormorant Garamond, serif">Cormorant Garamond (Ethereal)</option>
                  <option value="Bodoni Moda, serif">Bodoni Moda (High Fashion)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Body Text Font</label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                >
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Crisp)</option>
                  <option value="Inter, sans-serif">Inter (Neutral)</option>
                  <option value="Outfit, sans-serif">Outfit (Geometric)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Button Corner Radius Style</label>
              <div className="grid grid-cols-3 gap-3">
                {(['rounded', 'pill', 'sharp'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setButtonStyle(st)}
                    className={`py-2 rounded-lg font-bold capitalize transition-all border ${
                      buttonStyle === st
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-[#10121A] text-slate-400 border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Right: Live Theme Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Token Sandbox Preview
            </h3>

            <div
              style={{ backgroundColor, color: textColor }}
              className="p-6 rounded-2xl shadow-xl space-y-4 border border-rose-200/50"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{ fontFamily: headingFont }}
                  className="text-lg font-bold tracking-wider"
                >
                  JQ TRENDS
                </span>
                <span
                  style={{ backgroundColor: primaryColor }}
                  className="text-[9px] uppercase font-bold px-2 py-0.5 rounded text-white"
                >
                  Boutique Live
                </span>
              </div>

              <div className="space-y-1">
                <h4 style={{ fontFamily: headingFont }} className="text-xl font-bold leading-snug">
                  Timeless Grace &amp; Modern Flair
                </h4>
                <p style={{ fontFamily: bodyFont }} className="text-xs opacity-80 leading-relaxed">
                  Discover curated silhouettes and affordable luxury tailored for festive celebrations.
                </p>
              </div>

              <button
                style={{
                  backgroundColor: accentColor,
                  borderRadius: buttonStyle === 'pill' ? '9999px' : buttonStyle === 'sharp' ? '0px' : '0.5rem',
                  fontFamily: bodyFont,
                }}
                className="w-full py-2.5 text-white font-bold text-xs shadow-md transition-all"
              >
                Shop Spring Lookbook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
