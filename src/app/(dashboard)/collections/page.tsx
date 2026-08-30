'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CollectionService } from '@/services/collections';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { Collection } from '@/types';

export default function CollectionsPage() {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'manual' | 'automated'>('manual');
  const [isVisible, setIsVisible] = useState(true);

  const fetchCollections = async () => {
    const list = await CollectionService.getAll();
    setCollections(list);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCol(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setType('manual');
    setIsVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCol(col);
    setTitle(col.title);
    setSlug(col.slug);
    setDescription(col.description || '');
    setType(col.type);
    setIsVisible(col.isVisible);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCol) {
      await CollectionService.update(editingCol.id, {
        title,
        slug,
        description,
        type,
        isVisible,
      });
      showToast('Collection updated', 'success');
    } else {
      await CollectionService.create({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        type,
        isVisible,
      });
      showToast('Collection created', 'success');
    }
    setIsModalOpen(false);
    fetchCollections();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    await CollectionService.delete(id);
    showToast('Collection deleted', 'info');
    fetchCollections();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Catalog Collections
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Collections &amp; Lookbooks</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Group products into curated seasonal edits, automated rule sets, and flash drops.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collections.map((col) => (
          <div key={col.id} className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  col.type === 'automated' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {col.type}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {col.productCount || 0} Products
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{col.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{col.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">/{col.slug}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(col)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(col.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCol ? `Edit Collection: ${editingCol.title}` : 'Create Collection'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Collection Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Collection Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              >
                <option value="manual">Manual (Admin selects specific products)</option>
                <option value="automated">Automated (Dynamically matching tags &amp; prices)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md"
              >
                Save Collection
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
