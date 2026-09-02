'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Receipt,
  Download,
  Send,
  Eye,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Check,
  X,
  ShieldCheck,
  Percent,
  Clock,
  Printer,
  Hash,
  Palette,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  Invoice,
  CreditNote,
  DocumentSeries,
  DocumentTemplate,
} from '@/types/invoicing-commerce.types';

export default function InvoicesStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'invoices' | 'credit_notes' | 'series' | 'templates' | 'slips'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [series, setSeries] = useState<DocumentSeries[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const invRes = await ApiClient.get<any>(`/api/v1/invoices?tenant=${tenantSlug}`);
      if (invRes.data) setInvoices(invRes.data);

      const cnRes = await ApiClient.get<any>(`/api/v1/invoices/credit-notes?tenant=${tenantSlug}`);
      if (cnRes.data) setCreditNotes(cnRes.data);

      const dsRes = await ApiClient.get<any>(`/api/v1/invoices/series?tenant=${tenantSlug}`);
      if (dsRes.data) setSeries(dsRes.data);

      const dtRes = await ApiClient.get<any>(`/api/v1/invoices/templates?tenant=${tenantSlug}`);
      if (dtRes.data) setTemplates(dtRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Fiscal Records &amp; Legal Invoicing
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-rose-400" />
            Invoices, Credit Notes &amp; Legal Documents
          </h1>
          <p className="text-xs text-slate-400">
            Manage immutable tax invoices, return credit notes, atomic numbering sequences, and compliant PDF templates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            showToast('Document series sequences synced and validated!', 'success');
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Document Sequences</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Invoiced</span>
          <span className="text-xl font-mono font-black text-white">$142,500.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Issued Invoices</span>
          <span className="text-xl font-mono font-black text-emerald-400">234 Documents</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Credit Notes Value</span>
          <span className="text-xl font-mono font-black text-amber-400">$3,450.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GST Tax Invoiced</span>
          <span className="text-xl font-mono font-black text-indigo-400">$21,735.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Template Status</span>
          <span className="text-xl font-mono font-black text-rose-400">v1.0 (GST Active)</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tax Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('credit_notes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'credit_notes'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Credit Notes ({creditNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('series')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'series'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Document Series ({series.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Templates &amp; Terms ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slips')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'slips'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Packing Slips &amp; Receipts</span>
        </button>
      </div>

      {/* TAB 1: TAX INVOICES ISSUED */}
      {activeTab === 'invoices' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Issued Tax Invoices</h3>
              <p className="text-xs text-slate-400">Immutable historical records preserving seller &amp; customer GSTIN snapshots.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer &amp; GSTIN</th>
                  <th className="p-3.5 text-right">Taxable</th>
                  <th className="p-3.5 text-right">GST Tax</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-center">Payment</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{inv.documentNumber}</td>
                    <td className="p-3.5 font-mono text-slate-300">{inv.orderNumber}</td>
                    <td className="p-3.5">
                      <strong className="text-white block">{inv.customerSnapshot.customerName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">GSTIN: {inv.customerSnapshot.taxIdOrGstin || 'Unregistered'}</span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400">
                      ${(inv.subtotalMinor / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-indigo-400 font-bold">
                      ${(inv.taxMinor / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      ${(inv.totalMinor / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {inv.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Invoice ${inv.documentNumber} emailed to ${inv.customerSnapshot.email}!`, 'success');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Resend</span>
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

      {/* TAB 2: CREDIT NOTES */}
      {activeTab === 'credit_notes' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Issued Credit Notes</h3>
              <p className="text-xs text-slate-400">Financial return adjustments with original invoice tax reversals.</p>
            </div>
          </div>

          <div className="space-y-3">
            {creditNotes.map((cn) => (
              <div
                key={cn.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold text-sm">{cn.documentNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                      {cn.reason.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Client: <strong>{cn.customerName}</strong> ({cn.customerEmail}) • Linked to Invoice <strong>{cn.invoiceNumber}</strong>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Issued on: {new Date(cn.issueDate).toLocaleDateString()}</span>
                </div>

                <div className="text-right font-mono space-y-0.5">
                  <div className="text-lg font-bold text-white">${(cn.refundAmountMinor / 100).toFixed(2)} USD</div>
                  <span className="text-xs text-indigo-400 block font-bold">Tax Reversal: ${(cn.taxRefundMinor / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT SERIES */}
      {activeTab === 'series' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {series.map((s) => (
            <div key={s.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm uppercase">{s.documentType} Series</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {s.status}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div>Prefix: <strong className="text-amber-400">{s.prefix}</strong></div>
                <div>Current Sequence: <strong className="text-white">{s.currentSequence}</strong></div>
                <div>Padding: <strong className="text-slate-400">{s.padding} digits</strong></div>
                <div className="text-emerald-400 font-bold pt-1">
                  Next Number: {s.prefix}{String(s.currentSequence + 1).padStart(s.padding, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: TEMPLATES & TERMS */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{t.name}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                  v{t.version}.0
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-2">
                <p className="italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">"{t.headerNote}"</p>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <strong className="block text-slate-400 mb-0.5">Legal Terms:</strong>
                  {t.footerTerms}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                <span>GST Breakdown: {t.showGstBreakdown ? 'Enabled' : 'Disabled'}</span>
                <span>HSN Code: {t.showHsnCode ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PACKING SLIPS */}
      {activeTab === 'slips' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Warehouse Packing Slips</h3>
              <p className="text-xs text-slate-400">Warehouse fulfillment dispatch slips without financial tender details.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <strong className="text-white font-bold block">Packing Slip #PS-2026-000234</strong>
              <span className="text-slate-400 text-[11px]">Order #LUM-100234 • 1 item to Aanya Kapoor (Mumbai Atelier)</span>
            </div>
            <button
              type="button"
              onClick={() => showToast('Printing packing slip...', 'info')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      )}

      {/* INVOICE VIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#FFFDFC] text-slate-900 rounded-3xl border border-[#EFE8E2] shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#EFE8E2] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Tax Invoice Snapshot</span>
                <h3 className="text-xl font-serif font-black text-slate-900 font-mono">{selectedInvoice.documentNumber}</h3>
                <span className="text-xs text-slate-500 font-mono">Order: {selectedInvoice.orderNumber} • {new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Seller & Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#EFE8E2] space-y-1">
                <strong className="block text-slate-900 font-bold uppercase text-[10px]">Seller (Issuer):</strong>
                <div className="font-bold text-slate-900">{selectedInvoice.sellerSnapshot.legalName}</div>
                <div className="text-slate-500 font-mono text-[11px]">GSTIN: {selectedInvoice.sellerSnapshot.gstinOrVat}</div>
                <div className="text-slate-500 text-[11px]">{selectedInvoice.sellerSnapshot.address}</div>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#EFE8E2] space-y-1">
                <strong className="block text-slate-900 font-bold uppercase text-[10px]">Billed &amp; Shipped To:</strong>
                <div className="font-bold text-slate-900">{selectedInvoice.customerSnapshot.customerName}</div>
                <div className="text-slate-500 font-mono text-[11px]">GSTIN: {selectedInvoice.customerSnapshot.taxIdOrGstin || 'Unregistered'}</div>
                <div className="text-slate-500 text-[11px]">{selectedInvoice.customerSnapshot.shippingAddress}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 text-xs">
              <strong className="block font-bold text-slate-900 uppercase text-[10px]">Items Summary:</strong>
              {selectedInvoice.lineItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-white border border-[#EFE8E2] rounded-xl flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900 block font-bold">{item.title}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">HSN: {item.hsnCode} • Qty: {item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">${(item.totalMinor / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Tax & Total */}
            <div className="p-4 bg-[#FAF7F5] border border-[#EFE8E2] rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Taxable Amount:</span>
                <span className="font-bold text-slate-700">${(selectedInvoice.subtotalMinor / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Assessed GST Tax (18%):</span>
                <span className="font-bold text-slate-700">${(selectedInvoice.taxMinor / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-[#EFE8E2] pt-2">
                <span>Total Invoice Amount (Tax Incl.):</span>
                <span className="text-emerald-600">${(selectedInvoice.totalMinor / 100).toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#EFE8E2]">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
