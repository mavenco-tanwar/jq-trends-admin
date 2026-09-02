'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Globe,
  Sliders,
  Radio,
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
  Send,
  Building,
  Calculator,
  Play,
  FileSpreadsheet,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  TaxZone,
  TaxCategory,
  TaxRule,
  TaxRegistration,
  TaxCalculationResult,
} from '@/types/tax-commerce.types';

export default function TaxEnginePage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'zones' | 'categories' | 'rules' | 'registrations' | 'simulator'>('dashboard');
  const [zones, setZones] = useState<TaxZone[]>([]);
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [registrations, setRegistrations] = useState<TaxRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulator State
  const [simCountry, setSimCountry] = useState('IN');
  const [simRegion, setSimRegion] = useState('Maharashtra');
  const [simOriginRegion, setSimOriginRegion] = useState('Maharashtra');
  const [simSubtotal, setSimSubtotal] = useState(1000);
  const [simDiscount, setSimDiscount] = useState(100);
  const [simShipping, setSimShipping] = useState(15);
  const [simTaxRate, setSimTaxRate] = useState(18);
  const [simIsInclusive, setSimIsInclusive] = useState(true);
  const [simResult, setSimResult] = useState<TaxCalculationResult | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const zoneRes = await ApiClient.get<any>(`/api/v1/tax/zones?tenant=${tenantSlug}`);
      if (zoneRes.data) setZones(zoneRes.data);

      const catRes = await ApiClient.get<any>(`/api/v1/tax/categories?tenant=${tenantSlug}`);
      if (catRes.data) setCategories(catRes.data);

      const ruleRes = await ApiClient.get<any>(`/api/v1/tax/rules?tenant=${tenantSlug}`);
      if (ruleRes.data) setRules(ruleRes.data);

      const regRes = await ApiClient.get<any>(`/api/v1/tax/registrations?tenant=${tenantSlug}`);
      if (regRes.data) setRegistrations(regRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleRunSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post<any>('/api/v1/tax/calculate', {
        tenantId: tenantSlug,
        country: simCountry,
        region: simRegion,
        originRegion: simOriginRegion,
        subtotalMinor: Math.round(Number(simSubtotal) * 100),
        discountMinor: Math.round(Number(simDiscount) * 100),
        shippingMinor: Math.round(Number(simShipping) * 100),
        taxCategoryRate: Number(simTaxRate),
        isInclusive: simIsInclusive,
      });

      if (res.data) {
        setSimResult(res.data);
        showToast('Tax simulation calculated with exact GST/VAT breakdown!', 'success');
      }
    } catch {
      showToast('Simulation failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Fiscal Compliance &amp; Multi-Jurisdiction Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-rose-400" />
            Tax Engine &amp; GST/VAT Compliance Studio
          </h1>
          <p className="text-xs text-slate-400">
            Configure multi-component GST (CGST, SGST, IGST), international VAT, tax-inclusive reverse pricing, and merchant registrations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Launch Tax Simulator</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tax Collected</span>
          <span className="text-xl font-mono font-black text-white">$24,680.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Taxable Sales</span>
          <span className="text-xl font-mono font-black text-emerald-400">$137,110.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Tax Zones</span>
          <span className="text-xl font-mono font-black text-amber-400">{zones.length} Zones</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active GST Rules</span>
          <span className="text-xl font-mono font-black text-indigo-400">{rules.length} Rules</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Effective Avg Rate</span>
          <span className="text-xl font-mono font-black text-rose-400">18.0%</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tax Jurisdictions</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'zones'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Tax Zones ({zones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Categories &amp; HSN ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Tax Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'registrations'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>GSTIN &amp; VAT IDs ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Tax Simulator</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD / JURISDICTIONS */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">GST Component Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">CGST (Central GST - 9%)</strong>
                  <span className="text-slate-400 text-[10px]">Intra-state Maharashtra transactions</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">$6,840.00</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">SGST (State GST - 9%)</strong>
                  <span className="text-slate-400 text-[10px]">Intra-state Maharashtra transactions</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">$6,840.00</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">IGST (Integrated GST - 18%)</strong>
                  <span className="text-slate-400 text-[10px]">Inter-state pan-India fulfillment</span>
                </div>
                <span className="font-mono font-bold text-indigo-400">$11,000.00</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fiscal Compliance &amp; Reverse Calculation</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Pricing Mode</strong>
                  <span className="text-slate-400 text-[10px]">Tax-Inclusive (MRP includes 18% GST)</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                  Inclusive
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Shipping Tax Status</strong>
                  <span className="text-slate-400 text-[10px]">18% GST assessed on express courier freight</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                  Taxable
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAX ZONES */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map((z) => (
            <div
              key={z.id}
              className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{z.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Priority {z.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{z.description}</p>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {z.countries.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Code: {z.code}</span>
                <span className="text-emerald-400 font-bold uppercase">{z.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{c.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {c.defaultRate}% Default
                  </span>
                </div>

                <p className="text-xs text-slate-400">{c.description}</p>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
                  HSN/SAC: <strong className="text-amber-400">{c.externalCode}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Code: {c.code}</span>
                <span className="text-emerald-400 font-bold uppercase">{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: TAX RULES */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{r.jurisdiction}</strong>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {r.rate}% Total
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Component Rates:</span>
                  {r.components.map((comp, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded-lg text-xs flex justify-between text-slate-300 font-mono">
                      <span>{comp.name}</span>
                      <strong className="text-emerald-400">{comp.rate}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Type: {r.taxType}</span>
                <span className="text-emerald-400 font-bold uppercase">{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: REGISTRATIONS */}
      {activeTab === 'registrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{reg.businessName}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {reg.status}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div className="text-slate-400">Type: <strong className="text-white">{reg.registrationType}</strong></div>
                <div className="text-amber-400 font-bold text-sm">{reg.registrationNumber}</div>
                <div className="text-slate-500 text-[11px]">Region: {reg.region}, {reg.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: TAX SIMULATOR & DEBUGGER */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-rose-400" />
                <span>Tax Calculator &amp; Debugger</span>
              </h3>
              <p className="text-xs text-slate-400">Simulate tax determination for intra-state and inter-state transactions.</p>
            </div>

            <form onSubmit={handleRunSimulator} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Origin Region</label>
                  <input
                    type="text"
                    value={simOriginRegion}
                    onChange={(e) => setSimOriginRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Destination Region</label>
                  <input
                    type="text"
                    value={simRegion}
                    onChange={(e) => setSimRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subtotal ($)</label>
                  <input
                    type="number"
                    value={simSubtotal}
                    onChange={(e) => setSimSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Discount ($)</label>
                  <input
                    type="number"
                    value={simDiscount}
                    onChange={(e) => setSimDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Shipping ($)</label>
                  <input
                    type="number"
                    value={simShipping}
                    onChange={(e) => setSimShipping(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={simTaxRate}
                    onChange={(e) => setSimTaxRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Pricing Mode</label>
                  <select
                    value={simIsInclusive ? 'true' : 'false'}
                    onChange={(e) => setSimIsInclusive(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="true">Tax-Inclusive (Reverse)</option>
                    <option value="false">Tax-Exclusive (Added)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Tax Simulation</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Calculation Breakdown Result</h3>
                <p className="text-xs text-slate-400">Exact mathematical output with component split.</p>
              </div>

              {simResult ? (
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Jurisdiction:</span>
                      <strong className="text-white">{simResult.jurisdiction}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Taxable Net Base:</span>
                      <strong className="text-white">${(simResult.taxableAmountMinor / 100).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-mono font-bold">
                      <span>Assessed Tax:</span>
                      <strong>${(simResult.totalTaxMinor / 100).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-white font-mono font-bold text-sm border-t border-slate-800 pt-2">
                      <span>Final Grand Total:</span>
                      <span className="text-rose-400">${(simResult.grandTotalMinor / 100).toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Applied Tax Components:</span>
                    {simResult.components.map((comp, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                        <div>
                          <strong className="text-white block font-bold">{comp.name}</strong>
                          <span className="text-slate-400 text-[10px] font-mono">Rate: {comp.rate}%</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">${(comp.taxAmountMinor / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Click "Execute Tax Simulation" to inspect component breakdown.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
