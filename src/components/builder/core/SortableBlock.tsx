'use client';

import React from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Edit2,
  Lock,
} from 'lucide-react';
import { BuilderBlock, BuilderDevice } from '../types/builder.types';
import { BuilderBlockRenderer } from './BuilderBlockRenderer';

interface SortableBlockProps {
  block: BuilderBlock;
  sectionId: string;
  isSelected: boolean;
  device: BuilderDevice;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  tenantSlug?: string;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function SortableBlock({
  block,
  sectionId,
  isSelected,
  device,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  tenantSlug,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
}: SortableBlockProps) {
  const isVis = block.enabled !== false && block.responsive?.[device]?.visible !== false;

  return (
    <div
      draggable={!block.locked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group relative rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-rose-500 border-rose-500 bg-slate-900/40 shadow-lg shadow-rose-950/20'
          : 'border-transparent hover:border-slate-700/80 hover:bg-slate-900/20'
      } ${!isVis ? 'opacity-50 border-dashed border-rose-500/40' : ''} ${
        isDragging ? 'opacity-30 scale-95' : ''
      }`}
    >
      {/* Floating Action Toolbar on Hover or Selection */}
      <div
        className={`absolute -top-3.5 right-3 z-30 flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-700 shadow-xl transition-all ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
        }`}
      >
        <div className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-white" title="Drag to reorder">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 hover:text-white text-slate-400"
          title={isVis ? 'Hide on this device' : 'Show on this device'}
        >
          {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
        </button>

        {onMoveUp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className="p-1 hover:text-white text-slate-400"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}

        {onMoveDown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="p-1 hover:text-white text-slate-400"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:text-white text-slate-400"
          title="Duplicate Block"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:text-rose-400 text-slate-400"
          title="Delete Block"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
        </button>
      </div>

      {/* Hidden Status Tag */}
      {!isVis && (
        <div className="absolute top-2 left-2 z-20">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-rose-950 text-rose-400 border border-rose-800/80 shadow">
            Hidden ({device})
          </span>
        </div>
      )}

      {/* Rendered Block Content */}
      <div className="p-3">
        <BuilderBlockRenderer
          block={block}
          device={device}
          isEditor={true}
          tenantSlug={tenantSlug}
        />
      </div>
    </div>
  );
}
