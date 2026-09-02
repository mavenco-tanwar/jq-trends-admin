'use client';

import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { BuilderDocument, BuilderDevice, BuilderBlock, BuilderSection } from '../types/builder.types';
import { SectionRenderer } from './SectionRenderer';

interface BuilderCanvasProps {
  document: BuilderDocument;
  device: BuilderDevice;
  selectedSectionId?: string | null;
  selectedBlockId?: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectBlock: (blockId: string, sectionId: string) => void;
  onAddSection: () => void;
  onAddBlockToSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onToggleSectionVisibility: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onDuplicateBlock: (sectionId: string, blockId: string) => void;
  onToggleBlockVisibility: (sectionId: string, blockId: string) => void;
  onMoveBlock: (sectionId: string, blockId: string, direction: 'up' | 'down') => void;
  onReorderBlocks: (sectionId: string, blocks: BuilderBlock[]) => void;
  onDeselect: () => void;
  tenantSlug?: string;
}

export function BuilderCanvas({
  document,
  device,
  selectedSectionId,
  selectedBlockId,
  onSelectSection,
  onSelectBlock,
  onAddSection,
  onAddBlockToSection,
  onDeleteSection,
  onDuplicateSection,
  onToggleSectionVisibility,
  onMoveSection,
  onDeleteBlock,
  onDuplicateBlock,
  onToggleBlockVisibility,
  onMoveBlock,
  onReorderBlocks,
  onDeselect,
  tenantSlug,
}: BuilderCanvasProps) {
  // Device Frame widths
  const containerWidthClass =
    device === 'desktop'
      ? 'w-full'
      : device === 'tablet'
      ? 'w-[768px] mx-auto shadow-2xl border border-slate-700 rounded-3xl overflow-hidden'
      : 'w-[390px] mx-auto shadow-2xl border-4 border-slate-700 rounded-[40px] overflow-hidden';

  return (
    <div
      onClick={onDeselect}
      className="flex-1 bg-[#07090E] overflow-y-auto p-4 sm:p-8 flex flex-col items-center min-h-[calc(100vh-56px)]"
    >
      {/* Device frame wrapper */}
      <div
        style={{
          fontFamily: document.theme?.fontFamily || 'inherit',
          backgroundColor: document.theme?.backgroundColor || '#0B0F19',
          color: document.theme?.textColor || '#F8FAFC',
        }}
        className={`${containerWidthClass} min-h-[500px] p-6 space-y-6 transition-all duration-300 relative`}
      >
        {document.sections.length === 0 ? (
          <div className="p-16 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-10 h-10 text-rose-500 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Start Designing Your {document.type.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Add responsive rows and drop blocks to build an interactive, high-converting storefront experience.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSection();
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Section</span>
            </button>
          </div>
        ) : (
          document.sections.map((section, idx) => (
            <SectionRenderer
              key={section.id}
              section={section}
              device={device}
              isSelected={selectedSectionId === section.id && !selectedBlockId}
              selectedBlockId={selectedBlockId}
              onSelectSection={() => onSelectSection(section.id)}
              onSelectBlock={(blockId) => onSelectBlock(blockId, section.id)}
              onAddBlock={() => onAddBlockToSection(section.id)}
              onDeleteSection={() => onDeleteSection(section.id)}
              onDuplicateSection={() => onDuplicateSection(section.id)}
              onToggleVisibility={() => onToggleSectionVisibility(section.id)}
              onMoveUp={idx > 0 ? () => onMoveSection(section.id, 'up') : undefined}
              onMoveDown={idx < document.sections.length - 1 ? () => onMoveSection(section.id, 'down') : undefined}
              onDeleteBlock={(blockId) => onDeleteBlock(section.id, blockId)}
              onDuplicateBlock={(blockId) => onDuplicateBlock(section.id, blockId)}
              onToggleBlockVisibility={(blockId) => onToggleBlockVisibility(section.id, blockId)}
              onMoveBlock={(blockId, dir) => onMoveBlock(section.id, blockId, dir)}
              onReorderBlocks={(reordered) => onReorderBlocks(section.id, reordered)}
              tenantSlug={tenantSlug}
            />
          ))
        )}

        {/* Add Section Button at bottom */}
        {document.sections.length > 0 && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSection();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-500" />
              <span>Add Another Section</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
