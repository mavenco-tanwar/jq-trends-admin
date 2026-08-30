'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Eye, Mail, Phone, MapPin, IndianRupee } from 'lucide-react';
import { CustomerService } from '@/services/customers';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CustomerService.getAll().then((list) => {
      setCustomers(list);
      setIsLoading(false);
    });
  }, []);

  const columns: Column<Customer>[] = [
    {
      key: 'firstName',
      header: 'Customer Name',
      sortable: true,
      render: (c) => {
        const initial = (c.firstName?.[0] || c.email?.[0] || 'C').toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-600/20 text-rose-300 font-bold flex items-center justify-center text-xs">
              {initial}
            </div>
            <div>
              <Link href={`/customers/${c.id}`} className="font-bold text-white hover:text-rose-400">
                {c.firstName || 'Valued'} {c.lastName || 'Customer'}
              </Link>
              <div className="text-[10px] text-slate-500">VIP Member</div>
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
          <div className="text-slate-300">{c.email || '—'}</div>
          <div className="text-[11px] text-slate-500">{c.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Orders',
      sortable: true,
      render: (c) => <span className="font-bold text-white">{c.ordersCount || 0} Placed</span>,
    },
    {
      key: 'totalSpent',
      header: 'Lifetime Spend (₹)',
      sortable: true,
      render: (c) => (
        <span className="font-mono font-bold text-rose-300">₹{(c.totalSpent || 0).toLocaleString('en-IN')}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Customer Directory
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Customer Accounts &amp; Lifetime Value</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Omni-channel customer intelligence, purchase histories, and delivery address books.
          </p>
        </div>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Search customers by name, email, phone..."
        searchKey={(c) => `${c.firstName || ''} ${c.lastName || ''} ${c.email || ''} ${c.phone || ''}`}
        filterOptions={[
          { label: 'Active', value: 'active', filterFn: (c) => c.status === 'active' },
          { label: 'VIP (Spent > ₹5,000)', value: 'vip', filterFn: (c) => (c.totalSpent || 0) > 5000 },
        ]}
      />
    </div>
  );
}
