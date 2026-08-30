'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, Wand2, Type, Tag, Globe, RefreshCw } from 'lucide-react';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { useToast } from '@/lib/toast-context';

export default function AIStudioPage() {
  const { showToast } = useToast();
  const [productTitle, setProductTitle] = useState('Sculptural Ceramic Pendant Light');
  const [category, setCategory] = useState('Home & Lighting');
  const [tone, setTone] = useState('Luxury & Minimalist');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [generatedOutput, setGeneratedOutput] = useState<{
    description: string;
    bulletPoints: string[];
    seoMeta: string;
    tags: string[];
  } | null>({
    description:
      'Handcrafted from high-fired natural terracotta with an unglazed matte finish, this sculptural ceramic pendant casts an intimate, warm architectural glow. Designed for contemporary living rooms, dining nooks, and boutique spaces.',
    bulletPoints: [
      'Sculpted organic silhouette crafted by master artisans',
      'Solid brushed brass hardware with adjustable 1.5m braided suspension cord',
      'Warm ambient dispersion compatible with dimmable E27 Edison bulbs',
      'Engineered for residential dining and boutique hospitality suites'
    ],
    seoMeta:
      'Buy handcrafted sculptural ceramic pendant lighting. Architectural minimalist fixtures in natural matte terracotta with solid brass accents. Fast India-wide dispatch.',
    tags: ['ceramic lighting', 'minimalist pendant', 'architectural lamp', 'handmade pottery', 'terracotta light', 'luxury interiors']
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle) return;

    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));

    setGeneratedOutput({
      description: `Elevate your interior aesthetics with the ${productTitle}. Meticulously crafted using premium materials, this piece balances minimalist geometry with tactile warmth. Tailored specifically for the ${category} collection with a ${tone.toLowerCase()} character.`,
      bulletPoints: [
        `Premium architectural finishing tailored for modern ${category.toLowerCase()} interiors`,
        'Handcrafted in small batches with sustainable artisan techniques',
        'Effortless installation with included precision mounting hardware',
        'Compliant with international safety and durability standards'
      ],
      seoMeta: `Shop ${productTitle} online. Discover premium ${category.toLowerCase()} designed for modern living. Fast shipping & easy returns.`,
      tags: [
        productTitle.toLowerCase().split(' ')[0],
        category.toLowerCase(),
        'contemporary design',
        'artisan crafted',
        'premium quality',
        'curated boutique'
      ]
    });

    setIsGenerating(false);
    showToast('AI copy & SEO metadata generated successfully!', 'success');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <FeatureGate
      featureKey="aiFeatures"
      featureName="AI Studio & E-Commerce Copy Generator"
      featureDescription="Generative AI product description engine, automatic SEO meta optimization, and automated customer review summarization."
    >
      <div className="space-y-6 pb-20 select-none max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Generative Intelligence
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">AI Copywriting &amp; SEO Studio</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate conversion-focused luxury product descriptions, bullet points, and SEO metadata in seconds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Mavenco AI Engine v2</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Input Controls */}
          <div className="lg:col-span-5 bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-rose-400" />
              <span>Product Parameters</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Product Title / Item Name *</label>
                <input
                  type="text"
                  required
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="e.g. Minimalist Linen Kimono Robe"
                  className="w-full px-3 py-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Product Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-white"
                >
                  <option value="Home & Lighting">Home &amp; Lighting</option>
                  <option value="Luxury Fashion & Apparel">Luxury Fashion &amp; Apparel</option>
                  <option value="High-Performance Activewear">High-Performance Activewear</option>
                  <option value="Artisanal Jewelry">Artisanal Jewelry</option>
                  <option value="Organic Bedding & Linens">Organic Bedding &amp; Linens</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Brand Voice / Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-white"
                >
                  <option value="Luxury & Minimalist">Luxury &amp; Minimalist</option>
                  <option value="Playful & Contemporary">Playful &amp; Contemporary</option>
                  <option value="Technical & Athletic">Technical &amp; Athletic</option>
                  <option value="Heritage & Artisanal">Heritage &amp; Artisanal</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !productTitle}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Content →</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Preview: Generated Copy Output */}
          <div className="lg:col-span-7 space-y-4">
            {generatedOutput && (
              <>
                {/* Description Card */}
                <div className="bg-[#161822] p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-rose-400" />
                      <span>Product Description</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(generatedOutput.description, 'desc')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      {copiedKey === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'desc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#10121A] p-3.5 rounded-xl border border-slate-800/80">
                    {generatedOutput.description}
                  </p>
                </div>

                {/* Key Bullet Points */}
                <div className="bg-[#161822] p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Highlights &amp; Feature Bullets</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(generatedOutput.bulletPoints.join('\n• '), 'bullets')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      {copiedKey === 'bullets' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'bullets' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <ul className="space-y-1.5 bg-[#10121A] p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    {generatedOutput.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SEO Metadata */}
                <div className="bg-[#161822] p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Google Search SEO Meta</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(generatedOutput.seoMeta, 'seo')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      {copiedKey === 'seo' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'seo' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 bg-[#10121A] p-3.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                    {generatedOutput.seoMeta}
                  </p>
                </div>

                {/* Tags */}
                <div className="bg-[#161822] p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>Search &amp; Catalog Tags</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedOutput.tags.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#10121A] border border-slate-700/80 rounded-lg text-slate-300 text-xs font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
