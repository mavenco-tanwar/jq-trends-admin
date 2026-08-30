'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, ShoppingBag, IndianRupee, Clock, Mail, Phone } from 'lucide-react';
import { CustomerService } from '@/services/customers';
import type { Customer } from '@/types';

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    CustomerService.getById(id).then((c) => {
      if (c) setCustomer(c);
    });
  }, [id]);

  if (!customer) {
    return <div className="p-8 text-center text-slate-400">Loading customer profile...</div>;
  }

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex items-center gap-3 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <Link
          href="/customers"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Customer Profile
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 font-semibold">Total Orders</span>
          <div className="text-2xl font-bold text-white font-mono">{customer.ordersCount}</div>
        </div>
        <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 font-semibold">Lifetime Spend</span>
          <div className="text-2xl font-bold text-rose-300 font-mono">₹{customer.totalSpent.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-slate-400 font-semibold">Account Status</span>
          <div className="text-emerald-400 font-bold uppercase text-sm mt-1">{customer.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-rose-400" />
            <span>Contact Information</span>
          </h3>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{customer.phone}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161822] p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>Saved Addresses</span>
          </h3>
          <div className="space-y-2">
            {customer.addresses?.map((addr) => (
              <div key={addr.id} className="p-3 bg-[#10121A] rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-sans">
                <span className="font-bold text-white uppercase text-[10px] block mb-1">
                  {addr.type} {addr.isDefault && '(Default)'}
                </span>
                {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
