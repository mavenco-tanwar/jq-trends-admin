'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Save,
  Eye,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Calendar,
  X,
} from 'lucide-react';
import { ContentService } from '@/services/content';
import { useToast } from '@/lib/toast-context';
import { BlockCard } from '@/components/cms/BlockCard';
import { BlockEditorModal } from '@/components/cms/BlockEditorModal';
import { BlockLibraryModal } from '@/components/cms/BlockLibraryModal';
import { DevicePreviewFrame } from '@/components/cms/DevicePreviewFrame';
import type { ContentBlock, HomepageConfig } from '@/types';

export default function HomepageBuilderPage() {
  const { showToast } = useToast();
  const [homepage, setHomepage] = useState<HomepageConfig | null>(null);
  const [sections, setSections] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Modals State
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<{ version: number; updatedAt: string; publishedAt?: string; sections: ContentBlock[] }[]>([]);

  const fetchHomepage = async () => {
    try {
      setIsLoading(true);
      const data = await ContentService.getHomepage(true);
      setHomepage(data);
      setSections(data.sections || []);
    } catch (err: any) {
      showToast('Failed to load homepage sections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepage();
  }, []);

  const handleToggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible, updatedAt: new Date().toISOString() } : s))
    );
    showToast('Section visibility updated. Remember to Save or Publish!', 'info');
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    const updated = [...sections];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    updated.forEach((s, idx) => (s.displayOrder = idx + 1));
    setSections(updated);
    setDraggedIndex(null);
    showToast('Sections reordered. Remember to Publish Live!', 'info');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    updated.forEach((s, idx) => (s.displayOrder = idx + 1));
    setSections(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    updated.forEach((s, idx) => (s.displayOrder = idx + 1));
    setSections(updated);
  };

  const handleDuplicate = (block: ContentBlock) => {
    const duplicated: ContentBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `sec_${block.type}_${Date.now()}`,
      name: `${block.name} (Copy)`,
      displayOrder: sections.length + 1,
      updatedAt: new Date().toISOString(),
    };
    setSections([...sections, duplicated]);
    showToast(`Duplicated ${block.name}`, 'success');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this section from the homepage?')) return;
    setSections(sections.filter((s) => s.id !== id));
    showToast('Section removed', 'info');
  };

  const handleSaveBlockEdit = async (updatedBlock: ContentBlock) => {
    const updated = sections.map((s) => (s.id === updatedBlock.id ? updatedBlock : s));
    setSections(updated);
    try {
      const pub = await ContentService.publishHomepage(updated);
      setHomepage(pub);
      showToast(`Saved & Published live: ${updatedBlock.name}`, 'success');
    } catch {
      showToast(`Updated section: ${updatedBlock.name}`, 'info');
    }
  };

  const handleAddBlockFromLibrary = (newBlock: ContentBlock) => {
    newBlock.displayOrder = sections.length + 1;
    setSections([...sections, newBlock]);
    showToast(`Added ${newBlock.name} to homepage`, 'success');
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draft = await ContentService.saveDraft(sections);
      setHomepage(draft);
      showToast('Homepage draft saved successfully!', 'success');
    } catch {
      showToast('Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      const published = await ContentService.publishHomepage(sections);
      setHomepage(published);
      showToast(`Homepage v${published.version} published live to storefront!`, 'success');
    } catch {
      showToast('Failed to publish homepage', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpenHistory = async () => {
    const hist = await ContentService.getHistory();
    setHistoryList(hist);
    setIsHistoryOpen(true);
  };

  const handleRestoreVersion = async (version: number) => {
    if (!confirm(`Restore homepage to Version ${version}? Current unsaved changes will be replaced.`)) return;
    const restored = await ContentService.restoreVersion(version);
    setSections(restored);
    setIsHistoryOpen(false);
    showToast(`Restored homepage Version ${version}`, 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Top Header & Publishing Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Visual Headless CMS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Version {homepage?.version || 1} • {homepage?.status?.toUpperCase() || 'PUBLISHED'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Homepage Builder &amp; Section Flow</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrange, schedule, and toggle visibility for every storefront block without writing code.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>+ Add Section</span>
          </button>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Device Preview</span>
          </button>

          <button
            onClick={handleOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
            title="Version History"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>History</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Info Status Banner */}
      <div className="p-3.5 bg-[#161822] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Layers className="w-4 h-4 text-rose-400" />
          <span>
            Displaying <strong className="text-white">{sections.length} sections</strong> (
            <strong className="text-emerald-400">{sections.filter((s) => s.isVisible).length} visible</strong>,{' '}
            <strong className="text-slate-400">{sections.filter((s) => !s.isVisible).length} hidden</strong>)
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Toggle visibility switch to immediately show/hide any block on the storefront.
        </span>
      </div>

      {/* Block List Stack */}
      <div className="space-y-3">
        {sections.map((block, idx) => (
          <BlockCard
            key={block.id}
            block={block}
            index={idx}
            total={sections.length}
            isDragging={draggedIndex === idx}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onToggleVisibility={handleToggleVisibility}
            onEdit={(b) => setEditingBlock(b)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
      </div>

      {/* MODAL: BLOCK INSPECTOR / EDITOR */}
      {editingBlock && (
        <BlockEditorModal
          isOpen={!!editingBlock}
          onClose={() => setEditingBlock(null)}
          block={editingBlock}
          onSave={handleSaveBlockEdit}
        />
      )}

      {/* MODAL: BLOCK PRESET LIBRARY */}
      {isLibraryOpen && (
        <BlockLibraryModal
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onAddBlock={handleAddBlockFromLibrary}
        />
      )}

      {/* SIMULATOR: DEVICE PREVIEW FRAME */}
      {isPreviewOpen && (
        <DevicePreviewFrame
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          blocks={sections}
        />
      )}

      {/* DRAWER: VERSION HISTORY */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161822] border-l border-slate-800 h-full flex flex-col shadow-2xl p-6 space-y-4 select-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Homepage Version History</span>
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs">
              {historyList.map((ver) => (
                <div key={ver.version} className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Version {ver.version}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {ver.sections.length} Blocks
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Published: {new Date(ver.publishedAt || ver.updatedAt).toLocaleString('en-IN')}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleRestoreVersion(ver.version)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore This Snapshot</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
