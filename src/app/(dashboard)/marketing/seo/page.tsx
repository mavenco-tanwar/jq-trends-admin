'use client';

import React, { useState } from 'react';
import { Search, Save, Globe, Share2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function SEOSettingsPage() {
  const { showToast } = useToast();
  const [siteTitle, setSiteTitle] = useState('JQ Trends | Women & Kids Fashion Boutique');
  const [titleFormat, setTitleFormat] = useState('%s | JQ Trends');
  const [metaDesc, setMetaDesc] = useState('Discover modern elegance and affordable luxury fashion for Women and Kids. Shop floral dresses, Chanderi kurtis, organza sarees, and partywear.');
  const [keywords, setKeywords] = useState('women clothing, kids fashion, dresses, sarees, kurtis, affordable luxury, indian boutique');
  const [ogImage, setOgImage] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop');
  const [googleTag, setGoogleTag] = useState('google-site-verification=jqtrends-flagship-prod-2026');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('SEO settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Search Visibility
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">SEO &amp; OpenGraph Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimize organic search ranking, social sharing previews, and crawler verification tags.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Global Metadata */}
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-rose-400" />
            <span>Search Engine Title &amp; Description</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Global Site Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Title Template Format</label>
              <input
                type="text"
                value={titleFormat}
                onChange={(e) => setTitleFormat(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Global Meta Description</label>
            <textarea
              rows={3}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Meta Keywords (Comma separated)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Social Sharing OpenGraph */}
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-rose-400" />
            <span>Social Sharing OpenGraph Preview</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-bold mb-1">OG Share Image (1200x630)</label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Google Search Console Verification Token</label>
            <input
              type="text"
              value={googleTag}
              onChange={(e) => setGoogleTag(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
