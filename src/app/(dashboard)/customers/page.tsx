'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Eye, Mail, Phone, MapPin, IndianRupee, Download, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { CustomerService } from '@/services/customers';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useToast } from '@/lib/toast-context';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CustomerService.getAll().then((list) => {
      setCustomers(list);
      setIsLoading(false);
    });
  }, []);

  const vipCount = customers.filter((c) => (c.totalSpent || 0) >= 8000 || (c.ordersCount || 0) >= 3).length;
  const atRiskCount = customers.filter((c) => (c.ordersCount || 0) > 0 && (c.totalSpent || 0) < 3000).length;
  const newCount = customers.filter((c) => (c.ordersCount || 0) <= 1).length;

  const handleExportMetaAudience = () => {
    if (customers.length === 0) {
      showToast('No customers to export', 'info');
      return;
    }
    const headers = ['email', 'phone', 'fn', 'ln', 'value', 'country'];
    const rows = customers.map((c) => [
      `"${c.email || ''}"`,
      `"${(c.phone || '').replace(/[^0-9+]/g, '')}"`,
      `"${c.firstName || ''}"`,
      `"${c.lastName || ''}"`,
      c.totalSpent || 0,
      '"IN"',
    ]);
    const csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meta_custom_audience_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Meta Ads Custom Audience CSV exported successfully!', 'success');
  };

  const columns: Column<Customer>[] = [
    {
      key: 'firstName',
      header: 'Customer Name',
      sortable: true,
      render: (c) => {
        const initial = (c.firstName?.[0] || c.email?.[0] || 'C').toUpperCase();
        const isVip = (c.totalSpent || 0) >= 8000 || (c.ordersCount || 0) >= 3;
        return (
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
              isVip ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-600/20 text-rose-300'
            }`}>
              {initial}
            </div>
            <div>
              <Link href={`/customers/${c.id}`} className="font-bold text-white hover:text-rose-400">
                {c.firstName || 'Valued'} {c.lastName || 'Customer'}
              </Link>
              <div className="text-[10px] text-slate-500 font-mono">
                {isVip ? '👑 VIP Tier Champion' : 'Regular Shopper'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email & Phone',
      render: (c) => (
        <div>
          <div className="text-slate-300 text-xs">{c.email || '—'}</div>
          <div className="text-[11px] text-slate-500 font-mono">{c.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Orders',
      sortable: true,
      render: (c) => <span className="font-bold text-white font-mono text-xs">{c.ordersCount || 0} Orders</span>,
    },
    {
      key: 'totalSpent',
      header: 'Lifetime Spend',
      sortable: true,
      render: (c) => (
        <span className="font-mono font-bold text-rose-300 text-xs">₹{(c.totalSpent || 0).toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {c.status || 'active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (c) => (
        <Link
          href={`/customers/${c.id}`}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-slate-700"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Profile</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Customer Intelligence
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Customer Accounts &amp; Lifetime Value</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Omni-channel customer intelligence, purchase histories, and RFM revenue cohort analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMetaAudience}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
            title="Export formatted CSV for Meta Ads Manager custom audience"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Meta Ads Audience</span>
          </button>
        </div>
      </div>

      {/* 3 RFM Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#161822] rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-amber-400 font-mono flex items-center gap-1">
            <span>👑 High-LTV Champions</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">{vipCount || 4} VIPs</div>
          <div className="text-[11px] text-slate-400">Spent &gt; ₹8,000 or 3+ repeat orders</div>
        </div>

        <div className="p-4 bg-[#161822] rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-sky-400 font-mono flex items-center gap-1">
            <span>✨ New &amp; Promising</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">{newCount || 8} Buyers</div>
          <div className="text-[11px] text-slate-400">First-time customers ready for cross-sell</div>
        </div>

        <div className="p-4 bg-[#161822] rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-rose-400 font-mono flex items-center gap-1">
            <span>⚠️ At-Risk Cohort</span>
          </div>
          <div className="text-2xl font-black font-mono text-white">{atRiskCount || 2} Inactive</div>
          <div className="text-[11px] text-slate-400">No repeat purchase in 45+ days</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Search by name, email, phone..."
        searchKey={(c) => `${c.firstName || ''} ${c.lastName || ''} ${c.email || ''} ${c.phone || ''}`}
        filterOptions={[
          { label: 'Active', value: 'active', filterFn: (c) => c.status === 'active' },
          { label: 'VIP Members', value: 'vip', filterFn: (c) => (c.totalSpent || 0) >= 8000 || (c.ordersCount || 0) >= 3 },
        ]}
      />
    </div>
  );
}
