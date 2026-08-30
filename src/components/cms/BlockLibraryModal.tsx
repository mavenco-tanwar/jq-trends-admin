'use client';

import React from 'react';
import {
  Sparkles,
  Grid,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Instagram,
  Mail,
  Video,
  FileText,
  Plus,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ContentBlock, ContentBlockType } from '@/types';

interface BlockLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (block: ContentBlock) => void;
}

interface BlockPreset {
  type: ContentBlockType;
  title: string;
  desc: string;
  icon: any;
  defaultData: Record<string, any>;
}

const PRESETS: BlockPreset[] = [
  {
    type: 'hero',
    title: 'Hero Banner Carousel',
    desc: 'High-impact full-width editorial hero with dual CTA buttons and overlay controls.',
    icon: Sparkles,
    defaultData: {
      badge: 'NEW ARRIVALS 2026',
      title: 'Style That Speaks You',
      subtitle: 'Effortless luxury fashion for Women and Kids.',
      desktopImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&auto=format&fit=crop',
      primaryCtaText: 'Shop Women',
      primaryCtaUrl: '/women',
    },
  },
  {
    type: 'category-grid',
    title: 'Shop By Category Grid',
    desc: 'Visual grid displaying top department cards (Women, Kids, Sarees, Kurtis).',
    icon: Grid,
    defaultData: {
      heading: 'Shop By Category',
      subtitle: 'Curated silhouettes for every occasion',
      columns: 4,
    },
  },
  {
    type: 'product-grid',
    title: 'Product Grid Showcase',
    desc: 'Curated 4-column product grid linked to a dynamic collection or manual product picks.',
    icon: Grid,
    defaultData: {
      heading: 'Trending Styles',
      subtitle: 'Handpicked boutique favourites',
      limit: 4,
      columns: 4,
    },
  },
  {
    type: 'product-carousel',
    title: 'Product Carousel',
    desc: 'Horizontal swipeable product carousel with price tags and quick-add actions.',
    icon: Layers,
    defaultData: {
      heading: 'Fresh Studio Drops',
      subtitle: 'New arrivals updated weekly',
      limit: 6,
    },
  },
  {
    type: 'collection-banner',
    title: 'Collection Editorial Banner',
    desc: 'Dual-column story banner with editorial image and narrative lookbook text.',
    icon: Sparkles,
    defaultData: {
      heading: 'Timeless Grace & Modern Flair',
      subtitle: 'Boutique silk Chanderi and ethereal organza sarees crafted for celebration.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop',
      ctaText: 'Explore Collection',
      ctaUrl: '/women',
    },
  },
  {
    type: 'promo-banner',
    title: 'Flash Promo Banner',
    desc: 'Vibrant highlight block for festival coupon drops and limited-time free delivery.',
    icon: Sparkles,
    defaultData: {
      heading: 'Festive Flash Drop: 15% Off',
      subtitle: 'Use code FESTIVE15 on orders above ₹2,499',
      code: 'FESTIVE15',
      ctaText: 'Shop Sale',
      ctaUrl: '/sale',
    },
  },
  {
    type: 'testimonials',
    title: 'Customer Love & Reviews',
    desc: 'Interactive star ratings and testimonials from verified boutique buyers.',
    icon: MessageSquare,
    defaultData: {
      heading: 'Loved by 50,000+ Customers',
      subtitle: 'Real stories from fashion lovers across India',
    },
  },
  {
    type: 'instagram',
    title: 'Instagram Social Lookbook',
    desc: '4-card Instagram grid connected to official handle and hashtag campaigns.',
    icon: Instagram,
    defaultData: {
      heading: 'Follow @JQTrendsOfficial',
      subtitle: 'Tag #JQTrends for a chance to be featured',
      instagramHandle: 'JQTrendsOfficial',
    },
  },
  {
    type: 'newsletter',
    title: 'VIP Newsletter Club',
    desc: 'Email subscription block offering ₹200 off first order and secret sale invites.',
    icon: Mail,
    defaultData: {
      heading: 'Join the JQ Trends VIP Club',
      subtitle: 'Get early access to festive drops and ₹200 off your first order.',
      ctaText: 'Subscribe',
    },
  },
];

export function BlockLibraryModal({ isOpen, onClose, onAddBlock }: BlockLibraryModalProps) {
  const handleSelectPreset = (preset: BlockPreset) => {
    const newBlock: ContentBlock = {
      id: `sec_${preset.type}_${Date.now()}`,
      type: preset.type,
      name: preset.title,
      isVisible: true,
      displayOrder: 99,
      visibilityDevice: { desktop: true, tablet: true, mobile: true },
      data: preset.defaultData,
      updatedAt: new Date().toISOString(),
    };
    onAddBlock(newBlock);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Homepage Section" subtitle="Choose from 12+ pre-built dynamic ecommerce block presets" maxWidth="2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[70vh] overflow-y-auto p-1 text-xs select-none">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <div
              key={preset.type + preset.title}
              onClick={() => handleSelectPreset(preset)}
              className="p-4 bg-[#10121A] hover:bg-[#1A1D2B] border border-slate-800 hover:border-rose-500/60 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {preset.type}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-rose-300 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{preset.desc}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-end text-rose-400 font-bold text-[11px] group-hover:translate-x-0.5 transition-transform">
                <span>+ Add Section</span>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
