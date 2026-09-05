'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Copy, Sparkles, RefreshCw, Layers, X } from 'lucide-react';
import type { ProductVariant } from '@/types';

interface VariantMatrixEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice?: number | string;
  baseSku?: string;
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const PRESET_COLORS = [
  { name: 'Blush Pink', hex: '#E8B8B5' },
  { name: 'Ruby Red', hex: '#DC2626' },
  { name: 'Obsidian Black', hex: '#111111' },
  { name: 'Ivory White', hex: '#FFFDFC' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Royal Navy', hex: '#1E3A8A' },
  { name: 'Dusty Rose', hex: '#C98282' },
  { name: 'Mustard Honey', hex: '#D97706' },
];

export function VariantMatrixEditor({
  variants,
  onChange,
  basePrice = 1499,
  baseSku = 'JQT-SKU',
}: VariantMatrixEditorProps) {
  // Extract any sizes & colors already present on existing variants
  const existingSizes = Array.from(
    new Set(variants.map((v) => v.options?.size).filter(Boolean))
  ) as string[];
  const existingColors = Array.from(
    new Set(variants.map((v) => v.options?.color).filter(Boolean))
  ) as string[];

  // User-added custom sizes and colors list
  const [customSizes, setCustomSizes] = useState<string[]>(() => {
    return existingSizes.filter((s) => !PRESET_SIZES.includes(s) && s !== 'Default');
  });

  const [customColors, setCustomColors] = useState<{ name: string; hex: string }[]>(() => {
    return existingColors
      .filter(
        (c) =>
          !PRESET_COLORS.some((pc) => pc.name.toLowerCase() === c.toLowerCase()) &&
          c !== 'Default'
      )
      .map((c) => ({ name: c, hex: '#8B5CF6' }));
  });

  // Selected sizes in generator
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    if (existingSizes.length > 0) return existingSizes.filter((s) => s !== 'Default');
    return ['S', 'M', 'L'];
  });

  // Selected colors in generator
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    if (existingColors.length > 0) return existingColors.filter((c) => c !== 'Default');
    return [];
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');

  const numericBasePrice =
    typeof basePrice === 'number' ? basePrice : parseFloat(basePrice) || 1499;

  // Toggle size in builder
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Add custom size
  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;

    if (!PRESET_SIZES.includes(trimmed) && !customSizes.includes(trimmed)) {
      setCustomSizes((prev) => [...prev, trimmed]);
    }
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
  };

  const removeCustomSize = (sizeToRemove: string) => {
    setCustomSizes((prev) => prev.filter((s) => s !== sizeToRemove));
    setSelectedSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  // Toggle color in builder
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Add custom color
  const addCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (!trimmed) return;

    const formatted = trimmed
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    if (
      !PRESET_COLORS.some((c) => c.name.toLowerCase() === formatted.toLowerCase()) &&
      !customColors.some((c) => c.name.toLowerCase() === formatted.toLowerCase())
    ) {
      const colorPalettes = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#06B6D4'];
      const chosenHex = colorPalettes[customColors.length % colorPalettes.length];
      setCustomColors((prev) => [...prev, { name: formatted, hex: chosenHex }]);
    }

    if (!selectedColors.includes(formatted)) {
      setSelectedColors((prev) => [...prev, formatted]);
    }
    setCustomColorInput('');
  };

  const removeCustomColor = (colorName: string) => {
    setCustomColors((prev) => prev.filter((c) => c.name !== colorName));
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
  };

  // Generate Matrix from Selected Sizes x Colors
  const handleGenerateMatrix = () => {
    const sizes = selectedSizes.length > 0 ? selectedSizes : ['Default'];
    const colors = selectedColors.length > 0 ? selectedColors : ['Default'];

    const newVariants: ProductVariant[] = [];
    sizes.forEach((s) => {
      colors.forEach((c) => {
        const sizeSlug = s === 'Default' ? '' : `-${s.replace(/[^a-zA-Z0-9]/g, '')}`;
        const colorSlug =
          c === 'Default'
            ? ''
            : `-${c.slice(0, 3).toUpperCase().replace(/[^a-zA-Z0-9]/g, '')}`;
        const title =
          c === 'Default' && s === 'Default'
            ? 'Standard'
            : c === 'Default'
            ? `Size ${s}`
            : s === 'Default'
            ? `${c}`
            : `${s} / ${c}`;

        newVariants.push({
          id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title,
          sku: `${baseSku}${sizeSlug}${colorSlug}`,
          price: numericBasePrice,
          stock: 20,
          options: {
            size: s,
            color: c,
          },
        });
      });
    });

    onChange(newVariants);
  };

  // Add a single custom blank variant
  const handleAddSingleVariant = () => {
    const nextIdx = variants.length + 1;
    const newVariant: ProductVariant = {
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `Variant ${nextIdx}`,
      sku: `${baseSku}-V${nextIdx}`,
      price: numericBasePrice,
      stock: 20,
      options: {
        size: 'M',
        color: 'Default',
      },
    };
    onChange([...variants, newVariant]);
  };

  // Duplicate an existing variant
  const handleDuplicateVariant = (idx: number) => {
    const target = variants[idx];
    const copy: ProductVariant = {
      ...target,
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Copy)`,
      sku: `${target.sku}-CPY`,
    };
    const updated = [...variants];
    updated.splice(idx + 1, 0, copy);
    onChange(updated);
  };

  // Delete a variant
  const handleDeleteVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  // Update a single field in a variant
  const handleUpdateField = (
    id: string,
    field: keyof ProductVariant | 'size' | 'color',
    value: any
  ) => {
    const updated = variants.map((v) => {
      if (v.id !== id) return v;

      if (field === 'size') {
        const newOptions = { ...v.options, size: value };
        const newTitle =
          v.options?.color && v.options.color !== 'Default'
            ? `${value} / ${v.options.color}`
            : `Size ${value}`;
        return { ...v, options: newOptions, title: newTitle };
      }

      if (field === 'color') {
        const newOptions = { ...v.options, color: value };
        const newTitle =
          v.options?.size && v.options.size !== 'Default'
            ? `${v.options.size} / ${value}`
            : `${value}`;
        return { ...v, options: newOptions, title: newTitle };
      }

      return { ...v, [field]: value };
    });

    onChange(updated);
  };

  // Apply base price to all variants
  const handleApplyBasePriceToAll = () => {
    const updated = variants.map((v) => ({ ...v, price: numericBasePrice }));
    onChange(updated);
  };

  // Total stock across all variants
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Quick Matrix Generator Card */}
      <div className="bg-[#10121A] p-5 rounded-xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-white text-sm">Quick Variant Matrix Generator</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your available sizes and colors to generate all variant combinations automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateMatrix}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-md flex items-center gap-2 text-xs transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              Generate Combinations ({selectedSizes.length || 1} × {selectedColors.length || 1})
            </span>
          </button>
        </div>

        {/* Sizes Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Select Sizes ({selectedSizes.length} selected):
            </span>
            {selectedSizes.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSizes([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Clear all sizes
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Sizes */}
            {PRESET_SIZES.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {isSelected && '✓ '}
                  {sz}
                </button>
              );
            })}

            {/* User Custom Added Sizes */}
            {customSizes.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <div
                  key={sz}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className="cursor-pointer font-bold"
                  >
                    {isSelected && '✓ '}
                    {sz}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomSize(sz);
                    }}
                    title={`Remove custom size ${sz}`}
                    className="text-slate-400 hover:text-rose-400 text-xs ml-0.5 cursor-pointer leading-none p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Custom Size Input Field */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 focus-within:border-rose-500 rounded-lg px-2.5 py-1 transition-all">
              <input
                type="text"
                placeholder="Custom size (e.g. 3XL, UK 10)..."
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    addCustomSize();
                  }
                }}
                className="bg-transparent text-white text-xs w-48 focus:outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addCustomSize();
                }}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs cursor-pointer transition-all flex items-center gap-0.5 shrink-0"
                title="Add custom size"
              >
                <span>Add</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Colors Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Select Colors ({selectedColors.length} selected):
            </span>
            {selectedColors.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedColors([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Clear all colors
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Colors */}
            {PRESET_COLORS.map((col) => {
              const isSelected = selectedColors.includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => toggleColor(col.name)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  {isSelected && '✓ '}
                  <span>{col.name}</span>
                </button>
              );
            })}

            {/* User Custom Added Colors */}
            {customColors.map((col) => {
              const isSelected = selectedColors.includes(col.name);
              return (
                <div
                  key={col.name}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleColor(col.name)}
                    className="cursor-pointer font-bold"
                  >
                    {isSelected && '✓ '}
                    <span>{col.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomColor(col.name);
                    }}
                    title={`Remove custom color ${col.name}`}
                    className="text-slate-400 hover:text-rose-400 text-xs ml-0.5 cursor-pointer leading-none p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Custom Color Input Field */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 focus-within:border-rose-500 rounded-lg px-2.5 py-1 transition-all">
              <input
                type="text"
                placeholder="Custom color (e.g. Sage Green, Maroon)..."
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    addCustomColor();
                  }
                }}
                className="bg-transparent text-white text-xs w-52 focus:outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addCustomColor();
                }}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs cursor-pointer transition-all flex items-center gap-0.5 shrink-0"
                title="Add custom color"
              >
                <span>Add</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Variants Interactive Matrix Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Active Variants ({variants.length})</span>
          </h4>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Total Inventory: {totalStock} units
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyBasePriceToAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-lg text-xs transition-all border border-slate-700 cursor-pointer"
          >
            Apply Base Price (₹{numericBasePrice})
          </button>
          <button
            type="button"
            onClick={handleAddSingleVariant}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Variant</span>
          </button>
        </div>
      </div>

      {/* 3. Variants Matrix Table with Live Inputs */}
      {variants.length === 0 ? (
        <div className="p-8 text-center bg-[#10121A] border border-slate-800 rounded-xl space-y-3">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">No variants configured yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select sizes & colors above and click &ldquo;Generate Combinations&rdquo;, or click &ldquo;Add Single Variant&rdquo;.
          </p>
          <button
            type="button"
            onClick={handleGenerateMatrix}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Default S/M/L Variants</span>
          </button>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-xl overflow-x-auto bg-[#10121A] shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Color</th>
                <th className="py-3 px-3">Variant Label</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3 w-28">Price (₹)</th>
                <th className="py-3 px-3 w-28">Stock</th>
                <th className="py-3 px-3 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {variants.map((v, idx) => (
                <tr key={v.id || idx} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Row index */}
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {idx + 1}
                  </td>

                  {/* Size input */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={v.options?.size || ''}
                      onChange={(e) => handleUpdateField(v.id, 'size', e.target.value)}
                      placeholder="e.g. M"
                      className="w-16 px-2.5 py-1.5 bg-[#161822] border border-slate-700 rounded-lg text-white font-bold text-center focus:border-rose-500 focus:outline-none"
                    />
                  </td>

                  {/* Color input */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={v.options?.color || ''}
                      onChange={(e) => handleUpdateField(v.id, 'color', e.target.value)}
                      placeholder="e.g. Blush Pink"
                      className="w-28 px-2.5 py-1.5 bg-[#161822] border border-slate-700 rounded-lg text-white focus:border-rose-500 focus:outline-none"
                    />
                  </td>

                  {/* Variant Label input */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => handleUpdateField(v.id, 'title', e.target.value)}
                      placeholder="Variant title"
                      className="w-full px-2.5 py-1.5 bg-[#161822] border border-slate-700 rounded-lg text-white font-semibold focus:border-rose-500 focus:outline-none"
                    />
                  </td>

                  {/* SKU input */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateField(v.id, 'sku', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#161822] border border-slate-700 rounded-lg text-white font-mono text-[11px] focus:border-rose-500 focus:outline-none"
                    />
                  </td>

                  {/* Price input */}
                  <td className="py-2.5 px-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={v.price ?? ''}
                        onChange={(e) =>
                          handleUpdateField(v.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-6 pr-2 py-1.5 bg-[#161822] border border-slate-700 rounded-lg text-rose-300 font-bold font-mono focus:border-rose-500 focus:outline-none text-right"
                      />
                    </div>
                  </td>

                  {/* Stock input */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={v.stock ?? ''}
                      onChange={(e) =>
                        handleUpdateField(v.id, 'stock', parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-[#161822] border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none text-right"
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="Duplicate Variant"
                        onClick={() => handleDuplicateVariant(idx)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete Variant"
                        onClick={() => handleDeleteVariant(v.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
