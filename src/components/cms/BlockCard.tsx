'use client';

import React from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Copy,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Grid,
  MessageSquare,
  Instagram,
  Mail,
  Video,
  Flame,
  Heart,
  ArrowUp,
  ArrowDown,
  Search,
  Tag,
  BarChart2,
  Star,
  Map,
  Gift,
  Users,
  Truck,
  Monitor,
  Smartphone,
} from 'lucide-react';
import type { ContentBlock } from '@/types';

interface BlockCardProps {
  block: ContentBlock;
  index: number;
  total: number;
  onToggleVisibility: (id: string) => void;
  onEdit: (block: ContentBlock) => void;
  onDuplicate: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (index: number) => void;
  isDragging?: boolean;
}

const BLOCK_ICONS: Record<string, any> = {
  hero: Sparkles,
  'category-grid': Grid,
  categories: Grid,
  trending: Flame,
  'product-grid': Grid,
  'product-carousel': Layers,
  'new-arrivals': Sparkles,
  'image-banner': ImageIcon,
  'text-section': Layers,
  'collection-banner': Sparkles,
  'womens-editorial': Sparkles,
  'kids-editorial': Heart,
  'best-sellers': Flame,
  reviews: MessageSquare,
  testimonials: MessageSquare,
  instagram: Instagram,
  'instagram-feed': Instagram,
  newsletter: Mail,
  'promo-banner': Sparkles,
  'value-props': Layers,
  video: Video,
  'smart-search': Search,
  'promo-tags': Tag,
  'analytics-dashboard': BarChart2,
  'star-ratings-qa': Star,
  'store-locator': Map,
  'gift-cards': Gift,
  'referral-loyalty': Users,
  'order-tracking': Truck,
};

export function BlockCard({
  block,
  index,
  total,
  onToggleVisibility,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: BlockCardProps) {
  const Icon = BLOCK_ICONS[block.type] || Layers;

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={() => onDrop?.(index)}
      className={`group bg-[#161822] border rounded-xl p-3.5 sm:p-4 transition-all duration-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none ${
        isDragging ? 'opacity-40 border-rose-500 scale-[0.99]' : ''
      } ${
        block.isVisible
          ? 'border-slate-800 hover:border-slate-700'
          : 'border-slate-800/40 bg-[#12141D]/60 opacity-60'
      }`}
    >
      {/* Left: Drag Handle, Icon & Block Details */}
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        {/* Grab Handle */}
        <div
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300 hidden sm:block"
          title="Drag to reorder section"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Reorder Buttons */}
        <div className="flex flex-col gap-0.5 text-slate-500">
          <button
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            className="p-1 hover:text-white hover:bg-slate-800 rounded disabled:opacity-20 transition-colors"
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            disabled={index === total - 1}
            onClick={() => onMoveDown(index)}
            className="p-1 hover:text-white hover:bg-slate-800 rounded disabled:opacity-20 transition-colors"
            title="Move Down"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            block.isVisible
              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Title & Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-xs truncate">{block.name}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {block.type}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
            <span className="font-mono">Order #{index + 1}</span>

            {/* Device Visibility Icons */}
            <div className="flex items-center gap-1 text-slate-400">
              {block.visibilityDevice?.desktop !== false && (
                <span title="Visible on Desktop">
                  <Monitor className="w-3 h-3 text-slate-400" />
                </span>
              )}
              {block.visibilityDevice?.mobile !== false && (
                <span title="Visible on Mobile">
                  <Smartphone className="w-3 h-3 text-slate-400" />
                </span>
              )}
            </div>

            {block.schedule?.enabled && (
              <span className="flex items-center gap-1 text-amber-400 text-[10px] font-semibold">
                <Calendar className="w-3 h-3" />
                <span>Scheduled</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Show/Hide Toggle & Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
        {/* Visibility Toggle Button */}
        <button
          onClick={() => onToggleVisibility(block.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            block.isVisible
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
          }`}
          title={block.isVisible ? 'Click to hide block' : 'Click to show block'}
        >
          {block.isVisible ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hidden</span>
            </>
          )}
        </button>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(block)}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all"
        >
          <Settings className="w-3.5 h-3.5 text-rose-400" />
          <span>Edit</span>
        </button>

        {/* Duplicate Button */}
        <button
          onClick={() => onDuplicate(block)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Duplicate Block"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(block.id)}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Delete Block"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
