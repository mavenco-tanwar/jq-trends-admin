'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Grid,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Instagram,
  Mail,
  Video,
  ArrowRight,
} from 'lucide-react';

const PRESET_BLOCKS = [
  { type: 'hero', title: 'Hero Banner Carousel', desc: 'Full-width editorial hero with dual CTA buttons and overlay controls.', icon: Sparkles },
  { type: 'category-grid', title: 'Shop By Category Grid', desc: 'Visual grid displaying top department cards (Women, Kids, Sarees, Kurtis).', icon: Grid },
  { type: 'product-grid', title: 'Product Grid Showcase', desc: 'Curated 4-column product grid linked to a dynamic collection or manual product picks.', icon: Grid },
  { type: 'product-carousel', title: 'Product Carousel', desc: 'Horizontal swipeable product carousel with price tags and quick-add actions.', icon: Layers },
  { type: 'collection-banner', title: 'Collection Editorial Banner', desc: 'Dual-column story banner with editorial image and narrative lookbook text.', icon: Sparkles },
  { type: 'promo-banner', title: 'Flash Promo Banner', desc: 'Vibrant highlight block for festival coupon drops and limited-time free delivery.', icon: Sparkles },
  { type: 'testimonials', title: 'Customer Love & Reviews', desc: 'Interactive star ratings and testimonials from verified boutique buyers.', icon: MessageSquare },
  { type: 'instagram', title: 'Instagram Social Lookbook', desc: '4-card Instagram grid connected to official handle and hashtag campaigns.', icon: Instagram },
  { type: 'newsletter', title: 'VIP Newsletter Club', desc: 'Email subscription block offering ₹200 off first order and secret sale invites.', icon: Mail },
];

export default function BlockLibraryPage() {
  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Headless CMS Components
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Content Block Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-engineered dynamic storefront components that can be inserted and customized anywhere.
          </p>
        </div>

        <Link
          href="/content/homepage"
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Homepage Builder</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {PRESET_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <div
              key={block.type}
              className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">{block.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{block.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-slate-500">{block.type}</span>
                <Link
                  href="/content/homepage"
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 text-[11px]"
                >
                  <span>Use in Builder</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
