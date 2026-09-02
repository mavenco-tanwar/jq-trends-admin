'use client';

import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  Save,
  Send,
  History,
  Sparkles,
  Layers,
} from 'lucide-react';
import { BuilderDevice, BuilderDocument } from '../types/builder.types';

interface BuilderToolbarProps {
  device: BuilderDevice;
  onDeviceChange: (d: BuilderDevice) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  onTogglePreview: () => void;
  isPreviewOpen: boolean;
  onOpenVersions: () => void;
  onOpenPresets?: () => void;
  document: BuilderDocument;
}

export function BuilderToolbar({
  device,
  onDeviceChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveDraft,
  onPublish,
  isSaving = false,
  isPublishing = false,
  onTogglePreview,
  isPreviewOpen,
  onOpenVersions,
  onOpenPresets,
  document,
}: BuilderToolbarProps) {
  return (
    <div className="h-14 bg-[#0B0F19]/95 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between gap-4 sticky top-0 z-50">
      {/* Left: Document Info & Presets */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {document.name || `${document.type.toUpperCase()} BUILDER`}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${
                  document.status === 'published'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                }`}
              >
                {document.status} (v{document.version})
              </span>
            </div>
          </div>
        </div>

        {onOpenPresets && (
          <button
            onClick={onOpenPresets}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Presets</span>
          </button>
        )}
      </div>

      {/* Center: Device Viewport Controls & Undo/Redo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === 'desktop'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop Viewport (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => onDeviceChange('tablet')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === 'tablet'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet Viewport (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              device === 'mobile'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Viewport (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              !canUndo ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title="Undo (Ctrl/Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              !canRedo ? 'opacity-40 cursor-not-allowed' : ''
            }`}
            title="Redo (Ctrl/Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: History, Preview, Draft & Publish */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenVersions}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 text-xs flex items-center gap-1.5"
          title="Version History & Rollbacks"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Versions</span>
        </button>

        <button
          onClick={onTogglePreview}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
            isPreviewOpen
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isPreviewOpen ? 'Exit Preview' : 'Live Preview'}</span>
        </button>

        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-amber-400" />
          <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
        </button>

        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
        </button>
      </div>
    </div>
  );
}
