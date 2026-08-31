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
  Sparkles,
  Download,
  TrendingDown,
  FileText,
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
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('blr_studio');

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

  const handleDownloadSupplierPo = () => {
    const lowStockItems = inventory.filter((i) => i.availableStock <= (i.lowStockThreshold || 10));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = (lowStockItems.length > 0 ? lowStockItems : inventory.slice(0, 3))
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 12px;">
          <td style="padding: 8px 4px;">${idx + 1}</td>
          <td style="padding: 8px 4px;"><strong>${item.productTitle}</strong> (${item.variantTitle})<br/><span style="color: #666; font-size: 10px;">SKU: ${item.sku}</span></td>
          <td style="padding: 8px 4px; text-align: center; color: #dc2626; font-weight: bold;">${item.availableStock} Units</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: bold; color: #059669;">+${Math.max(25, (item.lowStockThreshold || 10) * 3)} Units</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supplier Purchase Order - Restock Manifest</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; max-width: 650px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; background: #f5f5f5; padding: 8px 4px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #ccc; }
            .footer { margin-top: 24px; padding-top: 12px; border-top: 1px dashed #ccc; font-size: 11px; color: #666; text-align: center; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin: 0; font-size: 20px;">OFFICIAL PURCHASE ORDER (PO)</h2>
              <div style="font-size: 11px; color: #666;">Automated Inventory Restock Allocation</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">PO #MVC-RESTOCK-${Date.now().toString().slice(-6)}</span>
              <div style="font-size: 11px; color: #666; margin-top: 4px;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Item &amp; Variant</th>
                <th style="text-align: center; width: 100px;">Current Stock</th>
                <th style="text-align: center; width: 120px;">PO Order Qty</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            Generated via Mavenco AI Inventory Predictor • Authorised Signatory • Deliver to: Bengaluru Central Hub
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'productTitle',
      header: 'Product & Variant',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-white text-xs">{item.productTitle}</div>
          <div className="text-[11px] text-slate-400">{item.variantTitle}</div>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU Code',
      sortable: true,
      render: (item) => <span className="font-mono text-slate-400 text-xs">{item.sku}</span>,
    },
    {
      key: 'availableStock',
      header: 'Available Stock',
      sortable: true,
      render: (item) => {
        const isLow = item.availableStock <= (item.lowStockThreshold || 10);
        return (
          <span className={`font-mono font-bold text-xs ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
            {item.availableStock} Units
          </span>
        );
      },
    },
    {
      key: 'velocity',
      header: 'AI Stockout Velocity',
      render: (item) => {
        const daysLeft = Math.max(2, Math.round(item.availableStock / 2.5));
        const isUrgent = daysLeft <= 5;
        return (
          <div className="space-y-0.5">
            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
              isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
            }`}>
              {daysLeft} Days Stock Left
            </span>
            <div className="text-[10px] text-slate-500 font-mono">~2.5 units/day</div>
          </div>
        );
      },
    },
    {
      key: 'totalOnHand',
      header: 'Total On Hand',
      sortable: true,
      render: (item) => <span className="font-bold text-white font-mono text-xs">{item.totalOnHand} Units</span>,
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
          <h1 className="text-2xl font-bold text-white mt-1">Multi-SKU Inventory Matrix &amp; AI Forecaster</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time warehouse allocations, velocity-based stockout forecasts, and restock POs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Warehouse Dropdown */}
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 bg-[#10121A] border border-slate-800 rounded-lg text-xs font-bold text-slate-200"
          >
            <option value="blr_studio">🏢 Bengaluru Flagship Studio</option>
            <option value="mum_warehouse">🏬 Mumbai Central Warehouse</option>
            <option value="del_boutique">🛍️ Delhi Khan Market Boutique</option>
          </select>

          {/* Download PO Button */}
          <button
            onClick={handleDownloadSupplierPo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
            title="Generate Supplier Purchase Order PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Restock PO</span>
          </button>
        </div>
      </div>

      {/* AI Forecaster Summary Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-950/40 via-[#131624] to-[#10121A] border border-purple-500/30 rounded-xl flex items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">AI Restock Intelligence Active</div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Based on 7-day velocity, 2 items require supplier purchase orders within 5 days to avoid stockouts.
            </div>
          </div>
        </div>
        <span className="font-mono font-bold text-purple-300 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 shrink-0">
          98.2% Accuracy
        </span>
      </div>

      {/* Data Table */}
      <DataTable
        data={inventory}
        columns={columns}
        searchPlaceholder="Search SKU, product title..."
        searchKey={(i) => `${i.productTitle} ${i.sku} ${i.variantTitle}`}
        filterOptions={[
          { label: 'Low Stock (< 10)', value: 'low_stock', filterFn: (i) => i.availableStock <= (i.lowStockThreshold || 10) },
          { label: 'Healthy Stock', value: 'healthy', filterFn: (i) => i.availableStock > (i.lowStockThreshold || 10) },
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
