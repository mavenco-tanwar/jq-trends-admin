'use client';

import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  GripVertical,
  Settings2,
} from 'lucide-react';
import { BuilderSection, BuilderDevice, BuilderBlock } from '../types/builder.types';
import { SortableBlock } from './SortableBlock';

interface SectionRendererProps {
  section: BuilderSection;
  device: BuilderDevice;
  isSelected: boolean;
  selectedBlockId?: string | null;
  onSelectSection: () => void;
  onSelectBlock: (blockId: string) => void;
  onAddBlock: (sectionId: string) => void;
  onDeleteSection: () => void;
  onDuplicateSection: () => void;
  onToggleVisibility: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onToggleBlockVisibility: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onReorderBlocks: (reorderedBlocks: BuilderBlock[]) => void;
  tenantSlug?: string;
}

export function SectionRenderer({
  section,
  device,
  isSelected,
  selectedBlockId,
  onSelectSection,
  onSelectBlock,
  onAddBlock,
  onDeleteSection,
  onDuplicateSection,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDeleteBlock,
  onDuplicateBlock,
  onToggleBlockVisibility,
  onMoveBlock,
  onReorderBlocks,
  tenantSlug,
}: SectionRendererProps) {
  const [draggedBlockId, setDraggedBlockId] = React.useState<string | null>(null);

  const isSecVis = section.enabled !== false && section.responsive?.[device]?.visible !== false;

  const cols =
    device === 'desktop'
      ? section.layout.columns?.desktop || 4
      : device === 'tablet'
      ? section.layout.columns?.tablet || 2
      : section.layout.columns?.mobile || 1;

  const containerClass =
    section.layout.containerWidth === 'full'
      ? 'w-full px-4 sm:px-6 lg:px-10'
      : section.layout.containerWidth === 'narrow'
      ? 'max-w-4xl mx-auto px-4 sm:px-6'
      : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  const gridClass =
    cols === 1
      ? 'grid grid-cols-1'
      : cols === 2
      ? 'grid grid-cols-1 sm:grid-cols-2'
      : cols === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : cols === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : cols === 6
      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedBlockId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedBlockId;
    if (!sourceId || sourceId === targetId) return;

    const blocks = [...section.blocks];
    const sourceIdx = blocks.findIndex((b) => b.id === sourceId);
    const targetIdx = blocks.findIndex((b) => b.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const [removed] = blocks.splice(sourceIdx, 1);
    blocks.splice(targetIdx, 0, removed);
    const reindexed = blocks.map((b, i) => ({ ...b, order: i + 1 }));
    onReorderBlocks(reindexed);
    setDraggedBlockId(null);
  };

  return (
    <section
      onClick={(e) => {
        e.stopPropagation();
        onSelectSection();
      }}
      style={{
        backgroundColor: section.styles.backgroundColor || 'transparent',
        backgroundImage: section.styles.backgroundImage ? `url(${section.styles.backgroundImage})` : undefined,
        borderColor: section.styles.borderColor || 'rgba(255,255,255,0.08)',
        borderTopWidth: section.styles.borderTopWidth || '0px',
        borderBottomWidth: section.styles.borderBottomWidth || '0px',
      }}
      className={`relative group transition-all rounded-2xl border ${
        isSelected
          ? 'ring-2 ring-rose-500/80 border-rose-500 bg-slate-900/40'
          : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40'
      } ${!isSecVis ? 'opacity-50 border-dashed border-rose-500/40' : ''}`}
    >
      {/* Section Header Controls Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60 bg-slate-900/70 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {section.name || 'Section'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {cols} Cols ({section.blocks.length} blocks)
          </span>
          {!isSecVis && (
            <span className="text-[9px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 font-bold border border-rose-800/60">
              Hidden on {device}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddBlock(section.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-rose-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isSecVis ? 'Hide Section' : 'Show Section'}
          >
            {isSecVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
          </button>

          {onMoveUp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Move Section Up"
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
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Move Section Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateSection();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSection();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Blocks Grid Container */}
      <div className={`py-6 ${containerClass}`}>
        {section.blocks.length === 0 ? (
          <div
            onClick={() => onAddBlock(section.id)}
            className="p-8 rounded-xl border-2 border-dashed border-slate-800 hover:border-rose-500/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
          >
            <Plus className="w-6 h-6 text-slate-600 group-hover:text-rose-400 mb-2 transition-colors" />
            <span className="text-xs font-bold text-slate-400 group-hover:text-white">
              Section is empty. Click to add your first block.
            </span>
            <span className="text-[10px] text-slate-600 mt-1">
              Add logo, text, menu columns, newsletter, or social icons.
            </span>
          </div>
        ) : (
          <div className={`${gridClass} gap-6`}>
            {section.blocks.map((block, idx) => (
              <SortableBlock
                key={block.id}
                block={block}
                sectionId={section.id}
                isSelected={selectedBlockId === block.id}
                device={device}
                onSelect={() => onSelectBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onToggleVisibility={() => onToggleBlockVisibility(block.id)}
                onMoveUp={idx > 0 ? () => onMoveBlock(block.id, 'up') : undefined}
                onMoveDown={idx < section.blocks.length - 1 ? () => onMoveBlock(block.id, 'down') : undefined}
                tenantSlug={tenantSlug}
                isDragging={draggedBlockId === block.id}
                onDragStart={(e) => handleDragStart(e, block.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, block.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
