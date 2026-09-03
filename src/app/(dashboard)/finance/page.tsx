'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Building2,
  Calendar,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Receipt,
  Scale,
  Sparkles,
  PieChart,
  Layers,
  Banknote,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  FinancialLedgerEntry,
  FinancialAccount,
  SettlementRecord,
  PayoutRecord,
  FinancialPeriod,
  FinancialReportData,
} from '@/types/finance-commerce.types';

export default function FinanceStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'accounts' | 'settlements' | 'periods' | 'reports'>('overview');
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [report, setReport] = useState<FinancialReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const ledRes = await ApiClient.get<any>(`/api/v1/finance/ledger?tenant=${tenantSlug}`);
      if (ledRes.data) setLedgerEntries(ledRes.data);

      const accRes = await ApiClient.get<any>(`/api/v1/finance/accounts?tenant=${tenantSlug}`);
      if (accRes.data) setAccounts(accRes.data);

      const settRes = await ApiClient.get<any>(`/api/v1/finance/settlements?tenant=${tenantSlug}`);
      if (settRes.data) setSettlements(settRes.data);

      const poRes = await ApiClient.get<any>(`/api/v1/finance/payouts?tenant=${tenantSlug}`);
      if (poRes.data) setPayouts(poRes.data);

      const perRes = await ApiClient.get<any>(`/api/v1/finance/periods?tenant=${tenantSlug}`);
      if (perRes.data) setPeriods(perRes.data);

      const repRes = await ApiClient.get<any>(`/api/v1/finance/reports?tenant=${tenantSlug}`);
      if (repRes.data) setReport(repRes.data);
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              General Ledger &amp; Commerce Accounting
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Financial Ledger, Revenue &amp; Settlements
          </h1>
          <p className="text-xs text-slate-400">
            Immutable append-only journal entries, gateway fee deductions, bank payouts, and monthly fiscal period locks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            showToast('Exporting consolidated financial statements (CSV/Excel)...', 'info');
            setTimeout(() => {
              showToast('Export ready! Download completed.', 'success');
            }, 800);
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Financial Reports</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Sales Recognized</span>
          <span className="text-xl font-mono font-black text-white">$148,920.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Net Commerce Revenue</span>
          <span className="text-xl font-mono font-black text-emerald-400">$133,670.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gateway Fees (MDR)</span>
          <span className="text-xl font-mono font-black text-rose-400">$2,978.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Settlement Payouts</span>
          <span className="text-xl font-mono font-black text-indigo-400">$78,227.20</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Fiscal Period</span>
          <span className="text-xl font-mono font-black text-amber-400">Sep 2026 (Open)</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Financial Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>General Ledger ({ledgerEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Chart of Accounts ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settlements'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Settlements &amp; Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'periods'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Fiscal Periods ({periods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>P&amp;L Statements</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Revenue Recognition &amp; Profit Summary</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex justify-between text-slate-400">
                <span>Gross Product Sales:</span>
                <strong className="text-white">$148,920.00</strong>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>(-) Returns &amp; Refunds:</span>
                <strong>-$3,450.00</strong>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(-) Promotion Discounts:</span>
                <strong>-$11,800.00</strong>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                <span>(=) Net Sales:</span>
                <strong className="text-emerald-400">$133,670.00</strong>
              </div>
              <div className="flex justify-between text-indigo-400">
                <span>(+) Shipping Revenue Collected:</span>
                <strong>+$4,850.00</strong>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>(-) Gateway Processing Fees (MDR):</span>
                <strong>-$2,978.00</strong>
              </div>
              <div className="flex justify-between text-white font-bold text-sm border-t border-slate-800 pt-3">
                <span>Net Commerce Operating Profit:</span>
                <span className="text-emerald-400">$135,542.00 USD</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Tax &amp; Compliance Summary</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2.5">
              <div className="flex justify-between text-slate-400">
                <span>Output GST Collected (18%):</span>
                <strong className="text-indigo-400">$21,735.00</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST on Gateway Fees (Input Tax):</span>
                <strong className="text-emerald-400">$172.80</strong>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                <span>Net Tax Payable to Govt:</span>
                <strong className="text-white">$21,562.20</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Immutable General Financial Ledger</h3>
              <p className="text-xs text-slate-400">Append-only double-entry audit records preserving historical values.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Entry ID</th>
                  <th className="p-3.5">Account Code</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-center">Direction</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {ledgerEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{e.id}</td>
                    <td className="p-3.5 font-mono text-indigo-400 font-bold">{e.accountCode}</td>
                    <td className="p-3.5 text-white font-bold">{e.category}</td>
                    <td className="p-3.5 text-slate-300">{e.description}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        e.direction === 'credit'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {e.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ${(e.amountMinor / 100).toFixed(2)} {e.currency}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(e.occurredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CHART OF ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-indigo-400 font-bold text-sm">{a.code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  {a.category.toUpperCase()}
                </span>
              </div>

              <div>
                <strong className="text-white block font-bold text-sm">{a.name}</strong>
                <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center font-mono">
                <span className="text-xs text-slate-400">Balance:</span>
                <strong className="text-emerald-400 font-bold text-sm">${(a.balanceMinor / 100).toFixed(2)} {a.currency}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SETTLEMENTS & PAYOUTS */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Gateway Settlement Batches</h3>
                <p className="text-xs text-slate-400">Reconciled provider gross amounts, processing fees, and net payouts.</p>
              </div>
            </div>

            <div className="space-y-3">
              {settlements.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{s.settlementReference}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 font-mono">
                        {s.provider.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Gross: ${(s.grossAmountMinor / 100).toFixed(2)} • Fees: ${(s.feesMinor / 100).toFixed(2)} • Tax: ${(s.taxOnFeesMinor / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-emerald-400">${(s.netAmountMinor / 100).toFixed(2)} USD</div>
                    <span className="text-[11px] text-slate-500">Reconciled Batch ({s.transactionCount} txns)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Disbursed Bank Payouts</h3>
                <p className="text-xs text-slate-400">Funds transferred directly into commercial operating accounts.</p>
              </div>
            </div>

            <div className="space-y-3">
              {payouts.map((po) => (
                <div key={po.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{po.payoutReference}</strong>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        {po.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Destination: <strong>{po.destinationBank}</strong> (Ending in •••• {po.accountEnding})
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-white">${(po.amountMinor / 100).toFixed(2)} USD</div>
                    <span className="text-[10px] text-slate-500">Completed on {new Date(po.completedAt || po.initiatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FISCAL PERIODS */}
      {activeTab === 'periods' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periods.map((per) => (
            <div key={per.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{per.name}</strong>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                  per.status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {per.status === 'open' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{per.status.toUpperCase()}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div>Start Date: <strong className="text-slate-300">{new Date(per.startDate).toLocaleDateString()}</strong></div>
                <div>End Date: <strong className="text-slate-300">{new Date(per.endDate).toLocaleDateString()}</strong></div>
                {per.closedAt && (
                  <div className="text-rose-400 pt-1">Period Closed on: {new Date(per.closedAt).toLocaleDateString()} by {per.closedBy}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: P&L STATEMENTS */}
      {activeTab === 'reports' && report && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Profit &amp; Loss Statement ({report.period})</h3>
              <p className="text-xs text-slate-400">Consolidated financial overview for accounting and audit.</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Downloading PDF Statement...', 'info')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex justify-between text-slate-300">
              <span>Gross Sales:</span>
              <strong className="text-white">${(report.grossSalesMinor / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Less: Returns &amp; Allowances:</span>
              <strong>-${(report.returnsRefundsMinor / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Less: Discounts &amp; Coupons:</span>
              <strong>-${(report.discountsMinor / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-2">
              <span>Net Sales:</span>
              <strong>${(report.netSalesMinor / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-indigo-400">
              <span>Plus: Shipping Revenue:</span>
              <strong>+${(report.shippingRevenueMinor / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Less: Gateway Fees:</span>
              <strong>-${(report.gatewayFeesMinor / 100).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-white font-bold text-base border-t border-slate-800 pt-3">
              <span>Net Commerce Earnings:</span>
              <span className="text-emerald-400">${(report.netProfitMinor / 100).toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
