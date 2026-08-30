'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { NavigationService } from '@/services/navigation';
import { useToast } from '@/lib/toast-context';
import type { NavigationMenu, NavigationItem } from '@/types';

export default function NavigationPage() {
  const { showToast } = useToast();
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [activeMenuId, setActiveMenuId] = useState('header-menu');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');

  const fetchMenus = async () => {
    const list = await NavigationService.getAll();
    setMenus(list);
    if (list.length > 0 && !list.some((m) => m.id === activeMenuId || m.slug === activeMenuId)) {
      setActiveMenuId(list[0].slug || list[0].id);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const activeMenu = menus.find((m) => m.id === activeMenuId || m.slug === activeMenuId) || menus[0];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMenu || !newItemLabel || !newItemUrl) return;

    const newItem: NavigationItem = {
      id: `nav_${Date.now()}`,
      label: newItemLabel.trim(),
      type: 'custom',
      url: newItemUrl.trim(),
      isVisible: true,
    };

    const updatedItems = [...activeMenu.items, newItem];
    const targetCode = activeMenu.slug || activeMenu.id;
    await NavigationService.updateMenu(targetCode, updatedItems);
    setNewItemLabel('');
    setNewItemUrl('');
    showToast(`Added "${newItem.label}" to ${activeMenu.title}`, 'success');
    fetchMenus();
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!activeMenu) return;
    const updatedItems = activeMenu.items.filter((i) => i.id !== itemId);
    const targetCode = activeMenu.slug || activeMenu.id;
    await NavigationService.updateMenu(targetCode, updatedItems);
    showToast('Menu item removed', 'info');
    fetchMenus();
  };

  const handleToggleItem = async (itemId: string) => {
    if (!activeMenu) return;
    const updatedItems = activeMenu.items.map((i) =>
      i.id === itemId ? { ...i, isVisible: !i.isVisible } : i
    );
    const targetCode = activeMenu.slug || activeMenu.id;
    await NavigationService.updateMenu(targetCode, updatedItems);
    showToast('Menu item visibility updated', 'info');
    fetchMenus();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Storefront Taxonomy
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Navigation Menus</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure header mega-menus, category shortcuts, and footer sitemap links. Changes reflect live on the storefront.
          </p>
        </div>

        <a
          href="http://localhost:3005"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10121A] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
          <span>View Live Storefront</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Menu Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {menus.map((m) => {
            const isSelected = (m.slug || m.id) === (activeMenu?.slug || activeMenu?.id);
            return (
              <button
                key={m.id || m.slug}
                onClick={() => setActiveMenuId(m.slug || m.id)}
                className={`w-full p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-md'
                    : 'bg-[#161822] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white text-sm">{m.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {m.items?.length || 0} links configured
                </div>
                <div className="text-[10px] text-rose-400 font-mono mt-1">
                  code: {m.slug || m.id}
                </div>
              </button>
            );
          })}
        </div>

        {/* Menu Editor (8 cols) */}
        <div className="lg:col-span-8 bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">{activeMenu?.title}</h3>
              <p className="text-[11px] text-slate-400">
                Manage links and URLs displayed in this menu.
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
              slug: {activeMenu?.slug || activeMenu?.id}
            </span>
          </div>

          {/* Current Items List */}
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
            {activeMenu?.items && activeMenu.items.length > 0 ? (
              activeMenu.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#10121A] flex items-center justify-between gap-3 hover:bg-slate-800/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-slate-500 w-4 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate flex items-center gap-2">
                        <span>{item.label}</span>
                        {!item.isVisible && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{item.url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-1.5 rounded transition-colors ${
                        item.isVisible
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-slate-500 hover:bg-slate-800'
                      }`}
                      title={item.isVisible ? 'Visible on storefront' : 'Hidden from storefront'}
                    >
                      {item.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                No items in this menu. Add your first link below.
              </div>
            )}
          </div>

          {/* Add New Link Box */}
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Link to {activeMenu?.title}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Kurti Edits"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target URL *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /women?category=kurtis"
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Link</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
