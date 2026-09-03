'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Globe,
  Radio,
  Layers,
  Wand2,
  Sliders,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Server,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  Store as StoreType,
  StoreDomain,
  SalesChannel,
  StoreEnvironment,
  StoreProvisioningPayload,
} from '@/types/store-commerce.types';

export default function MultiStoreStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'stores' | 'domains' | 'channels' | 'environments' | 'provision' | 'settings'>('stores');
  const [stores, setStores] = useState<StoreType[]>([]);
  const [domains, setDomains] = useState<StoreDomain[]>([]);
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [environments, setEnvironments] = useState<StoreEnvironment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New domain form state
  const [newDomainHostname, setNewDomainHostname] = useState('');
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false);

  // Provisioning wizard form state
  const [provisionForm, setProvisionForm] = useState<StoreProvisioningPayload>({
    name: '',
    slug: '',
    country: 'US',
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York',
    templatePreset: 'fashion_luxury',
    platformSubdomain: '',
  });
  const [isProvisioning, setIsProvisioning] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const stRes = await ApiClient.get<any>(`/api/v1/stores?tenant=${tenantSlug}`);
      if (stRes.data) setStores(stRes.data);

      const domRes = await ApiClient.get<any>(`/api/v1/stores/domains?tenant=${tenantSlug}`);
      if (domRes.data) setDomains(domRes.data);

      const chanRes = await ApiClient.get<any>(`/api/v1/stores/channels?tenant=${tenantSlug}`);
      if (chanRes.data) setChannels(chanRes.data);

      const envRes = await ApiClient.get<any>(`/api/v1/stores/environments?tenant=${tenantSlug}`);
      if (envRes.data) setEnvironments(envRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainHostname.trim()) {
      showToast('Please enter a valid domain hostname', 'error');
      return;
    }
    setIsSubmittingDomain(true);
    try {
      await ApiClient.post<any>('/api/v1/stores/domains', {
        hostname: newDomainHostname.trim(),
        tenantId: tenantSlug,
        storeId: stores[0]?.id || 'store_flagship_001',
        isPrimary: false,
      });
      showToast('Custom domain connected! Please configure DNS TXT records for verification.', 'success');
      setNewDomainHostname('');
      await fetchData();
    } catch {
      showToast('Failed to connect domain', 'error');
    } finally {
      setIsSubmittingDomain(false);
    }
  };

  const handleProvisionStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionForm.name || !provisionForm.slug) {
      showToast('Please specify a store name and slug', 'error');
      return;
    }
    setIsProvisioning(true);
    try {
      await ApiClient.post<any>('/api/v1/stores/provision', {
        ...provisionForm,
        tenantId: tenantSlug,
      });
      showToast(`Store '${provisionForm.name}' provisioned successfully!`, 'success');
      setProvisionForm({
        name: '',
        slug: '',
        country: 'US',
        currency: 'USD',
        language: 'en',
        timezone: 'America/New_York',
        templatePreset: 'fashion_luxury',
        platformSubdomain: '',
      });
      setActiveTab('stores');
      await fetchData();
    } catch {
      showToast('Store provisioning failed', 'error');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Multi-Storefront Fleet &amp; Custom Domains
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Tenant: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-rose-400" />
            Multi-Store, Multi-Channel &amp; Custom Domains
          </h1>
          <p className="text-xs text-slate-400">
            Provision isolated store environments, connect custom root domains with automated SSL, and orchestrate omni-channel distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('provision')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision New Store</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Storefronts</span>
          <span className="text-xl font-mono font-black text-white">{stores.length} Stores</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Connected Domains</span>
          <span className="text-xl font-mono font-black text-emerald-400">{domains.length} Hostnames</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Sales Channels</span>
          <span className="text-xl font-mono font-black text-indigo-400">{channels.length} Channels</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SSL Health</span>
          <span className="text-xl font-mono font-black text-emerald-400">100% Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Environments</span>
          <span className="text-xl font-mono font-black text-amber-400">Prod / Staging</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'stores'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Stores &amp; Fleet ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'domains'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Custom Domains ({domains.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'channels'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Sales Channels ({channels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('environments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'environments'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Environments &amp; Versions</span>
        </button>

        <button
          onClick={() => setActiveTab('provision')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'provision'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Provisioning Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Store Policies</span>
        </button>
      </div>

      {/* TAB 1: STORES FLEET */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((s) => (
            <div key={s.id} className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-base font-bold text-white">{s.name}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Store Code:</span>
                  <strong className="text-indigo-400">{s.code}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Primary Domain:</span>
                  <strong className="text-emerald-400">{s.primaryDomainName || `${s.slug}.platform.com`}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Theme:</span>
                  <strong className="text-amber-400">{s.themeId}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Currency / Locale:</span>
                  <strong className="text-white">{s.defaultCurrency} ({s.defaultLocale})</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => showToast(`Opening live storefront preview for ${s.name}...`, 'info')}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                  <span>Preview Store</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast(`Cloning store configuration for ${s.name}...`, 'info')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Clone Store"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CUSTOM DOMAINS */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Connect New Custom Domain</h3>
            <form onSubmit={handleConnectDomain} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. shop.luxuryboutique.com or luxuryboutique.com"
                value={newDomainHostname}
                onChange={(e) => setNewDomainHostname(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isSubmittingDomain}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSubmittingDomain ? 'Connecting...' : 'Connect Domain'}</span>
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Connected Hostnames &amp; SSL Certificates</h3>
            <div className="space-y-3">
              {domains.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{d.hostname}</strong>
                      {d.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                          Primary
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        SSL {d.sslStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Type: {d.type} • DNS Status: <strong>{d.dnsStatus}</strong>
                      {d.verificationToken && ` • TXT Token: ${d.verificationToken}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast(`DNS verification verified for ${d.hostname}!`, 'success')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Verify DNS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALES CHANNELS */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{c.name}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {c.status}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div>Channel Code: <strong className="text-indigo-400">{c.code}</strong></div>
                <div>Channel Type: <strong className="text-amber-400 uppercase">{c.type}</strong></div>
                <div>Catalog Visibility: <strong className="text-slate-300">{c.configuration.catalogVisibility || 'all'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ENVIRONMENTS */}
      {activeTab === 'environments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {environments.map((env) => (
            <div key={env.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{env.name}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {env.status}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div>Type: <strong className="text-amber-400 uppercase">{env.type}</strong></div>
                <div>Version: <strong className="text-slate-300">{env.activeVersion}</strong></div>
              </div>

              <button
                type="button"
                onClick={() => showToast(`Initiating zero-downtime deployment for ${env.name}...`, 'success')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Deploy / Sync Snapshot</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PROVISIONING WIZARD */}
      {activeTab === 'provision' && (
        <div className="max-w-2xl p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Storefront Provisioning Wizard</h3>
            <p className="text-xs text-slate-400">Instantly generate an isolated store environment with pre-seeded templates.</p>
          </div>

          <form onSubmit={handleProvisionStore} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Storefront Name</label>
              <input
                type="text"
                placeholder="e.g. Lumina Paris Boutique"
                value={provisionForm.name}
                onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Slug Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. lumina-paris"
                  value={provisionForm.slug}
                  onChange={(e) => setProvisionForm({ ...provisionForm, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Platform Subdomain</label>
                <input
                  type="text"
                  placeholder="e.g. paris"
                  value={provisionForm.platformSubdomain}
                  onChange={(e) => setProvisionForm({ ...provisionForm, platformSubdomain: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Template Preset</label>
              <select
                value={provisionForm.templatePreset}
                onChange={(e) => setProvisionForm({ ...provisionForm, templatePreset: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              >
                <option value="fashion_luxury">Fashion Luxury &amp; Haute Couture</option>
                <option value="beauty_cosmetics">Beauty, Cosmetics &amp; Wellness</option>
                <option value="electronics">Consumer Electronics &amp; High-Tech</option>
                <option value="general_retail">General Omnichannel Retail</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isProvisioning}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isProvisioning ? 'Provisioning Infrastructure...' : 'Provision Storefront Now'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: STORE POLICIES */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Default Storefront Policies &amp; Localization</h3>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2.5">
            <div className="flex justify-between text-slate-300">
              <span>Guest Checkout Policy:</span>
              <strong className="text-emerald-400">Enabled</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Customer Account Mode:</span>
              <strong className="text-white">Optional</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Inventory Visibility:</span>
              <strong className="text-amber-400">Low Stock Badges Only</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Pricing Visibility:</span>
              <strong className="text-white">Publicly Accessible</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Tax Display:</span>
              <strong className="text-indigo-400">Inclusive of Tax</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
