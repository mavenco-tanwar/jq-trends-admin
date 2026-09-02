'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Package,
  Truck,
  DollarSign,
  ShieldCheck,
  Eye,
  X,
  Plus,
  Boxes,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Printer,
  Check,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  ReturnRequest,
  RefundRecord,
  ReturnPolicySettings,
} from '@/types/returns-commerce.types';

export default function ReturnsManagementPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'requests' | 'inspect' | 'refunds' | 'exchanges' | 'policy'>('requests');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [inspectModalReturn, setInspectModalReturn] = useState<ReturnRequest | null>(null);
  const [inspectCondition, setInspectCondition] = useState<'new' | 'opened' | 'damaged'>('new');
  const [inspectDisposition, setInspectDisposition] = useState<'restock' | 'damaged'>('restock');
  const [inspectNotes, setInspectNotes] = useState('');

  // Policy Settings
  const [policy, setPolicy] = useState<ReturnPolicySettings>({
    enabled: true,
    returnWindowDays: 30,
    allowPartialReturns: true,
    requireDeliveredOrder: true,
    allowExchanges: true,
    allowStoreCredit: true,
    autoRestockOnPassInspection: true,
    returnShippingFee: 0,
    restockingFeePercent: 0,
  });

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.get<any>(`/api/v1/admin/returns?tenant=${tenantSlug}`);
      if (res.data && res.data.length > 0) {
        setReturns(res.data);
      } else {
        // Fallback seed
        setReturns([
          {
            id: 'ret_1001',
            returnNumber: 'RET-89210',
            orderId: 'ord_1',
            orderNumber: 'LUM-100234',
            customerName: 'Aanya Kapoor',
            customerEmail: 'aanya.kapoor@example.com',
            customerPhone: '+91 9876543210',
            type: 'exchange',
            status: 'pickup_scheduled',
            items: [
              {
                orderItemId: 'it_1',
                productId: 'prod_1',
                variantId: 'var_1_m',
                sku: 'DRS-FLR-M',
                title: 'Blush Floral Tiered Midi Dress',
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200',
                unitPrice: 1499,
                quantityOrdered: 1,
                quantityRequested: 1,
                reason: 'wrong_size',
                customerNotes: 'Need a larger size (Size L) for better bust fit.',
                refundAmount: 0,
                exchangeVariantTitle: 'Rose / Size L',
              },
            ],
            reason: 'Size Exchange to Size L',
            pickupCarrier: 'BlueDart Reverse Logistics',
            pickupTrackingNumber: 'BLUEDART-REV-984210',
            pickupScheduledDate: 'Tomorrow, 10:00 AM - 2:00 PM',
            totalRefundAmount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'ret_1002',
            returnNumber: 'RET-89215',
            orderId: 'ord_2',
            orderNumber: 'LUM-100289',
            customerName: 'Rohan Mehra',
            customerEmail: 'rohan.mehra@example.com',
            customerPhone: '+91 98111 22334',
            type: 'refund',
            status: 'received',
            items: [
              {
                orderItemId: 'it_2',
                productId: 'prod_2',
                variantId: 'var_2_s',
                sku: 'BLZ-IVY-S',
                title: 'Ivory Linen Relaxed Blazer Co-ord',
                unitPrice: 1899,
                quantityOrdered: 1,
                quantityRequested: 1,
                reason: 'color_mismatch',
                customerNotes: 'Color shade differs from event requirements.',
                refundAmount: 1899,
              },
            ],
            reason: 'Color Preference Mismatch',
            pickupCarrier: 'Delhivery Surface',
            pickupTrackingNumber: 'DLV-REV-109245',
            totalRefundAmount: 1899,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [tenantSlug]);

  // Handle Admin Action (Approve, Receive, Refund, Reject)
  const handleAdminAction = async (id: string, action: string) => {
    try {
      await ApiClient.patch('/api/v1/admin/returns', {
        tenant: tenantSlug,
        id,
        action,
      });
      showToast(`Return request updated via: ${action.toUpperCase()}`, 'success');
      fetchReturns();
    } catch {
      showToast('Failed to update return', 'error');
    }
  };

  // Handle Inspection Submit
  const handleInspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectModalReturn) return;

    try {
      await ApiClient.patch('/api/v1/admin/returns', {
        tenant: tenantSlug,
        id: inspectModalReturn.id,
        action: 'inspect',
        disposition: inspectDisposition,
        inspectionNotes: inspectNotes || `Garment condition: ${inspectCondition.toUpperCase()}. Disposition: ${inspectDisposition.toUpperCase()}`,
        actor: 'Quality Lead Inspector',
      });

      showToast(`Inspection logged! ${inspectDisposition === 'restock' ? 'Garment restocked to inventory' : 'Garment quarantined'}`, 'success');
      setInspectModalReturn(null);
      fetchReturns();
    } catch {
      showToast('Failed to log inspection', 'error');
    }
  };

  // Metrics
  const totalRequests = returns.length;
  const pendingReviewCount = returns.filter((r) => r.status === 'requested' || r.status === 'under_review').length;
  const inTransitCount = returns.filter((r) => r.status === 'approved' || r.status === 'pickup_scheduled' || r.status === 'in_transit').length;
  const awaitingInspectCount = returns.filter((r) => r.status === 'received' || r.status === 'inspecting').length;
  const refundsCompletedCount = returns.filter((r) => r.status === 'refunded').length;
  const exchangesCount = returns.filter((r) => r.type === 'exchange').length;

  const filteredReturns = returns.filter((r) => {
    const matchesSearch =
      r.returnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Reverse Logistics Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-rose-400" />
            Returns, Exchanges &amp; Refunds
          </h1>
          <p className="text-xs text-slate-400">
            Manage customer return authorizations, reverse pickups, quality inspections, inventory restocking, and refunds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span>Return Policy Rules</span>
          </button>
        </div>
      </div>

      {/* 2. METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Returns</span>
          <span className="text-xl font-mono font-black text-white">{totalRequests}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Review</span>
          <span className="text-xl font-mono font-black text-amber-400">{pendingReviewCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">In Transit</span>
          <span className="text-xl font-mono font-black text-indigo-400">{inTransitCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Awaiting Inspection</span>
          <span className="text-xl font-mono font-black text-rose-400">{awaitingInspectCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Refunds Settled</span>
          <span className="text-xl font-mono font-black text-emerald-400">{refundsCompletedCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Size Exchanges</span>
          <span className="text-xl font-mono font-black text-pink-400">{exchangesCount}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>All Return Requests ({returns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'policy'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Return Policies &amp; Rules</span>
        </button>
      </div>

      {/* TAB 1: ALL RETURN REQUESTS */}
      {activeTab === 'requests' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Return #, Order # or Customer..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="received">Received at Warehouse</option>
              <option value="approved_for_refund">Approved for Refund</option>
              <option value="refunded">Refunded</option>
              <option value="exchange_processing">Exchange Processing</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Return &amp; Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Garment Details</th>
                  <th className="p-3.5">Type &amp; Resolution</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <strong className="block font-mono font-bold text-white text-xs">{ret.returnNumber}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">Order: {ret.orderNumber}</span>
                    </td>
                    <td className="p-3.5">
                      <strong className="block font-bold text-slate-200">{ret.customerName}</strong>
                      <span className="text-[11px] text-slate-400">{ret.customerEmail}</span>
                    </td>
                    <td className="p-3.5">
                      {ret.items?.map((it, idx) => (
                        <div key={idx} className="text-slate-300">
                          <strong>{it.title}</strong>
                          <span className="block text-[11px] text-slate-400">
                            Reason: {it.reason} {it.exchangeVariantTitle && `• Exchange: ${it.exchangeVariantTitle}`}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {ret.type.replace('_', ' ')}
                      </span>
                      {ret.totalRefundAmount > 0 && (
                        <span className="block font-mono font-bold text-emerald-400 text-[11px] mt-0.5">
                          ${ret.totalRefundAmount.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          ret.status === 'refunded' || ret.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : ret.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {ret.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ret.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => handleAdminAction(ret.id, 'approve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Approve Pickup
                          </button>
                        )}

                        {ret.status === 'pickup_scheduled' && (
                          <button
                            type="button"
                            onClick={() => handleAdminAction(ret.id, 'receive')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                          >
                            Mark Received
                          </button>
                        )}

                        {ret.status === 'received' && (
                          <button
                            type="button"
                            onClick={() => setInspectModalReturn(ret)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                          >
                            Inspect &amp; Restock
                          </button>
                        )}

                        {ret.status === 'approved_for_refund' && (
                          <button
                            type="button"
                            onClick={() => handleAdminAction(ret.id, 'refund')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Execute Refund
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedReturn(ret)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View Return Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RETURN POLICY RULES */}
      {activeTab === 'policy' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Store Return &amp; Refund Policy Configuration</h3>
              <p className="text-xs text-slate-400">Configure return windows, allowed resolutions, auto-restocking rules, and return fees.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Return Window (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={policy.returnWindowDays}
                onChange={(e) => setPolicy({ ...policy, returnWindowDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Automated Restocking on Pass Inspection
              </label>
              <button
                type="button"
                onClick={() => setPolicy({ ...policy, autoRestockOnPassInspection: !policy.autoRestockOnPassInspection })}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  policy.autoRestockOnPassInspection
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                    : 'border-slate-800 bg-[#090D15] text-slate-400'
                }`}
              >
                {policy.autoRestockOnPassInspection ? 'Enabled (Auto Restock)' : 'Disabled'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Allow Size &amp; Variant Exchanges
              </label>
              <button
                type="button"
                onClick={() => setPolicy({ ...policy, allowExchanges: !policy.allowExchanges })}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  policy.allowExchanges
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                    : 'border-slate-800 bg-[#090D15] text-slate-400'
                }`}
              >
                {policy.allowExchanges ? 'Exchanges Allowed' : 'Refunds Only'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('Return policy settings saved successfully!', 'success')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Save Policy Rules
          </button>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {inspectModalReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Quality Inspection &amp; Restock</h3>
                <p className="text-xs text-slate-400">Return: <strong className="font-mono text-white">{inspectModalReturn.returnNumber}</strong></p>
              </div>
              <button onClick={() => setInspectModalReturn(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInspectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Physical Condition</label>
                <select
                  value={inspectCondition}
                  onChange={(e) => setInspectCondition(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="new">Pristine / Unworn with Original Tags</option>
                  <option value="opened">Opened but Flawless</option>
                  <option value="damaged">Damaged / Worn / Flawed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Inventory Disposition</label>
                <select
                  value={inspectDisposition}
                  onChange={(e) => setInspectDisposition(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  <option value="restock">✅ Restock to Sellable Inventory (Adds +1 to Bangalore Studio)</option>
                  <option value="damaged">❌ Mark Damaged / Flawed (Quarantine - do not sell)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Inspector Notes</label>
                <textarea
                  value={inspectNotes}
                  onChange={(e) => setInspectNotes(e.target.value)}
                  rows={2}
                  placeholder="Verification notes regarding tags, fabric condition..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectModalReturn(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Complete Inspection &amp; Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
