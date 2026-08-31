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
  ArrowRight,
  Search,
  Tag,
  BarChart2,
  Star,
  Map,
  Gift,
  Users,
  Truck,
  Clock,
  Camera,
} from 'lucide-react';

const PRESET_BLOCKS = [
  // ─── Original 9 ───────────────────────────────────────────────────────────
  { type: 'hero', title: 'Hero Banner Carousel', desc: 'Full-width editorial hero with dual CTA buttons and overlay controls.', icon: Sparkles, category: 'Layout' },
  { type: 'category-grid', title: 'Shop By Category Grid', desc: 'Visual grid displaying top department cards (Women, Kids, Sarees, Kurtis).', icon: Grid, category: 'Navigation' },
  { type: 'product-grid', title: 'Product Grid Showcase', desc: 'Curated 4-column product grid linked to a dynamic collection or manual product picks.', icon: Grid, category: 'Products' },
  { type: 'product-carousel', title: 'Product Carousel', desc: 'Horizontal swipeable product carousel with price tags and quick-add actions.', icon: Layers, category: 'Products' },
  { type: 'collection-banner', title: 'Collection Editorial Banner', desc: 'Dual-column story banner with editorial image and narrative lookbook text.', icon: ImageIcon, category: 'Layout' },
  { type: 'promo-banner', title: 'Flash Promo Banner', desc: 'Vibrant highlight block for festival coupon drops and limited-time free delivery.', icon: Sparkles, category: 'Marketing' },
  { type: 'testimonials', title: 'Customer Love & Reviews', desc: 'Interactive star ratings and testimonials from verified boutique buyers.', icon: MessageSquare, category: 'Social Proof' },
  { type: 'instagram', title: 'Instagram Social Lookbook', desc: '4-card Instagram grid connected to official handle and hashtag campaigns.', icon: Camera, category: 'Social Proof' },
  { type: 'newsletter', title: 'VIP Newsletter Club', desc: 'Email subscription block offering ₹200 off first order and secret sale invites.', icon: Mail, category: 'Marketing' },

  // ─── New 8 ────────────────────────────────────────────────────────────────
  { type: 'smart-search', title: 'Smart Search & Filters', desc: 'Instant full-text search with faceted filters, autocomplete, and AI-powered product recommendations.', icon: Search, category: 'Navigation' },
  { type: 'promo-tags', title: 'Promo Tag & Badge Engine', desc: 'Configurable product badges — New, Sale, Limited Edition — with per-SKU rules and expiry timers.', icon: Tag, category: 'Marketing' },
  { type: 'analytics-dashboard', title: 'Sales Analytics Dashboard', desc: 'Embedded revenue charts, conversion funnels, and category-level heatmaps for marketing teams.', icon: BarChart2, category: 'Insights' },
  { type: 'star-ratings-qa', title: 'Star Ratings & Q&A', desc: 'Product-level star ratings with photo reviews, merchant replies, and buyer Q&A threads.', icon: Star, category: 'Social Proof' },
  { type: 'store-locator', title: 'Store Locator & Map', desc: 'Interactive map block with multi-city store pins, opening hours, and click-to-navigate CTAs.', icon: Map, category: 'Navigation' },
  { type: 'gift-cards', title: 'Gift Card & Voucher Block', desc: 'Digital gift card purchase flow with custom denominations, personalized notes, and email delivery.', icon: Gift, category: 'Commerce' },
  { type: 'referral-loyalty', title: 'Referral & Loyalty Module', desc: 'Friend referral widgets, loyalty point trackers, and tiered reward milestones for repeat buyers.', icon: Users, category: 'Marketing' },
  { type: 'order-tracking', title: 'Order Tracking Timeline', desc: 'Real-time shipment status with courier API integration, ETA countdown, and delivery confirmation.', icon: Truck, category: 'Commerce' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Layout: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Navigation: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Products: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Marketing: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Social Proof': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Insights: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Commerce: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

export default function BlockLibraryPage() {
  return (
    <div className="space-y-6 pb-20 select-none max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Headless CMS Components
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Content Block Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {PRESET_BLOCKS.length} production-grade storefront blocks available to drag, configure, and publish.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {PRESET_BLOCKS.map((block) => {
          const Icon = block.icon;
          const catColor = CATEGORY_COLORS[block.category] || 'text-slate-400 bg-slate-800 border-slate-700';
          return (
            <div
              key={block.type}
              className="p-5 bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catColor}`}>
                    {block.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-rose-300 transition-colors">{block.title}</h3>
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
