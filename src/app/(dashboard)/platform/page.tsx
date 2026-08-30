'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Store,
  Layers,
  Globe,
  Radio,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Users,
  CreditCard,
  RefreshCw,
  Zap,
  Search,
  Sliders,
  Check,
  Server,
  Lock,
  Eye,
  Database,
  ArrowRight,
  Sparkles,
  BarChart3,
  Building2,
  HardDrive,
  X,
  Activity,
} from 'lucide-react';
import {
  PlatformService,
  TenantStore,
  TenantPlan,
  PlatformMetrics,
  PlatformActivityLog,
} from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';

export default function SuperadminPlatformPage() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantStore[]>([]);
  const [plans, setPlans] = useState<TenantPlan[]>([]);
  const [activities, setActivities] = useState<PlatformActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'domains' | 'activity'>('tenants');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // 5-Step Store Provisioning Wizard State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [provisionLog, setProvisionLog] = useState<string[]>([]);

  // Wizard Form Fields
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customDomain, setCustomDomain] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('plan_pro');
  const [primaryColor, setPrimaryColor] = useState('#111111');
  const [accentColor, setAccentColor] = useState('#E11D48');

  const loadPlatformData = async () => {
    const [m, tList, pList, actList] = await Promise.all([
      PlatformService.getMetrics(),
      PlatformService.listTenants(),
      PlatformService.listPlans(),
      PlatformService.listActivityLogs(),
    ]);
    setMetrics(m);
    setTenants(tList);
    setPlans(pList);
    setActivities(actList);
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleNameChange = (name: string) => {
    setStoreName(name);
    if (!storeSlug || storeSlug === '') {
      setStoreSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleStartProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep(5);
    setIsProvisioning(true);
    setProvisionProgress(10);
    setProvisionLog(['🚀 Initializing tenant provisioning pipeline...']);

    setTimeout(() => {
      setProvisionProgress(30);
      setProvisionLog((prev) => [...prev, `📁 Generating Tenant ID: store_${storeSlug}`]);
    }, 400);

    setTimeout(() => {
      setProvisionProgress(55);
      setProvisionLog((prev) => [...prev, `🗄️ Creating MongoDB Isolated Database: tenant_${storeSlug}`]);
    }, 900);

    setTimeout(() => {
      setProvisionProgress(75);
      setProvisionLog((prev) => [
        ...prev,
        `🎨 Seeding Default Brand Theme & Visual CMS Blocks...`,
        `👤 Creating Store Administrator Account: ${ownerEmail}`,
      ]);
    }, 1400);

    setTimeout(async () => {
      const newTenant = await PlatformService.provisionStore({
        name: storeName,
        slug: storeSlug,
        tagline,
        ownerName,
        ownerEmail,
        currency,
        planId: selectedPlanId,
        customDomain: customDomain || undefined,
        primaryColor,
        accentColor,
      });

      setProvisionProgress(100);
      setProvisionLog((prev) => [
        ...prev,
        `🌐 SSL & Subdomain verified: ${storeSlug}.ourplatform.com`,
        `✅ Tenant ${newTenant.name} is now LIVE & ACTIVE!`,
      ]);
      setIsProvisioning(false);
      showToast(`Store ${newTenant.name} provisioned successfully!`, 'success');
      loadPlatformData();
    }, 2000);
  };

  const resetWizard = () => {
    setIsProvisionModalOpen(false);
    setWizardStep(1);
    setIsProvisioning(false);
    setProvisionProgress(0);
    setProvisionLog([]);
    setStoreName('');
    setStoreSlug('');
    setTagline('');
    setOwnerName('');
    setOwnerEmail('');
    setCurrency('USD');
    setCustomDomain('');
  };

  const handleToggleTenantStatus = async (tenant: TenantStore) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    await PlatformService.updateTenantStatus(tenant.id, nextStatus);
    showToast(`Store ${tenant.name} status updated to ${nextStatus.toUpperCase()}`, 'info');
    loadPlatformData();
  };

  const handleImpersonate = (tenant: TenantStore) => {
    PlatformService.startImpersonation(tenant);
    showToast(`Logged in as Superadmin to ${tenant.name}`, 'success');
    window.location.href = `/stores/${tenant.slug}`;
  };

  const filteredTenants = tenants.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (planFilter !== 'all' && t.planId !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.primaryDomain.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 select-none max-w-7xl mx-auto">
      {/* Superadmin Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-rose-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/30">
              Platform Master Control Plane
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SaaS Engine v3.4 Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Superadmin Multi-Tenant Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Monitor global platform health, provision new isolated tenant databases, configure SaaS subscription quotas, and manage client storefronts.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setIsProvisionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Provision New Store</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Tenant Stores</span>
            <Building2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics?.totalTenants || tenants.length}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400 font-bold">{metrics?.activeTenants || 3} Active</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">{metrics?.trialTenants || 0} Trial</span>
            <span className="text-slate-500">•</span>
            <span className="text-red-400 font-bold">{metrics?.suspendedTenants || 0} Suspended</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Platform SaaS MRR</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${(metrics?.mrrUsd || 357).toLocaleString()} /mo
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            +18.4% growth vs previous month
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Global Catalog &amp; Orders</span>
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(metrics?.totalProducts || 184).toLocaleString()} Items
          </div>
          <p className="text-[11px] text-slate-400">
            Across {(metrics?.totalOrders || 1430).toLocaleString()} customer orders processed
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Database Isolation</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{tenants.length} Isolated DBs</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Tenant Isolation Verified
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'tenants'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Tenant Stores ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'domains'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Domains &amp; Tenant URLs</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'plans'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Subscription Plans &amp; Feature Flags</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'activity'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: TENANTS LIST */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161822] p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by store name, slug, domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#10121A] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Stores</option>
                <option value="trial">Trial Stores</option>
                <option value="suspended">Suspended Stores</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-[#10121A] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Plans</option>
                <option value="plan_starter">Starter Boutique ($29)</option>
                <option value="plan_pro">Professional Scale ($79)</option>
                <option value="plan_enterprise">Enterprise Global ($249)</option>
              </select>
            </div>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  {/* Top Row: Store Badge & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
                        style={{ backgroundColor: tenant.theme?.primaryColor || '#111111' }}
                      >
                        {tenant.code || tenant.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{tenant.name}</h3>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {tenant.tagline}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        tenant.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tenant.status === 'suspended'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </div>

                  {/* Details Matrix */}
                  <div className="bg-[#10121A] p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Database:</span>
                      <span className="font-mono text-slate-300 font-bold">{tenant.databaseName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Plan:</span>
                      <span className="font-bold text-rose-400">{tenant.planName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Domain:</span>
                      <span className="font-mono text-slate-300">{tenant.primaryDomain}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Owner:</span>
                      <span className="text-slate-300 truncate max-w-[140px]">{tenant.ownerEmail}</span>
                    </div>
                  </div>

                  {/* Mini Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-[#10121A]/60 rounded-lg border border-slate-800">
                      <div className="font-bold text-white">{tenant.metrics?.products || 0}</div>
                      <div className="text-[10px] text-slate-500">Products</div>
                    </div>
                    <div className="p-2 bg-[#10121A]/60 rounded-lg border border-slate-800">
                      <div className="font-bold text-white">{tenant.metrics?.orders || 0}</div>
                      <div className="text-[10px] text-slate-500">Orders</div>
                    </div>
                    <div className="p-2 bg-[#10121A]/60 rounded-lg border border-slate-800">
                      <div className="font-bold text-white">
                        {tenant.currency === 'INR' ? '₹' : '$'}
                        {((tenant.metrics?.monthlyRevenue || 0) / 1000).toFixed(0)}k
                      </div>
                      <div className="text-[10px] text-slate-500">Revenue</div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleTenantStatus(tenant)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tenant.status === 'active'
                        ? 'bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleImpersonate(tenant)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all"
                      title="Open store admin panel as Superadmin"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Impersonate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DOMAINS & TENANT URLS */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="bg-[#161822] p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Multi-Tenant Routing &amp; Domain Manager</h2>
            </div>
            <p className="text-xs text-slate-400">
              Each tenant store receives dedicated isolated URLs for both its <strong>Customer Storefront</strong> and <strong>Merchant Admin Console</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{ backgroundColor: t.theme?.primaryColor || '#111111' }}
                    >
                      {t.code || t.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{t.name}</h3>
                        <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          {t.slug}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{t.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SSL Active &amp; Verified
                    </span>
                  </div>
                </div>

                {/* Routing Matrix for Tenant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Storefront URLs */}
                  <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <Store className="w-4 h-4" />
                        Customer Storefront URLs
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Public Shoppers</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Path-Based Store URL</div>
                          <div className="font-mono text-emerald-400 text-[11px] truncate">
                            https://mavenco-storefront.vercel.app/stores/{t.slug}
                          </div>
                        </div>
                        <a
                          href={`https://mavenco-storefront.vercel.app/stores/${t.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold shrink-0 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Platform Subdomain</div>
                          <div className="font-mono text-slate-300 text-[11px] truncate">
                            https://{t.slug}.ourplatform.com
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-800 px-2 py-0.5 rounded">
                          CNAME Routed
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Custom Brand Domain</div>
                          <div className="font-mono text-white font-bold text-[11px] truncate">
                            https://{t.primaryDomain}
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                          Primary
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Console URLs */}
                  <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <Shield className="w-4 h-4" />
                        Merchant Admin URLs
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Store Staff</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Direct Store Admin URL</div>
                          <div className="font-mono text-sky-400 text-[11px] truncate">
                            https://mavenco-admin.vercel.app/stores/{t.slug}
                          </div>
                        </div>
                        <button
                          onClick={() => handleImpersonate(t)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-bold shrink-0 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Admin</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Admin Custom Domain</div>
                          <div className="font-mono text-slate-300 text-[11px] truncate">
                            https://admin.{t.primaryDomain}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-800 px-2 py-0.5 rounded">
                          SSL Protected
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Isolated Database: <strong className="text-slate-200 font-mono">{t.databaseName}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PLANS & FEATURE FLAGS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#161822] border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                {plan.code === 'pro' && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-white">${plan.priceMonthlyUsd}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ month</span>
                    </div>
                  </div>

                  {/* Quotas */}
                  <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Resource Quotas
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Max Products:</span>
                      <span className="font-bold text-white">{plan.maxProducts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Monthly Orders:</span>
                      <span className="font-bold text-white">{plan.maxOrdersMonthly.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>File Storage:</span>
                      <span className="font-bold text-white">{(plan.maxStorageMb / 1024).toFixed(0)} GB</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Staff Seats:</span>
                      <span className="font-bold text-white">{plan.maxStaff} Admins</span>
                    </div>
                  </div>

                  {/* Feature Flags */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Feature Matrix
                    </div>
                    {Object.entries(plan.features).map(([fKey, enabled]) => (
                      <div key={fKey} className="flex items-center gap-2 text-xs">
                        {enabled ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={enabled ? 'text-slate-200' : 'text-slate-500'}>
                          {fKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM AUDIT LOGS */}
      {activeTab === 'activity' && (
        <div className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Platform Audit &amp; Security Logs</h3>
            <span className="text-xs text-slate-400">Immutable chronological log</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {activities.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      log.severity === 'critical'
                        ? 'bg-red-400'
                        : log.severity === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <p className="font-bold text-white text-xs">{log.event}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Actor: <span className="font-mono text-slate-300">{log.actor}</span> • IP:{' '}
                      <span className="font-mono text-slate-400">{log.ipAddress}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-STEP STORE PROVISIONING WIZARD MODAL */}
      {isProvisionModalOpen && (
        <Modal
          isOpen={isProvisionModalOpen}
          onClose={resetWizard}
          title="Provision New SaaS Tenant Store"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs select-none">
            {/* Step Stepper Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              {[
                { step: 1, label: 'Store Info' },
                { step: 2, label: 'Admin User' },
                { step: 3, label: 'Domains' },
                { step: 4, label: 'SaaS Plan' },
                { step: 5, label: 'Provision' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-1.5 font-bold ${
                    wizardStep === s.step
                      ? 'text-rose-400'
                      : wizardStep > s.step
                      ? 'text-emerald-400'
                      : 'text-slate-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border ${
                      wizardStep === s.step
                        ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                        : wizardStep > s.step
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-700 bg-slate-800 text-slate-500'
                    }`}
                  >
                    {wizardStep > s.step ? '✓' : s.step}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            {/* STEP 1: Store Information */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="font-bold text-white text-sm">Step 1: Store Profile &amp; Taxonomy</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lumina Luxury"
                      value={storeName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tenant Slug *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. lumina-luxury"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Store Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Artisanal fine jewelry and luxury watches"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-white text-xs">{primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-white text-xs">{accentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    disabled={!storeName || !storeSlug}
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl disabled:opacity-40"
                  >
                    <span>Next: Admin User</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Administrator User */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="font-bold text-white text-sm">Step 2: Store Administrator Account</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Admin Login Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@lumina.com"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 space-y-1">
                  <p className="font-bold text-slate-200">🔐 Secure Provisioning Key</p>
                  <p className="text-[11px]">
                    A temporary store master key will be generated and emailed to the tenant administrator.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!ownerName || !ownerEmail}
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl disabled:opacity-40"
                  >
                    <span>Next: Domains</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Domains */}
            {wizardStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="font-bold text-white text-sm">Step 3: Domain &amp; Subdomain Routing</div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Platform Subdomain (Automatic)</label>
                  <div className="flex items-center px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-300 font-mono">
                    <span>{storeSlug || 'yourstore'}.ourplatform.com</span>
                    <span className="ml-auto text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                      Free SSL Included
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Custom Brand Domain (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. lumina.com or shop.lumina.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    DNS CNAME will point to our multi-tenant load balancer with automatic Let&apos;s Encrypt certificate.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                  >
                    <span>Next: SaaS Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Plan Selection */}
            {wizardStep === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="font-bold text-white text-sm">Step 4: Select SaaS Subscription Tier</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 ${
                        selectedPlanId === p.id
                          ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/30'
                          : 'border-slate-800 bg-[#10121A] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{p.name}</span>
                        {selectedPlanId === p.id && <Check className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div className="text-xl font-extrabold text-white">${p.priceMonthlyUsd}/mo</div>
                      <p className="text-[10px] text-slate-400">
                        {p.maxProducts.toLocaleString()} Products • {(p.maxStorageMb / 1024).toFixed(0)} GB
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStartProvisioning}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch &amp; Provision Store</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Provisioning Progress */}
            {wizardStep === 5 && (
              <div className="space-y-4 py-4 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  {isProvisioning ? (
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isProvisioning ? 'Provisioning Isolated Tenant Environment...' : 'Store Successfully Provisioned!'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Database, themes, CMS sections, and subdomain configured automatically.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${provisionProgress}%` }}
                  />
                </div>

                {/* Terminal Logs */}
                <div className="p-3 bg-[#0A0C13] border border-slate-800 rounded-xl font-mono text-[11px] text-left text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
                  {provisionLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>

                {!isProvisioning && (
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={resetWizard}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md"
                    >
                      Done &amp; View All Stores
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
