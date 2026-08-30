'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Sparkles, Calendar, Image as ImageIcon, Plus, Trash2, Eye, EyeOff, Layers, Tag, Star, Instagram, FileText } from 'lucide-react';
import type { ContentBlock } from '@/types';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: ContentBlock | null;
  onSave: (updatedBlock: ContentBlock) => void;
}

export function BlockEditorModal({
  isOpen,
  onClose,
  block,
  onSave,
}: BlockEditorModalProps) {
  const [formData, setFormData] = useState<ContentBlock | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  useEffect(() => {
    if (block) {
      const parsed = JSON.parse(JSON.stringify(block));
      parsed.data = parsed.data || {};
      setFormData(parsed);
    }
  }, [block]);

  if (!formData) return null;

  const data = formData.data || {};

  const updateDataField = (field: string, val: any) => {
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        data: {
          ...(prev.data || {}),
          [field]: val,
        },
      };
    });
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget) {
      updateDataField(mediaPickerTarget, url);
      setMediaPickerTarget(null);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...formData,
      title: data.title || data.heading || formData.name,
      subtitle: data.subtitle || data.description || '',
    };
    onSave(updated);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Edit Section: ${formData.name}`}
        subtitle={`Preset: ${formData.type.toUpperCase()}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-5 text-xs">
          {/* General Block Info & Visibility */}
          <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Section Overview &amp; Visibility</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Internal Block Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Storefront Visibility</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                  className={`w-full py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.isVisible
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {formData.isVisible ? (
                    <>
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>● Live on Storefront</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>○ Hidden from Storefront</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Device Visibility */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-4 text-slate-400">
              <span className="font-semibold text-[11px]">Show on Devices:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={formData.visibilityDevice?.desktop ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibilityDevice: { ...formData.visibilityDevice, desktop: e.target.checked },
                    })
                  }
                  className="accent-rose-600 rounded"
                />
                <span>Desktop</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={formData.visibilityDevice?.tablet ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibilityDevice: { ...formData.visibilityDevice, tablet: e.target.checked },
                    })
                  }
                  className="accent-rose-600 rounded"
                />
                <span>Tablet</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={formData.visibilityDevice?.mobile ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visibilityDevice: { ...formData.visibilityDevice, mobile: e.target.checked },
                    })
                  }
                  className="accent-rose-600 rounded"
                />
                <span>Mobile</span>
              </label>
            </div>
          </div>

          {/* DYNAMIC FORM FIELDS BASED ON BLOCK TYPE */}
          <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Content Customization ({formData.type})</span>
              </h4>
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
                Storefront Live Bindings
              </span>
            </div>

            {/* 1. HERO BANNER */}
            {formData.type === 'hero' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge / Season Tagline</label>
                    <input
                      type="text"
                      value={data.badge || data.tagline || ''}
                      onChange={(e) => {
                        updateDataField('badge', e.target.value);
                        updateDataField('tagline', e.target.value);
                      }}
                      placeholder="e.g. SPRING / SUMMER 2026"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Overlay Opacity (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={data.overlayOpacity ?? 40}
                      onChange={(e) => updateDataField('overlayOpacity', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Main Heading *</label>
                  <input
                    type="text"
                    required
                    value={data.title || data.heading || ''}
                    onChange={(e) => {
                      updateDataField('title', e.target.value);
                      updateDataField('heading', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle / Editorial Description</label>
                  <textarea
                    rows={2}
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                {/* Hero Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Desktop Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.desktopImage || ''}
                        onChange={(e) => updateDataField('desktopImage', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget('desktopImage')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shrink-0"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.mobileImage || ''}
                        onChange={(e) => updateDataField('mobileImage', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget('mobileImage')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shrink-0"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dual CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Primary Button Text &amp; Link</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={data.primaryCtaText || ''}
                        onChange={(e) => updateDataField('primaryCtaText', e.target.value)}
                        placeholder="Shop Women"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={data.primaryCtaUrl || ''}
                        onChange={(e) => updateDataField('primaryCtaUrl', e.target.value)}
                        placeholder="/women"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Secondary Button Text &amp; Link</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={data.secondaryCtaText || ''}
                        onChange={(e) => updateDataField('secondaryCtaText', e.target.value)}
                        placeholder="Shop Kids"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={data.secondaryCtaUrl || ''}
                        onChange={(e) => updateDataField('secondaryCtaUrl', e.target.value)}
                        placeholder="/kids"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CATEGORY GRID */}
            {(formData.type === 'category-grid' || formData.type === 'categories') && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="e.g. Curated Fashion Universes"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Section Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                  <textarea
                    rows={2}
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* 3. TRENDING PRODUCTS */}
            {(formData.type === 'trending' || formData.type === 'product-grid') && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="e.g. Most Coveted Silhouettes"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Limit</label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={data.limit || 8}
                      onChange={(e) => updateDataField('limit', parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section Heading *</label>
                  <input
                    type="text"
                    required
                    value={data.title || data.heading || ''}
                    onChange={(e) => {
                      updateDataField('title', e.target.value);
                      updateDataField('heading', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={data.ctaText || data.primaryCtaText || ''}
                      onChange={(e) => updateDataField('ctaText', e.target.value)}
                      placeholder="Explore All Trending"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CTA Target URL</label>
                    <input
                      type="text"
                      value={data.ctaUrl || data.primaryCtaUrl || ''}
                      onChange={(e) => updateDataField('ctaUrl', e.target.value)}
                      placeholder="/women"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. WOMEN'S EDITORIAL */}
            {(formData.type === 'womens-editorial' || formData.type === 'collection-banner') && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="Women's Universe • Studio Edit"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Main Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-serif text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Story / Subtitle</label>
                  <textarea
                    rows={2}
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CTA Label</label>
                    <input
                      type="text"
                      value={data.ctaText || ''}
                      onChange={(e) => updateDataField('ctaText', e.target.value)}
                      placeholder="Explore Complete Collection"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CTA Target URL</label>
                    <input
                      type="text"
                      value={data.ctaUrl || ''}
                      onChange={(e) => updateDataField('ctaUrl', e.target.value)}
                      placeholder="/women"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. NEW ARRIVALS STUDIO */}
            {(formData.type === 'new-arrivals' || formData.type === 'product-carousel') && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Section Badge</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="Weekly Drop • Just In"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Section Title *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                {/* Studio Feature Card */}
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
                  <h5 className="font-bold text-rose-400 text-[11px]">Featured Studio Banner Card</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Banner Heading</label>
                      <input
                        type="text"
                        value={data.bannerTitle || ''}
                        onChange={(e) => updateDataField('bannerTitle', e.target.value)}
                        placeholder="Pure Linen & Silk Festive Harmonies"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Banner Image URL</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={data.bannerImage || data.desktopImage || ''}
                          onChange={(e) => updateDataField('bannerImage', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget('bannerImage')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded shrink-0"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Banner Description</label>
                    <textarea
                      rows={2}
                      value={data.bannerSubtitle || ''}
                      onChange={(e) => updateDataField('bannerSubtitle', e.target.value)}
                      placeholder="Indulge in breathable textures, hand-pleated silhouettes..."
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. KIDS EDITORIAL */}
            {formData.type === 'kids-editorial' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="Kids Universe • Ages 2 to 12 Years"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Main Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      placeholder="Little Looks, Big Style"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-serif"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle / Quote</label>
                  <input
                    type="text"
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    placeholder="“Comfort meets adorable.”"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* 7. BEST SELLERS */}
            {formData.type === 'best-sellers' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="Customer Favorites • High Demand"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      placeholder="Our Best Sellers"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* 8. TESTIMONIALS & REVIEWS */}
            {(formData.type === 'reviews' || formData.type === 'testimonials') && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="Real Customer Stories"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      placeholder="Loved By You"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                  <textarea
                    rows={2}
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    placeholder="Hear from thousands of delighted women and families..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* 9. INSTAGRAM SOCIAL FEED */}
            {formData.type === 'instagram-feed' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={data.handle || ''}
                      onChange={(e) => updateDataField('handle', e.target.value)}
                      placeholder="@JQTrendsOfficial"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Hashtag</label>
                    <input
                      type="text"
                      value={data.hashtag || ''}
                      onChange={(e) => updateDataField('hashtag', e.target.value)}
                      placeholder="#JQStyle"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.title || data.heading || ''}
                      onChange={(e) => {
                        updateDataField('title', e.target.value);
                        updateDataField('heading', e.target.value);
                      }}
                      placeholder="Follow the JQ Style"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={data.subtitle || ''}
                      onChange={(e) => updateDataField('subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. NEWSLETTER VIP CLUB */}
            {formData.type === 'newsletter' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={data.badge || ''}
                      onChange={(e) => updateDataField('badge', e.target.value)}
                      placeholder="JQ Trends VIP Club"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Discount Coupon Code</label>
                    <input
                      type="text"
                      value={data.code || data.couponPromo || ''}
                      onChange={(e) => {
                        updateDataField('code', e.target.value);
                        updateDataField('couponPromo', e.target.value);
                      }}
                      placeholder="WELCOME200"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Heading *</label>
                  <input
                    type="text"
                    required
                    value={data.title || data.heading || ''}
                    onChange={(e) => {
                      updateDataField('title', e.target.value);
                      updateDataField('heading', e.target.value);
                    }}
                    placeholder="Stay In Style"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle</label>
                  <textarea
                    rows={2}
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    placeholder="Get first access to new collections, exclusive seasonal offers..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* 11. PROMO BANNER */}
            {formData.type === 'promo-banner' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Promo Heading *</label>
                    <input
                      type="text"
                      required
                      value={data.heading || data.title || ''}
                      onChange={(e) => {
                        updateDataField('heading', e.target.value);
                        updateDataField('title', e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Coupon Code</label>
                    <input
                      type="text"
                      value={data.code || ''}
                      onChange={(e) => updateDataField('code', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Promo Subtitle</label>
                  <input
                    type="text"
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banner Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.image || data.desktopImage || ''}
                      onChange={(e) => updateDataField('image', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget('image')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shrink-0"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 12. VALUE PROPS */}
            {formData.type === 'value-props' && (
              <div className="space-y-3">
                <p className="text-slate-400">Value propositions bar displayed across the homepage with 4 trust badges.</p>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge 1: Trendy Collections Description</label>
                  <input
                    type="text"
                    value={data.item1Desc || 'Handpicked, fashion-forward silhouettes updated every week.'}
                    onChange={(e) => updateDataField('item1Desc', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge 2: Premium Quality Description</label>
                  <input
                    type="text"
                    value={data.item2Desc || 'Breathable, skin-friendly fabrics crafted with utmost attention to detail.'}
                    onChange={(e) => updateDataField('item2Desc', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* 13. RICH TEXT / EDITORIAL STORY */}
            {(formData.type === 'rich-text' || formData.type === 'text-section' || formData.type === 'custom-html') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section Heading</label>
                  <input
                    type="text"
                    value={data.heading || data.title || ''}
                    onChange={(e) => {
                      updateDataField('heading', e.target.value);
                      updateDataField('title', e.target.value);
                    }}
                    placeholder="e.g. Artisanal Craftsmanship & Heritage"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Formatted Story &amp; Rich Text Content *</label>
                  <RichTextEditor
                    value={data.content || ''}
                    onChange={(val) => updateDataField('content', val)}
                    placeholder="Write detailed rich content, styling guides, or boutique stories..."
                    minHeight="220px"
                  />
                </div>
              </div>
            )}

            {/* GENERIC FALLBACK FOR ANY OTHER TYPE */}
            {!['hero', 'category-grid', 'categories', 'trending', 'product-grid', 'womens-editorial', 'collection-banner', 'new-arrivals', 'product-carousel', 'kids-editorial', 'best-sellers', 'reviews', 'testimonials', 'instagram-feed', 'newsletter', 'promo-banner', 'value-props', 'rich-text', 'text-section', 'custom-html'].includes(formData.type) && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section Heading *</label>
                  <input
                    type="text"
                    required
                    value={data.heading || data.title || ''}
                    onChange={(e) => {
                      updateDataField('heading', e.target.value);
                      updateDataField('title', e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={data.subtitle || ''}
                    onChange={(e) => updateDataField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Save Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply &amp; Save Block</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Embedded Media Picker */}
      {mediaPickerTarget && (
        <MediaPickerModal
          isOpen={!!mediaPickerTarget}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={handleMediaSelect}
          title={`Select Image for ${mediaPickerTarget}`}
        />
      )}
    </>
  );
}
