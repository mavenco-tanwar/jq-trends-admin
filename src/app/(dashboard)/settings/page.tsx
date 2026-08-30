'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, Store, Mail, Phone, MapPin, IndianRupee } from 'lucide-react';
import { SettingsService } from '@/services/settings';
import { useToast } from '@/lib/toast-context';
import type { StoreSettings } from '@/types';

export default function GeneralSettingsPage() {
  const { showToast } = useToast();
  const [storeName, setStoreName] = useState('JQ Trends');
  const [tagline, setTagline] = useState('Affordable Luxury Fashion for Women and Kids');
  const [contactEmail, setContactEmail] = useState('contact@jqtrends.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    SettingsService.getStoreSettings().then((s) => {
      setStoreName(s.storeName);
      setTagline(s.tagline);
      setContactEmail(s.contactEmail);
      setPhone(s.phone);
      setAddress(s.address);
      setCurrency(s.currency);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await SettingsService.updateStoreSettings({
      storeName,
      tagline,
      contactEmail,
      phone,
      address,
      currency,
    });
    showToast('Store settings saved', 'success');
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Store Profile
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">General Store Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your boutique identity, contact details, and base currency.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-rose-400" />
            <span>Storefront Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Store Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Customer Support Hotline</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>HQ Physical Dispatch Studio</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Studio Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
