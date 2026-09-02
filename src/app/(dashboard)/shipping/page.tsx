'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Globe,
  MapPin,
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
  Navigation,
  ExternalLink,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  ShippingZone,
  ShippingMethod,
  ShippingCarrier,
  Shipment,
} from '@/types/shipping-commerce.types';

export default function ShippingStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'shipments' | 'zones' | 'methods' | 'carriers' | 'analytics'>('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const shpRes = await ApiClient.get<any>(`/api/v1/shipping/shipments?tenant=${tenantSlug}`);
      if (shpRes.data) setShipments(shpRes.data);

      const zoneRes = await ApiClient.get<any>(`/api/v1/shipping/zones?tenant=${tenantSlug}`);
      if (zoneRes.data) setZones(zoneRes.data);

      const methRes = await ApiClient.get<any>(`/api/v1/shipping/methods?tenant=${tenantSlug}`);
      if (methRes.data) setMethods(methRes.data);

      const carrRes = await ApiClient.get<any>(`/api/v1/shipping/carriers?tenant=${tenantSlug}`);
      if (carrRes.data) setCarriers(carrRes.data);
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
              Logistics &amp; Carrier Orchestration
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-rose-400" />
            Shipping, Delivery Zones &amp; Carrier Studio
          </h1>
          <p className="text-xs text-slate-400">
            Configure geographic shipping zones, postal rules, real-time rate calculators, and live carrier tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('zones')}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shipping Zone</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Shipments Today</span>
          <span className="text-xl font-mono font-black text-white">38 Dispatched</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">In Transit</span>
          <span className="text-xl font-mono font-black text-amber-400">14 Packages</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">On-Time SLA</span>
          <span className="text-xl font-mono font-black text-emerald-400">99.1%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg Delivery Time</span>
          <span className="text-xl font-mono font-black text-indigo-400">2.4 Days</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Gateways</span>
          <span className="text-xl font-mono font-black text-rose-400">{carriers.length} Connected</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'shipments'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Active Shipments ({shipments.length})</span>
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
          <span>Shipping Zones ({zones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('methods')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'methods'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Rates &amp; Methods ({methods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('carriers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'carriers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Carrier Gateways ({carriers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Logistics SLA &amp; Analytics</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE SHIPMENTS */}
      {activeTab === 'shipments' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Dispatched Shipments</h3>
              <p className="text-xs text-slate-400">Real-time package status and courier tracking links.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Carrier</th>
                  <th className="p-3.5">Tracking #</th>
                  <th className="p-3.5">Weight</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Est. Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {shipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-white font-bold">{shp.orderNumber}</td>
                    <td className="p-3.5 font-sans text-slate-300">{shp.customerName}</td>
                    <td className="p-3.5 text-slate-300">{shp.carrierName}</td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold flex items-center gap-1.5">
                      <span>{shp.trackingNumber}</span>
                      <a href={shp.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{shp.packageWeightKg} kg</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        shp.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {shp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(shp.estimatedDeliveryAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SHIPPING ZONES */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Postal Rules: <strong>{z.postalCodeRules.join(', ')}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Regions: {z.regions.length > 0 ? z.regions.length : 'All'}</span>
                <span className="text-emerald-400 font-bold uppercase">{z.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SHIPPING METHODS */}
      {activeTab === 'methods' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {methods.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{m.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                    {m.code}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{m.description}</p>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                  <div>
                    Rate:{' '}
                    <strong className="text-emerald-400">
                      {m.rateAmountMinor === 0 ? 'FREE' : `$${(m.rateAmountMinor / 100).toFixed(2)}`}
                    </strong>
                  </div>
                  <div>
                    Delivery: <strong className="text-white">{m.estimatedMinDays}–{m.estimatedMaxDays} Days</strong>
                  </div>
                  {m.freeShippingThresholdMinor && m.freeShippingThresholdMinor > 0 && (
                    <div className="text-amber-300 text-[10px]">
                      Free threshold: ${(m.freeShippingThresholdMinor / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Carrier: {m.carrierCode?.toUpperCase()}</span>
                <span className="text-emerald-400 font-bold uppercase">{m.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CARRIERS */}
      {activeTab === 'carriers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {carriers.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{c.name}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {c.status}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>Code: <strong className="text-white font-mono uppercase">{c.code}</strong></div>
                <div>SLA Compliance: <strong className="text-emerald-400 font-mono">{c.slaComplianceRate}%</strong></div>
                <div>Avg Transit: <strong className="text-white font-mono">{c.avgDeliveryDays} Days</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 truncate font-mono">
                {c.trackingUrlTemplate}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Carrier SLA Performance</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">BlueDart Express Air</strong>
                  <span className="text-slate-400 text-[10px]">99.1% on-time delivery across 1,840 shipments</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">99.1% SLA</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">DHL Express Worldwide</strong>
                  <span className="text-slate-400 text-[10px]">99.6% on-time cross-border fulfillment</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">99.6% SLA</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Return to Origin (RTO) Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Overall Platform RTO Rate</strong>
                  <span className="text-slate-400 text-[10px]">Failed deliveries requiring return to warehouse</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">1.2% (Low)</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Free Shipping Conversion Lift</strong>
                  <span className="text-slate-400 text-[10px]">Orders crossing the $250.00 complimentary threshold</span>
                </div>
                <span className="font-mono font-bold text-rose-400">+44.8% AOV</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
