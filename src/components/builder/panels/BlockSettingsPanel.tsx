'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Palette,
  Maximize2,
  Smartphone,
  Calendar,
  Code,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { BuilderBlock, BuilderSection, BuilderTheme } from '../types/builder.types';
import { POPULAR_FONTS } from '../tokens/themeTokens';

interface BlockSettingsPanelProps {
  block?: BuilderBlock | null;
  section?: BuilderSection | null;
  theme: BuilderTheme;
  onUpdateBlock: (updated: Partial<BuilderBlock>) => void;
  onUpdateSection: (updated: Partial<BuilderSection>) => void;
  onClose: () => void;
}

export function BlockSettingsPanel({
  block,
  section,
  theme,
  onUpdateBlock,
  onUpdateSection,
  onClose,
}: BlockSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'typography' | 'layout' | 'responsive' | 'visibility' | 'advanced'>('content');

  if (!block && !section) {
    return (
      <aside className="w-80 bg-[#0B0F19] border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center shrink-0 h-[calc(100vh-56px)] select-none">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <h4 className="text-xs font-bold text-white mb-1">Inspector</h4>
        <p className="text-[11px] text-slate-500">
          Click on any block or section in the canvas to customize its content, styles, typography, and responsive visibility.
        </p>
      </aside>
    );
  }

  const isEditingBlock = !!block;

  return (
    <aside className="w-80 bg-[#0B0F19] border-l border-slate-800 flex flex-col shrink-0 h-[calc(100vh-56px)] select-none">
      {/* Inspector Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {isEditingBlock ? `${block.name || block.type} Settings` : `${section?.name || 'Section'} Settings`}
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            {isEditingBlock ? `Block ID: ${block.id}` : `Section ID: ${section?.id}`}
          </span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-none p-1 gap-1">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'content' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'style' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'typography' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Typography
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'layout' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveTab('responsive')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'responsive' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Responsive
        </button>
        <button
          onClick={() => setActiveTab('visibility')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'visibility' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Schedule
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: CONTENT */}
        {activeTab === 'content' && isEditingBlock && block && (
          <div className="space-y-4">
            {/* Block Name */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Display Name / Label
              </label>
              <input
                type="text"
                value={block.name || ''}
                onChange={(e) => onUpdateBlock({ name: e.target.value })}
                placeholder="e.g. Atelier Logo, Shop Links"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            {/* Content Fields for Logo Block */}
            {block.type === 'logo' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Logo Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateBlock({ content: { ...block.content, logoType: 'text' } })}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        block.content.logoType === 'text' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Text / Monogram
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateBlock({ content: { ...block.content, logoType: 'image' } })}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        block.content.logoType === 'image' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Image Asset
                    </button>
                  </div>
                </div>

                {block.content.logoType === 'image' ? (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Logo Image URL
                    </label>
                    <input
                      type="text"
                      value={block.content.imageUrl || ''}
                      onChange={(e) => onUpdateBlock({ content: { ...block.content, imageUrl: e.target.value } })}
                      placeholder="https://.../logo.png"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Logo Text
                    </label>
                    <input
                      type="text"
                      value={block.content.text || ''}
                      onChange={(e) => onUpdateBlock({ content: { ...block.content, text: e.target.value } })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Content Fields for Text Block */}
            {block.type === 'text' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Paragraph Content
                </label>
                <textarea
                  rows={4}
                  value={block.content.text || ''}
                  onChange={(e) => onUpdateBlock({ content: { ...block.content, text: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* Content Fields for Menu Block */}
            {block.type === 'menu' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Column Title
                  </label>
                  <input
                    type="text"
                    value={block.content.heading || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, heading: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Menu Links ({block.content.items?.length || 0})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(block.content.items || []).map((it: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                        <input
                          type="text"
                          value={it.label || ''}
                          onChange={(e) => {
                            const next = [...(block.content.items || [])];
                            next[i] = { ...next[i], label: e.target.value };
                            onUpdateBlock({ content: { ...block.content, items: next } });
                          }}
                          placeholder="Label"
                          className="flex-1 px-2 py-1 rounded bg-slate-950 text-xs text-white border border-slate-700"
                        />
                        <input
                          type="text"
                          value={it.href || ''}
                          onChange={(e) => {
                            const next = [...(block.content.items || [])];
                            next[i] = { ...next[i], href: e.target.value };
                            onUpdateBlock({ content: { ...block.content, items: next } });
                          }}
                          placeholder="/path"
                          className="flex-1 px-2 py-1 rounded bg-slate-950 text-xs text-white border border-slate-700 font-mono"
                        />
                        <button
                          onClick={() => {
                            const next = (block.content.items || []).filter((_: any, idx: number) => idx !== i);
                            onUpdateBlock({ content: { ...block.content, items: next } });
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const next = [...(block.content.items || []), { label: 'New Link', href: '/' }];
                      onUpdateBlock({ content: { ...block.content, items: next } });
                    }}
                    className="mt-2 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Link Item
                  </button>
                </div>
              </div>
            )}

            {/* Content Fields for Newsletter Block */}
            {block.type === 'newsletter' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={block.content.heading || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, heading: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={block.content.description || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, description: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={block.content.buttonText || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, buttonText: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Content Fields for Contact Block */}
            {block.type === 'contact' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={block.content.phone || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, phone: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={block.content.email || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, email: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={block.content.whatsapp || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, whatsapp: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={block.content.address || ''}
                    onChange={(e) => onUpdateBlock({ content: { ...block.content, address: e.target.value } })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1 FOR SECTION */}
        {activeTab === 'content' && !isEditingBlock && section && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Section Name
              </label>
              <input
                type="text"
                value={section.name || ''}
                onChange={(e) => onUpdateSection({ name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Desktop Columns
              </label>
              <select
                value={section.layout.columns?.desktop || 4}
                onChange={(e) =>
                  onUpdateSection({
                    layout: {
                      ...section.layout,
                      columns: {
                        ...(section.layout.columns || { desktop: 4, tablet: 2, mobile: 1 }),
                        desktop: Number(e.target.value),
                      },
                    },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value={1}>1 Full Width Column</option>
                <option value={2}>2 Equal Columns (50% / 50%)</option>
                <option value={3}>3 Columns (33.3% each)</option>
                <option value={4}>4 Columns (25% each)</option>
                <option value={6}>6 Columns (16.6% each)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Container Width
              </label>
              <select
                value={section.layout.containerWidth || 'contained'}
                onChange={(e) =>
                  onUpdateSection({
                    layout: { ...section.layout, containerWidth: e.target.value as any },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="contained">Contained (1280px max-width)</option>
                <option value="narrow">Narrow (896px max-width)</option>
                <option value="full">Full Width Screen (100%)</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 2: STYLE */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    isEditingBlock && block
                      ? block.styles?.textColor || '#F8FAFC'
                      : section?.styles?.textColor || '#F8FAFC'
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({ styles: { ...block.styles, textColor: e.target.value } });
                    } else if (section) {
                      onUpdateSection({ styles: { ...section.styles, textColor: e.target.value } });
                    }
                  }}
                  className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={
                    isEditingBlock && block
                      ? block.styles?.textColor || '#F8FAFC'
                      : section?.styles?.textColor || '#F8FAFC'
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({ styles: { ...block.styles, textColor: e.target.value } });
                    } else if (section) {
                      onUpdateSection({ styles: { ...section.styles, textColor: e.target.value } });
                    }
                  }}
                  className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    isEditingBlock && block
                      ? block.styles?.backgroundColor || '#0B0F19'
                      : section?.styles?.backgroundColor || '#0B0F19'
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({ styles: { ...block.styles, backgroundColor: e.target.value } });
                    } else if (section) {
                      onUpdateSection({ styles: { ...section.styles, backgroundColor: e.target.value } });
                    }
                  }}
                  className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={
                    isEditingBlock && block
                      ? block.styles?.backgroundColor || '#0B0F19'
                      : section?.styles?.backgroundColor || '#0B0F19'
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({ styles: { ...block.styles, backgroundColor: e.target.value } });
                    } else if (section) {
                      onUpdateSection({ styles: { ...section.styles, backgroundColor: e.target.value } });
                    }
                  }}
                  className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Font Family
              </label>
              <select
                value={isEditingBlock && block ? block.styles?.fontFamily || theme.fontFamily : theme.fontFamily}
                onChange={(e) => {
                  if (isEditingBlock && block) {
                    onUpdateBlock({ styles: { ...block.styles, fontFamily: e.target.value } });
                  }
                }}
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
                Font Size (px)
              </label>
              <input
                type="text"
                value={isEditingBlock && block ? block.styles?.fontSize || '13px' : '13px'}
                onChange={(e) => {
                  if (isEditingBlock && block) {
                    onUpdateBlock({ styles: { ...block.styles, fontSize: e.target.value } });
                  }
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* TAB 4: RESPONSIVE OVERRIDES */}
        {activeTab === 'responsive' && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Device Visibility Controls
            </h5>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                <span>Show on Desktop</span>
                <input
                  type="checkbox"
                  checked={
                    isEditingBlock && block
                      ? block.responsive?.desktop?.visible !== false
                      : section?.responsive?.desktop?.visible !== false
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({
                        responsive: {
                          ...block.responsive,
                          desktop: { visible: e.target.checked },
                        },
                      });
                    } else if (section) {
                      onUpdateSection({
                        responsive: {
                          ...section.responsive,
                          desktop: { visible: e.target.checked },
                        },
                      });
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                <span>Show on Tablet</span>
                <input
                  type="checkbox"
                  checked={
                    isEditingBlock && block
                      ? block.responsive?.tablet?.visible !== false
                      : section?.responsive?.tablet?.visible !== false
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({
                        responsive: {
                          ...block.responsive,
                          tablet: { visible: e.target.checked },
                        },
                      });
                    } else if (section) {
                      onUpdateSection({
                        responsive: {
                          ...section.responsive,
                          tablet: { visible: e.target.checked },
                        },
                      });
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
                <span>Show on Mobile</span>
                <input
                  type="checkbox"
                  checked={
                    isEditingBlock && block
                      ? block.responsive?.mobile?.visible !== false
                      : section?.responsive?.mobile?.visible !== false
                  }
                  onChange={(e) => {
                    if (isEditingBlock && block) {
                      onUpdateBlock({
                        responsive: {
                          ...block.responsive,
                          mobile: { visible: e.target.checked },
                        },
                      });
                    } else if (section) {
                      onUpdateSection({
                        responsive: {
                          ...section.responsive,
                          mobile: { visible: e.target.checked },
                        },
                      });
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: SCHEDULE & VISIBILITY */}
        {activeTab === 'visibility' && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Campaign Window &amp; Scheduling
            </h5>
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white cursor-pointer">
              <span>Enable Scheduling</span>
              <input
                type="checkbox"
                checked={
                  isEditingBlock && block
                    ? !!block.visibility?.scheduleEnabled
                    : !!section?.visibility?.scheduleEnabled
                }
                onChange={(e) => {
                  if (isEditingBlock && block) {
                    onUpdateBlock({
                      visibility: { ...block.visibility, scheduleEnabled: e.target.checked },
                    });
                  } else if (section) {
                    onUpdateSection({
                      visibility: { ...section.visibility, scheduleEnabled: e.target.checked },
                    });
                  }
                }}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </label>
          </div>
        )}
      </div>
    </aside>
  );
}
