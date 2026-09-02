'use client';

import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Palette,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Trash2,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { BlockRegistry } from '../registry/BlockRegistry';
import { BlockCategory, BuilderDocument, BuilderSection, BuilderBlock } from '../types/builder.types';
import { POPULAR_FONTS } from '../tokens/themeTokens';

interface BuilderSidebarProps {
  document: BuilderDocument;
  onAddBlock: (type: string, sectionId?: string) => void;
  onAddSection: () => void;
  onSelectBlock: (blockId: string, sectionId: string) => void;
  onSelectSection: (sectionId: string) => void;
  selectedBlockId?: string | null;
  selectedSectionId?: string | null;
  onUpdateTheme: (theme: Partial<BuilderDocument['theme']>) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onToggleSectionVisibility: (sectionId: string) => void;
  onToggleBlockVisibility: (sectionId: string, blockId: string) => void;
}

export function BuilderSidebar({
  document,
  onAddBlock,
  onAddSection,
  onSelectBlock,
  onSelectSection,
  selectedBlockId,
  selectedSectionId,
  onUpdateTheme,
  onDeleteSection,
  onDeleteBlock,
  onToggleSectionVisibility,
  onToggleBlockVisibility,
}: BuilderSidebarProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers' | 'theme'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allBlocks = BlockRegistry.getAll();
  const filteredBlocks = allBlocks.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'content', label: 'Content' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'commerce', label: 'Commerce' },
    { id: 'social', label: 'Social' },
    { id: 'contact', label: 'Contact' },
    { id: 'layout', label: 'Layout' },
  ];

  return (
    <aside className="w-80 bg-[#0B0F19] border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-56px)] select-none">
      {/* Top Tabs */}
      <div className="grid grid-cols-3 border-b border-slate-800 p-1 bg-slate-950/60">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'blocks'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'layers'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Outline</span>
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'theme'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Blocks Library */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Block Library
              </span>
              <button
                onClick={onAddSection}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                + New Section
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search blocks (logo, menu, form)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Blocks Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {filteredBlocks.map((b) => {
                const IconComponent = typeof b.icon === 'function' ? b.icon : Plus;
                return (
                  <button
                    key={b.type}
                    onClick={() => onAddBlock(b.type)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 text-left transition-all group flex flex-col justify-between min-h-[90px] cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-7 h-7 rounded-lg bg-rose-600/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <Plus className="w-3 h-3 text-slate-600 group-hover:text-rose-400" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200 group-hover:text-white leading-tight">
                        {b.name}
                      </h5>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-mono">
                        {b.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Outline / Layers */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Document Tree
              </span>
              <span className="text-[10px] text-slate-500">
                {document.sections.length} sections
              </span>
            </div>

            <div className="space-y-2">
              {document.sections.map((sec, secIdx) => {
                const isSecSelected = selectedSectionId === sec.id;
                return (
                  <div
                    key={sec.id}
                    className={`rounded-xl border overflow-hidden transition-all ${
                      isSecSelected
                        ? 'border-rose-500 bg-slate-900/90'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => onSelectSection(sec.id)}
                      className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-bold text-white truncate">
                          {sec.name || `Section ${secIdx + 1}`}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          ({sec.blocks.length})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSectionVisibility(sec.id);
                          }}
                          className="p-1 hover:text-white text-slate-500"
                        >
                          {sec.enabled !== false ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSection(sec.id);
                          }}
                          className="p-1 hover:text-rose-400 text-slate-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Nested Blocks */}
                    {sec.blocks.length > 0 && (
                      <div className="border-t border-slate-800/60 p-1.5 space-y-1 bg-slate-950/40">
                        {sec.blocks.map((blk) => {
                          const isBlkSelected = selectedBlockId === blk.id;
                          return (
                            <div
                              key={blk.id}
                              onClick={() => onSelectBlock(blk.id, sec.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                isBlkSelected
                                  ? 'bg-rose-600 text-white font-bold'
                                  : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] opacity-70">↳</span>
                                <span className="truncate">{blk.name || blk.type}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleBlockVisibility(sec.id, blk.id);
                                  }}
                                  className="p-0.5 hover:text-white opacity-80"
                                >
                                  {blk.enabled !== false ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <EyeOff className="w-3 h-3 text-rose-300" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteBlock(sec.id, blk.id);
                                  }}
                                  className="p-0.5 hover:text-white opacity-80"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Theme Tokens */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Theme Colors &amp; Styling
              </h4>
              <p className="text-[11px] text-slate-400">
                Global palette tokens inherited across all builder blocks.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={document.theme.backgroundColor || '#0B0F19'}
                    onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={document.theme.backgroundColor || '#0B0F19'}
                    onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={document.theme.accentColor || '#E11D48'}
                    onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={document.theme.accentColor || '#E11D48'}
                    onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={document.theme.textColor || '#F8FAFC'}
                    onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={document.theme.textColor || '#F8FAFC'}
                    onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Border Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={document.theme.borderColor || '#1E293B'}
                    onChange={(e) => onUpdateTheme({ borderColor: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={document.theme.borderColor || '#1E293B'}
                    onChange={(e) => onUpdateTheme({ borderColor: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Primary Font Family
                </label>
                <select
                  value={document.theme.fontFamily || 'Plus Jakarta Sans, sans-serif'}
                  onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  {POPULAR_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Heading Font Family
                </label>
                <select
                  value={document.theme.headingFontFamily || 'Playfair Display, serif'}
                  onChange={(e) => onUpdateTheme({ headingFontFamily: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white cursor-pointer"
                >
                  {POPULAR_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
