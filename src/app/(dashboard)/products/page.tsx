'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { ProductService } from '@/services/products';
import { useToast } from '@/lib/toast-context';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Product } from '@/types';

export default function ProductsListPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const list = await ProductService.getAll();
      setProducts(list);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDuplicate = async (p: Product) => {
    const duplicated: Partial<Product> = {
      ...p,
      title: `${p.title} (Copy)`,
      slug: `${p.slug}-copy-${Date.now()}`,
      sku: `${p.sku}-CPY`,
      status: 'draft',
    };
    const created = await ProductService.create(duplicated);
    setProducts([created, ...products]);
    showToast(`Duplicated ${p.title} as draft`, 'success');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await ProductService.delete(id);
    setProducts(products.filter((p) => p.id !== id));
    showToast('Product deleted', 'info');
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} selected products?`)) return;
    await ProductService.bulkDelete(ids);
    setProducts(products.filter((p) => !ids.includes(p.id)));
    showToast(`Deleted ${ids.length} products`, 'info');
  };

  const handleBulkPublish = async (ids: string[]) => {
    await ProductService.bulkUpdateStatus(ids, 'published');
    setProducts(
      products.map((p) => (ids.includes(p.id) ? { ...p, status: 'published' } : p))
    );
    showToast(`Published ${ids.length} products`, 'success');
  };

  const columns: Column<Product>[] = [
    {
      key: 'title',
      header: 'Product Details',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
            <img
              src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&auto=format&fit=crop'}
              alt={p.title || 'Product'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <Link
              href={`/products/${p.id}`}
              className="font-bold text-white hover:text-rose-400 transition-colors line-clamp-1"
            >
              {p.title}
            </Link>
            <div className="text-[11px] text-slate-500 font-mono">SKU: {p.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryIds',
      header: 'Category',
      render: (p) => {
        const catName = p.categoryIds?.[0]?.replace('cat_', '').replace(/_/g, ' ') || 'Women';
        return <span className="capitalize text-slate-300 font-semibold">{catName}</span>;
      },
    },
    {
      key: 'price',
      header: 'Price (₹)',
      sortable: true,
      render: (p) => (
        <div className="font-mono">
          <span className="font-bold text-white">₹{(p.price || 0).toLocaleString('en-IN')}</span>
          {p.compareAtPrice && (
            <span className="text-[11px] text-slate-500 line-through ml-1.5">
              ₹{(p.compareAtPrice || 0).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock Inventory',
      sortable: true,
      render: (p) => {
        const stockCount = typeof p.stock === 'number' ? p.stock : 0;
        const isLow = stockCount <= (p.lowStockThreshold || 10);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono font-bold ${
                isLow ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {stockCount} Units
            </span>
            {isLow && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Low
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
            p.status === 'published'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {p.status || 'published'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/products/${p.id}`}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDuplicate(p)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Duplicate Product"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Catalog Management
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-variant garments, size matrices, pricing, and stock allocations.
          </p>
        </div>

        <Link
          href="/products/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </Link>
      </div>

      {/* Data Table */}
      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search by title, SKU, tags..."
        searchKey={(p) => `${p.title || ''} ${p.sku || ''} ${p.tags?.join(' ') || ''}`}
        filterOptions={[
          { label: 'Published', value: 'published', filterFn: (p) => p.status === 'published' },
          { label: 'Draft', value: 'draft', filterFn: (p) => p.status === 'draft' },
          { label: 'Low Stock', value: 'low_stock', filterFn: (p) => (p.stock || 0) <= (p.lowStockThreshold || 10) },
        ]}
        bulkActions={[
          { label: 'Publish Selected', action: handleBulkPublish },
          { label: 'Delete Selected', action: handleBulkDelete, isDestructive: true },
        ]}
      />
    </div>
  );
}
