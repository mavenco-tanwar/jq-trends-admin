'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Warehouse as WarehouseIcon,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Truck,
  FileText,
  Plus,
  Search,
  Download,
  Filter,
  Save,
  X,
  Sparkles,
  PackageCheck,
  Tag,
  ShieldCheck,
  Send,
  Eye,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  InventoryItem,
  Warehouse,
  StockMovementLedger,
  StockTransfer,
  StockReservation,
  FulfillmentRecord,
} from '@/types/inventory-commerce.types';

export default function InventoryPlatformPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<
    'inventory' | 'warehouses' | 'transfers' | 'reservations' | 'ledger' | 'fulfillment'
  >('inventory');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [movements, setMovements] = useState<StockMovementLedger[]>([]);
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');

  // Modals
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustReason, setAdjustReason] = useState('cycle_count');
  const [adjustNotes, setAdjustNotes] = useState('');

  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [newWh, setNewWh] = useState({
    code: 'HYD-04',
    name: 'Hyderabad Luxury Depot',
    address: 'Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500034',
    contactName: 'Ananya Reddy',
    contactEmail: 'hyd.hub@atelier.luxury',
    contactPhone: '+91 98490 11223',
    priority: 4,
  });

  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    sourceWarehouseId: 'blr_studio',
    destWarehouseId: 'mumbai_hub',
    sku: 'DRS-FLR-M',
    title: 'Blush Floral Tiered Midi Dress',
    qty: 15,
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [invRes, whRes, trRes, movRes, fulRes] = await Promise.all([
        ApiClient.get<any>(`/api/v1/inventory?tenant=${tenantSlug}`),
        ApiClient.get<any>(`/api/v1/inventory/warehouses?tenant=${tenantSlug}`),
        ApiClient.get<any>(`/api/v1/inventory/transfers?tenant=${tenantSlug}`),
        ApiClient.get<any>(`/api/v1/inventory/movements?tenant=${tenantSlug}`),
        ApiClient.get<any>(`/api/v1/inventory/fulfillments?tenant=${tenantSlug}`),
      ]);
      if (invRes.data) setInventory(invRes.data);
      if (whRes.data) setWarehouses(whRes.data);
      if (trRes.data) setTransfers(trRes.data);
      if (movRes.data) setMovements(movRes.data);
      if (fulRes.data) setFulfillments(fulRes.data);
    } catch (err) {
      console.warn('Using initial seed inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [tenantSlug]);

  // Adjust Stock Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    try {
      await ApiClient.post('/api/v1/inventory/adjust', {
        tenant: tenantSlug,
        variantId: adjustItem.variantId,
        sku: adjustItem.sku,
        warehouseId: adjustItem.warehouseId,
        changeAmount: parseInt(adjustQty, 10),
        reason: adjustReason,
        notes: adjustNotes,
        actor: 'Staff Admin',
      });

      showToast(`Stock updated for SKU ${adjustItem.sku}`, 'success');
      setAdjustItem(null);
      fetchAllData();
    } catch {
      showToast('Failed to adjust stock', 'error');
    }
  };

  // Add Warehouse Submit
  const handleAddWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/inventory/warehouses', {
        tenant: tenantSlug,
        warehouse: {
          ...newWh,
          id: `wh_${newWh.code.toLowerCase().replace('-', '_')}`,
          status: 'active',
          capabilities: ['storage', 'fulfillment'],
        },
      });
      showToast(`Warehouse ${newWh.name} created!`, 'success');
      setIsAddWarehouseOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to create warehouse', 'error');
    }
  };

  // Create Transfer Submit
  const handleCreateTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const srcWh = warehouses.find((w) => w.id === newTransfer.sourceWarehouseId);
      const dstWh = warehouses.find((w) => w.id === newTransfer.destWarehouseId);

      await ApiClient.post('/api/v1/inventory/transfers', {
        tenant: tenantSlug,
        transfer: {
          sourceWarehouseId: newTransfer.sourceWarehouseId,
          sourceWarehouseName: srcWh?.name || 'Warehouse A',
          destWarehouseId: newTransfer.destWarehouseId,
          destWarehouseName: dstWh?.name || 'Warehouse B',
          items: [
            {
              sku: newTransfer.sku,
              title: newTransfer.title,
              quantityRequested: Number(newTransfer.qty),
              quantityShipped: Number(newTransfer.qty),
              quantityReceived: 0,
            },
          ],
        },
      });
      showToast(`Transfer created from ${srcWh?.code} to ${dstWh?.code}`, 'success');
      setIsNewTransferOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to create transfer', 'error');
    }
  };

  // Advance Fulfillment Status
  const handleAdvanceFulfillment = async (id: string, nextStatus: string) => {
    try {
      await ApiClient.patch('/api/v1/inventory/fulfillments', {
        id,
        status: nextStatus,
      });
      showToast(`Fulfillment advanced to ${nextStatus.toUpperCase()}`, 'success');
      fetchAllData();
    } catch {
      showToast('Failed to update fulfillment', 'error');
    }
  };

  // Download Supplier PO Manifest
  const handleDownloadSupplierPo = () => {
    const lowStockItems = inventory.filter((i) => i.available <= (i.lowStockThreshold || 10));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = (lowStockItems.length > 0 ? lowStockItems : inventory.slice(0, 4))
      .map(
        (item, idx) => `
        <tr style="border-bottom: 1px solid #ddd; font-size: 12px;">
          <td style="padding: 8px 4px;">${idx + 1}</td>
          <td style="padding: 8px 4px;"><strong>${item.productTitle}</strong> (${item.variantTitle})<br/><span style="color: #666; font-size: 10px;">SKU: ${item.sku}</span></td>
          <td style="padding: 8px 4px; text-align: center; color: #dc2626; font-weight: bold;">${item.available} Units</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: bold; color: #059669;">+${Math.max(25, (item.lowStockThreshold || 10) * 3)} Units</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supplier Restock PO Manifest</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; max-width: 700px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; background: #f5f5f5; padding: 8px 4px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 900;">ATELIER LUXURY COUTURE</h1>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Warehouse Restock Manifest &amp; Reorder Sheet</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">PO-${Math.floor(10000 + Math.random() * 90000)}</span>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Details</th>
                <th style="text-align: center;">Current Stock</th>
                <th style="text-align: center;">Recommended Reorder</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  // Metrics Calculations
  const totalOnHand = inventory.reduce((sum, it) => sum + (it.onHand || 0), 0);
  const totalReserved = inventory.reduce((sum, it) => sum + (it.reserved || 0), 0);
  const totalAvailable = inventory.reduce((sum, it) => sum + (it.available || 0), 0);
  const lowStockCount = inventory.filter((it) => it.available <= it.lowStockThreshold && it.available > 0).length;
  const outOfStockCount = inventory.filter((it) => it.available === 0).length;

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse =
      selectedWarehouseId === 'all' || item.warehouseId === selectedWarehouseId;
    const matchesStatus =
      stockStatusFilter === 'all' || item.status === stockStatusFilter;
    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Enterprise Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-rose-400" />
            Inventory, Warehouses &amp; Fulfillment
          </h1>
          <p className="text-xs text-slate-400">
            Multi-warehouse stock allocations, immutable movement ledger, stock transfers, reservations, and pick/pack/ship workflows.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadSupplierPo}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Restock PO Manifest</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewTransferOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>New Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddWarehouseOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Warehouse</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total SKUs</span>
          <span className="text-xl font-mono font-black text-white">{inventory.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">On Hand Units</span>
          <span className="text-xl font-mono font-black text-white">{totalOnHand}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reserved Units</span>
          <span className="text-xl font-mono font-black text-amber-400">{totalReserved}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Units</span>
          <span className="text-xl font-mono font-black text-emerald-400">{totalAvailable}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Low Stock Alerts</span>
          <span className="text-xl font-mono font-black text-rose-400">{lowStockCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Out of Stock</span>
          <span className="text-xl font-mono font-black text-red-500">{outOfStockCount}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>All Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'warehouses'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <WarehouseIcon className="w-3.5 h-3.5" />
          <span>Warehouses ({warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Stock Transfers ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fulfillment')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'fulfillment'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Fulfillment Queue ({fulfillments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Movement Ledger ({movements.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL INVENTORY MATRIX */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Product Title or SKU..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Product &amp; Variant</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Warehouse</th>
                  <th className="p-3.5 text-center">On Hand</th>
                  <th className="p-3.5 text-center">Reserved</th>
                  <th className="p-3.5 text-center">Available</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`inv-skel-${i}`} className="animate-pulse">
                      <td className="p-3.5"><div className="h-4 w-40 bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-12 mx-auto bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-12 mx-auto bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-12 mx-auto bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-16 mx-auto bg-slate-800 rounded" /></td>
                      <td className="p-3.5"><div className="h-4 w-16 ml-auto bg-slate-800 rounded" /></td>
                    </tr>
                  ))
                ) : filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <strong className="block font-bold text-white text-xs">{item.productTitle}</strong>
                      <span className="text-[11px] text-slate-400">{item.variantTitle}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-300">{item.sku}</td>
                    <td className="p-3.5 text-slate-400">{item.warehouseName}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-200">{item.onHand}</td>
                    <td className="p-3.5 text-center font-mono text-amber-400 font-bold">{item.reserved}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-emerald-400 text-sm">{item.available}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          item.status === 'in_stock'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.status === 'low_stock'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setAdjustItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition-colors cursor-pointer border border-slate-700"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WAREHOUSES DIRECTORY */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {wh.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {wh.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{wh.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{wh.description}</p>
                <div className="text-xs text-slate-300 pt-2 space-y-1">
                  <p>📍 {wh.address}, {wh.city}, {wh.state} - {wh.postalCode}</p>
                  <p>👤 Contact: <strong>{wh.contactName}</strong> ({wh.contactPhone})</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex gap-1 flex-wrap">
                  {wh.capabilities?.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] uppercase font-mono">
                      {c}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-slate-500 text-[11px]">Priority #{wh.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: STOCK TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Inter-Warehouse Stock Transfers</h3>
              <p className="text-xs text-slate-400">Rebalance and move garments between regional fulfillment centers.</p>
            </div>
            <button
              onClick={() => setIsNewTransferOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Transfer</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Transfer #</th>
                  <th className="p-3.5">Source Warehouse</th>
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Garments</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">{tr.transferNumber}</td>
                    <td className="p-3.5 text-slate-300">{tr.sourceWarehouseName}</td>
                    <td className="p-3.5 text-slate-300">{tr.destWarehouseName}</td>
                    <td className="p-3.5">
                      {tr.items?.map((it, idx) => (
                        <div key={idx} className="text-slate-300">
                          <strong>{it.title}</strong> ({it.sku}) • <span className="text-amber-400 font-mono font-bold">{it.quantityShipped} units</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {tr.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {tr.status === 'in_transit' ? (
                        <button
                          type="button"
                          onClick={() => showToast(`Transfer ${tr.transferNumber} received at destination!`, 'success')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Receive Transfer
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FULFILLMENT QUEUE */}
      {activeTab === 'fulfillment' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Order Fulfillment &amp; Packing Pipeline</h3>
              <p className="text-xs text-slate-400">Manage Pick &rarr; Pack &rarr; Ship with carrier tracking numbers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fulfillments.map((ful) => (
              <div
                key={ful.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{ful.orderNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {ful.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Customer: <strong className="text-white">{ful.customerName}</strong> • Warehouse: {ful.warehouseName}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                    {ful.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>{it.title} ({it.sku})</span>
                        <span className="font-mono font-bold text-white">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {ful.carrier && (
                    <div className="text-xs text-slate-400 font-mono">
                      Carrier: <strong className="text-white">{ful.carrier}</strong>
                      <br />
                      Tracking: <strong className="text-emerald-400">{ful.trackingNumber}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Pipeline Stage</span>
                  <div className="flex gap-2">
                    {ful.status === 'picking' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceFulfillment(ful.id, 'packing')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                      >
                        Mark Picked &amp; Start Packing
                      </button>
                    )}
                    {ful.status === 'packing' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceFulfillment(ful.id, 'shipped')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Pack &amp; Dispatch Shipment
                      </button>
                    )}
                    {ful.status === 'shipped' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceFulfillment(ful.id, 'delivered')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STOCK MOVEMENT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Stock Movement Audit Ledger</h3>
              <p className="text-xs text-slate-400">Tamper-evident chronological record of all stock additions, deductions, commitments, and adjustments.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Warehouse</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 text-center">Change Qty</th>
                  <th className="p-3.5 text-center">New Balance</th>
                  <th className="p-3.5">Reason &amp; Reference</th>
                  <th className="p-3.5">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">{m.sku}</td>
                    <td className="p-3.5 text-slate-300">{m.warehouseName || m.warehouseId}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-800 text-slate-200 border border-slate-700">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      <span className={m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-white">{m.newQuantity}</td>
                    <td className="p-3.5 text-slate-300 text-xs">
                      {m.reason}
                      {m.referenceId && (
                        <span className="block font-mono text-[10px] text-slate-500">Ref: {m.referenceId}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 font-medium">{m.actorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Adjust Stock for {adjustItem.sku}</h3>
                <p className="text-xs text-slate-400">{adjustItem.productTitle} ({adjustItem.variantTitle})</p>
              </div>
              <button onClick={() => setAdjustItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span>Current Available Stock:</span>
                <strong className="font-mono text-emerald-400">{adjustItem.available} Units</strong>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Adjustment Quantity (+ to add, - to deduct)
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="cycle_count">Cycle Count / Audit Correction</option>
                  <option value="restock">New Stock Inward Arrival</option>
                  <option value="damaged">Damaged / Flawed Garment Discard</option>
                  <option value="found">Found / Discovered Unrecorded Stock</option>
                  <option value="return_restock">Customer Return Restock</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Internal Notes</label>
                <textarea
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional audit notes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm &amp; Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW WAREHOUSE MODAL */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Add New Warehouse / Depot</h3>
                <p className="text-xs text-slate-400">Register a new fulfillment center for {activeTenant.name}.</p>
              </div>
              <button onClick={() => setIsAddWarehouseOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWarehouseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Warehouse Code</label>
                  <input
                    type="text"
                    value={newWh.code}
                    onChange={(e) => setNewWh({ ...newWh, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Facility Name</label>
                  <input
                    type="text"
                    value={newWh.name}
                    onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={newWh.address}
                  onChange={(e) => setNewWh({ ...newWh, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    value={newWh.city}
                    onChange={(e) => setNewWh({ ...newWh, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">State</label>
                  <input
                    type="text"
                    value={newWh.state}
                    onChange={(e) => setNewWh({ ...newWh, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={newWh.postalCode}
                    onChange={(e) => setNewWh({ ...newWh, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TRANSFER MODAL */}
      {isNewTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create Stock Transfer</h3>
                <p className="text-xs text-slate-400">Initiate inter-warehouse inventory movement.</p>
              </div>
              <button onClick={() => setIsNewTransferOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransferSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Source Warehouse</label>
                  <select
                    value={newTransfer.sourceWarehouseId}
                    onChange={(e) => setNewTransfer({ ...newTransfer, sourceWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Destination Facility</label>
                  <select
                    value={newTransfer.destWarehouseId}
                    onChange={(e) => setNewTransfer({ ...newTransfer, destWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Garment SKU to Transfer</label>
                <select
                  value={newTransfer.sku}
                  onChange={(e) => {
                    const sel = inventory.find((i) => i.sku === e.target.value);
                    setNewTransfer({
                      ...newTransfer,
                      sku: e.target.value,
                      title: sel?.productTitle || 'Garment',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                >
                  {inventory.map((it) => (
                    <option key={it.id} value={it.sku}>
                      {it.sku} — {it.productTitle} ({it.variantTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Quantity to Transfer</label>
                <input
                  type="number"
                  min={1}
                  value={newTransfer.qty}
                  onChange={(e) => setNewTransfer({ ...newTransfer, qty: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTransferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
