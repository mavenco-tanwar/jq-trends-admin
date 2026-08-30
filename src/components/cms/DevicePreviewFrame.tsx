'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, X, Sparkles, Eye, ShoppingBag, Heart, Star, Mail, ArrowRight, Truck } from 'lucide-react';
import type { ContentBlock } from '@/types';

interface DevicePreviewFrameProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: ContentBlock[];
}

export function DevicePreviewFrame({ isOpen, onClose, blocks }: DevicePreviewFrameProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const visibleBlocks = blocks
    .filter((b) => b.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const widthStyle = {
    desktop: 'w-full max-w-[1280px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[device];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200 select-none">
      {/* Top Device Toolbar */}
      <div className="h-14 bg-[#12141D] border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-white text-sm">JQ TRENDS</span>
          <span className="text-xs text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
            Live Storefront Preview
          </span>
        </div>

        {/* Viewport Selectors */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop (1280px)</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet (768px)</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (375px)</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Simulator Viewport Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/80">
        <div
          className={`${widthStyle} bg-[#FAF6F2] text-[#111111] rounded-2xl shadow-2xl overflow-hidden border border-slate-700 transition-all duration-300 min-h-[85vh] flex flex-col font-sans`}
        >
          {/* Mock Storefront Header */}
          <div className="bg-white border-b border-[#E8DED8] px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <span className="font-serif font-black text-lg tracking-wider text-[#111111]">JQ TRENDS</span>
            <div className="hidden sm:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#444444]">
              <span>Women</span>
              <span>Kids</span>
              <span>New Arrivals</span>
              <span>Sale</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          {/* Rendered Live Blocks */}
          <div className="flex-1 space-y-12 pb-16">
            {visibleBlocks.map((block) => {
              const bData = block.data || {};
              const title = bData.title || bData.heading || block.name;
              const subtitle = bData.subtitle || bData.description || '';
              const badge = bData.badge || bData.tagline || '';

              if (block.type === 'hero') {
                return (
                  <div key={block.id} className="relative bg-[#111111] text-white py-20 px-6 sm:px-12 text-center overflow-hidden">
                    <img
                      src={bData.desktopImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&auto=format&fit=crop'}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                      {badge && (
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] tracking-widest uppercase font-bold text-rose-200">
                          {badge}
                        </div>
                      )}
                      <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight">
                        {title}
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg mx-auto">
                        {subtitle}
                      </p>
                      <div className="pt-2 flex justify-center gap-3">
                        <button className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-lg shadow-lg">
                          {bData.primaryCtaText || 'Shop Collection'}
                        </button>
                        {bData.secondaryCtaText && (
                          <button className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-lg backdrop-blur-sm">
                            {bData.secondaryCtaText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              if (block.type === 'category-grid' || block.type === 'categories') {
                return (
                  <div key={block.id} className="px-6 sm:px-12 space-y-6">
                    <div className="text-center space-y-1">
                      {badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#B77A68]">{badge}</span>}
                      <h3 className="font-serif font-bold text-2xl text-[#111111]">{title}</h3>
                      <p className="text-xs text-slate-500">{subtitle}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['Women', 'Kids', 'New In', 'Sale'].map((cat, i) => (
                        <div key={i} className="aspect-3/4 bg-slate-900 rounded-xl relative overflow-hidden flex flex-col justify-end p-4 text-white">
                          <img
                            src={['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop'][i]}
                            alt={cat}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                          />
                          <div className="relative z-10 font-serif font-bold text-lg">{cat}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (block.type === 'promo-banner') {
                return (
                  <div
                    key={block.id}
                    className="p-6 text-center text-white bg-gradient-to-r from-rose-700 to-pink-600 mx-4 sm:mx-8 rounded-2xl shadow-md space-y-1"
                  >
                    <div className="font-serif font-bold text-xl">{title}</div>
                    <div className="text-xs opacity-90">{subtitle}</div>
                    {bData.code && (
                      <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded font-mono font-bold text-xs uppercase">
                        Code: {bData.code}
                      </span>
                    )}
                  </div>
                );
              }

              if (block.type === 'womens-editorial' || block.type === 'collection-banner') {
                return (
                  <div key={block.id} className="mx-4 sm:mx-8 p-8 bg-white border border-[#E8DED8] rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      {badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#B77A68]">{badge}</span>}
                      <h3 className="font-serif font-bold text-2xl text-[#111111]">{title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{subtitle}</p>
                      <button className="px-4 py-2 bg-[#111111] text-white font-bold text-xs rounded-lg mt-2">
                        {bData.ctaText || 'Explore Edit'}
                      </button>
                    </div>
                    <div className="h-56 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={bData.image || bData.desktopImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop'}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                );
              }

              if (block.type === 'instagram-feed') {
                return (
                  <div key={block.id} className="px-6 sm:px-12 space-y-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B77A68]">{badge || 'Social Wall'}</span>
                    <h3 className="font-serif font-bold text-2xl text-[#111111]">{title}</h3>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="aspect-square bg-slate-200 rounded-lg overflow-hidden">
                          <img
                            src={`https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80`}
                            alt="Insta"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (block.type === 'newsletter') {
                return (
                  <div key={block.id} className="mx-4 sm:mx-8 p-8 bg-[#F8F1EA] rounded-2xl border border-[#E8DED8] text-center space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B77A68]">{badge || 'VIP Club'}</span>
                    <h3 className="font-serif font-bold text-2xl text-[#111111]">{title}</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">{subtitle}</p>
                    <div className="max-w-xs mx-auto flex gap-2 pt-2">
                      <input type="email" placeholder="Enter your email" className="flex-1 px-3 py-2 bg-white border border-[#E8DED8] rounded-lg text-xs" />
                      <button className="px-4 py-2 bg-[#111111] text-white font-bold text-xs rounded-lg">{bData.buttonText || 'Join'}</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={block.id} className="px-6 sm:px-12 space-y-4">
                  <div className="text-center space-y-1">
                    {badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#B77A68]">{badge}</span>}
                    <h3 className="font-serif font-bold text-2xl text-[#111111]">{title}</h3>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="bg-white p-3 rounded-xl border border-[#E8DED8] space-y-2 shadow-xs">
                        <div className="aspect-3/4 bg-slate-100 rounded-lg overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop"
                            alt="Garment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-bold text-xs text-[#111111] truncate">Boutique Garment {n}</div>
                        <div className="text-xs font-bold text-rose-700">₹1,499</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
