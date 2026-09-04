'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Save,
  X,
} from 'lucide-react';
import { CategoryService } from '@/services/categories';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    const list = await CategoryService.getAll();
    setCategories(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    const handleTenantChange = () => {
      fetchCategories();
    };
    window.addEventListener('tenant_updated', handleTenantChange);
    window.addEventListener('storage', handleTenantChange);
    return () => {
      window.removeEventListener('tenant_updated', handleTenantChange);
      window.removeEventListener('storage', handleTenantChange);
    };
  }, []);

  const openCreateModal = (parent?: string) => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setParentId(parent || null);
    setIsVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setParentId(cat.parentId || null);
    setIsVisible(cat.isVisible);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      await CategoryService.update(editingCat.id, {
        name,
        slug,
        description,
        imageUrl,
        parentId,
        isVisible,
      });
      showToast('Category updated successfully', 'success');
    } else {
      await CategoryService.create({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        imageUrl,
        parentId,
        isVisible,
      });
      showToast('Category created successfully', 'success');
    }
    setIsModalOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await CategoryService.delete(id);
    showToast('Category deleted', 'info');
    fetchCategories();
  };

  const handleToggleVisibility = async (cat: Category) => {
    await CategoryService.update(cat.id, { isVisible: !cat.isVisible });
    showToast(`Visibility updated for ${cat.name}`, 'info');
    fetchCategories();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Catalog Structure
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Nested Categories</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize departments, sub-categories, and storefront menu taxonomy.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      {/* Category Hierarchy List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#161822] border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading store categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-[#161822] border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
              <FolderTree className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">No Categories Created Yet</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This store currently has no product categories. Add your own departments and sub-categories to organize your catalog and storefront navigation menu.
              </p>
            </div>
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Department</span>
            </button>
          </div>
        ) : (
          categories.map((parent) => (
          <div key={parent.id} className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Parent Category Header */}
            <div className="p-4 bg-[#12141D] flex items-center justify-between gap-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                  <img src={parent.imageUrl} alt={parent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{parent.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/{parent.slug}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{parent.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(parent)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    parent.isVisible
                      ? 'text-emerald-400 hover:bg-emerald-950/30'
                      : 'text-slate-500 hover:bg-slate-800'
                  }`}
                  title={parent.isVisible ? 'Visible' : 'Hidden'}
                >
                  {parent.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openCreateModal(parent.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
                >
                  + Subcategory
                </button>
                <button
                  onClick={() => openEditModal(parent)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(parent.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Child Subcategories */}
            {parent.children && parent.children.length > 0 && (
              <div className="divide-y divide-slate-800/60 p-2">
                {parent.children.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 pl-8 flex items-center justify-between text-xs hover:bg-slate-800/20 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-white">{sub.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/{sub.slug}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(sub)}
                        className={`p-1 rounded ${
                          sub.isVisible ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {sub.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )))}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCat ? `Edit Category: ${editingCat.name}` : 'Create New Category'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
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
              <label className="block text-slate-300 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Department Banner / Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaOpen(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shrink-0"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
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
                Save Category
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Media Picker */}
      {isMediaOpen && (
        <MediaPickerModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={(url) => setImageUrl(url)}
          title="Select Category Thumbnail"
        />
      )}
    </div>
  );
}
