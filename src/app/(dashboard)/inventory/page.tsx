'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  Plus,
  Minus,
  X,
  Save,
} from 'lucide-react';
import { InventoryService } from '@/services/inventory';
import { useToast } from '@/lib/toast-context';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { InventoryItem } from '@/types';

export default function InventoryPage() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Adjustment Modal State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('10');
  const [adjustReason, setAdjustReason] = useState('restock');

  const fetchInventory = async () => {
    setIsLoading(true);
    const list = await InventoryService.getAll();
    setInventory(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const updated = await InventoryService.adjustStock(
        selectedItem.variantId,
        parseInt(adjustAmount, 10),
        adjustReason
      );
      setInventory(inventory.map((i) => (i.variantId === updated.variantId ? updated : i)));
      showToast(`Adjusted stock for ${selectedItem.sku}`, 'success');
      setSelectedItem(null);
    } catch {
      showToast('Failed to adjust stock', 'error');
    }
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'productTitle',
      header: 'Product & Variant',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-white">{item.productTitle}</div>
          <div className="text-[11px] text-slate-400">{item.variantTitle}</div>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU Code',
      sortable: true,
      render: (item) => <span className="font-mono text-slate-400">{item.sku}</span>,
    },
    {
      key: 'availableStock',
      header: 'Available Stock',
      sortable: true,
      render: (item) => (
        <span className="font-mono font-bold text-emerald-400">{item.availableStock} Units</span>
      ),
    },
    {
      key: 'reservedStock',
      header: 'Reserved',
      render: (item) => <span className="text-slate-400">{item.reservedStock} Units</span>,
    },
    {
      key: 'totalOnHand',
      header: 'Total On Hand',
      sortable: true,
      render: (item) => <span className="font-bold text-white font-mono">{item.totalOnHand} Units</span>,
    },
    {
      key: 'status',
      header: 'Health Status',
      sortable: true,
      render: (item) => {
        const isLow = item.availableStock <= item.lowStockThreshold;
        return isLow ? (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </span>
        ) : (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Healthy
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: (item) => (
        <button
          onClick={() => {
            setSelectedItem(item);
            setAdjustAmount('10');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 inline-flex items-center gap-1"
        >
          <ArrowUpDown className="w-3 h-3" />
          <span>Adjust</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Stock Management
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Multi-SKU Inventory Matrix</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time warehouse allocations, safety buffers, and restock batches.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10121A] border border-slate-800 rounded-lg text-xs">
          <Warehouse className="w-4 h-4 text-emerald-400" />
          <span className="text-white font-bold">Bengaluru Flagship Studio</span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={inventory}
        columns={columns}
        searchPlaceholder="Search SKU, product title..."
        searchKey={(i) => `${i.productTitle} ${i.sku} ${i.variantTitle}`}
        filterOptions={[
          { label: 'Low Stock', value: 'low_stock', filterFn: (i) => i.availableStock <= i.lowStockThreshold },
          { label: 'Healthy', value: 'healthy', filterFn: (i) => i.availableStock > i.lowStockThreshold },
        ]}
      />

      {/* ADJUSTMENT MODAL */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Adjust Stock: ${selectedItem.sku}`}
          subtitle={selectedItem.productTitle}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Adjustment Quantity (+ / -)</label>
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Enter positive numbers to restock (e.g. 15) or negative numbers to deduct (e.g. -5).
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Reason for Movement</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              >
                <option value="restock">New Studio Production Batch</option>
                <option value="damaged">Damaged / Defective Garment Deduction</option>
                <option value="audit">Physical Inventory Count Audit</option>
                <option value="return">Customer Return Restock</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
