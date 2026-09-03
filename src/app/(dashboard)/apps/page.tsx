'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Star,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { AppMarketplaceListing } from '@/types/developer-platform.types';

export default function AppMarketplacePage() {
  const { showToast } = useToast();
  const [apps, setApps] = useState<AppMarketplaceListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.get<AppMarketplaceListing[]>('/api/v1/developers/apps');
      if (res.data) setApps(res.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleToggleInstall = async (id: string, isInstalled: boolean) => {
    try {
      await ApiClient.post<any>('/api/v1/developers/apps', {
        id,
        action: isInstalled ? 'uninstall' : 'install',
      });
      showToast(`App ${isInstalled ? 'uninstalled' : 'installed & activated'}!`, 'success');
      await fetchApps();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesCat = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0C0F17] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              SaaS App Marketplace
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              Verified Integrations
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">App Marketplace &amp; Ecosystem</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Supercharge your store with certified shipping, accounting, marketing, and AI automation integrations.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* 2. CATEGORY PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {['all', 'shipping', 'marketing', 'accounting', 'ai_tools', 'crm'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* 3. APPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                  {app.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-amber-300 font-mono text-[11px] font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{app.rating}</span>
                  <span className="text-slate-500">({app.reviewCount})</span>
                </div>
              </div>

              <div>
                <strong className="text-white text-base block font-bold">{app.name}</strong>
                <span className="text-xs text-slate-500">Developed by {app.developerName}</span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{app.description}</p>

              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Required Permissions</span>
                <div className="flex flex-wrap gap-1">
                  {app.requiredScopes.map((sc) => (
                    <span key={sc} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[9px] border border-slate-800">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Pricing</span>
                <span className="font-mono font-bold text-white text-sm">
                  {app.monthlyPriceMinor === 0 ? 'Free' : `$${(app.monthlyPriceMinor / 100).toFixed(2)}/mo`}
                </span>
              </div>

              <button
                onClick={() => handleToggleInstall(app.id, app.isInstalled)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  app.isInstalled
                    ? 'bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                }`}
              >
                {app.isInstalled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Installed</span>
                  </>
                ) : (
                  <>
                    <span>Install App</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
