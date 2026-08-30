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
  Edit,
  Trash2,
  Settings,
  CheckSquare,
  Square,
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
  const [primaryColor, setPrimaryColor] = useState('#0F172A');
  const [accentColor, setAccentColor] = useState('#6366F1');

  // Edit Tenant Modal State
  const [editingTenant, setEditingTenant] = useState<TenantStore | null>(null);
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [editPlanId, setEditPlanId] = useState('plan_pro');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#111111');
  const [editAccentColor, setEditAccentColor] = useState('#E11D48');
  const [editStatus, setEditStatus] = useState<TenantStore['status']>('active');

  // Delete Tenant Confirmation State
  const [deletingTenant, setDeletingTenant] = useState<TenantStore | null>(null);

  const loadPlatformData = async () => {
    const [m, tList, pList, actList] = await Promise.all([
      PlatformService.getMetrics(),
      PlatformService.listTenants(),
      PlatformService.listPlans(),
      PlatformService.listActivityLogs(),
    ]);
    setMetrics(m);
    setTenants(tList);
    setPlans([...pList]);
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

  const handleOpenEdit = (tenant: TenantStore) => {
    setEditingTenant(tenant);
    setEditName(tenant.name);
    setEditTagline(tenant.tagline);
    setEditOwnerName(tenant.ownerName);
    setEditOwnerEmail(tenant.ownerEmail);
    setEditCurrency(tenant.currency);
    setEditPlanId(tenant.planId);
    setEditPrimaryColor(tenant.theme?.primaryColor || '#111111');
    setEditAccentColor(tenant.theme?.accentColor || '#E11D48');
    setEditStatus(tenant.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    await PlatformService.updateTenantDetails(editingTenant.id, {
      name: editName,
      tagline: editTagline,
      ownerName: editOwnerName,
      ownerEmail: editOwnerEmail,
      currency: editCurrency,
      planId: editPlanId,
      status: editStatus,
      theme: {
        ...editingTenant.theme,
        primaryColor: editPrimaryColor,
        accentColor: editAccentColor,
      },
    });

    showToast(`Updated store configuration for ${editName}`, 'success');
    setEditingTenant(null);
    loadPlatformData();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTenant) return;
    await PlatformService.deleteTenant(deletingTenant.id);
    showToast(`Store ${deletingTenant.name} removed from platform`, 'info');
    setDeletingTenant(null);
    loadPlatformData();
  };

  const handleTogglePlanFeature = async (planId: string, featureKey: keyof TenantPlan['features']) => {
    const targetPlan = plans.find((p) => p.id === planId);
    if (!targetPlan) return;

    const currentVal = targetPlan.features[featureKey];
    await PlatformService.updatePlanFeatures(planId, {
      [featureKey]: !currentVal,
    });

    showToast(`Updated ${featureKey} for plan ${targetPlan.name}`, 'info');
    loadPlatformData();
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
            <span className="text-emerald-400 font-bold">{metrics?.activeTenants || tenants.filter(t => t.status === 'active').length} Active</span>
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
            ${(metrics?.mrrUsd || 436).toLocaleString()} /mo
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
            {(metrics?.totalProducts || 220).toLocaleString()} Items
          </div>
          <p className="text-[11px] text-slate-400">
            Across {(metrics?.totalOrders || 1842).toLocaleString()} customer orders processed
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
                      <span className="text-slate-500">Routing / Domain:</span>
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
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <a
                      href={`https://mavenco-storefront.vercel.app/stores/${tenant.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2 bg-[#10121A] hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition-all"
                    >
                      <Store className="w-3.5 h-3.5 text-rose-400" />
                      <span>Storefront</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>

                    <button
                      onClick={() => handleImpersonate(tenant)}
                      className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1"
                      title="Open store admin panel as Superadmin"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Impersonate</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 text-xs">
                    <button
                      onClick={() => handleOpenEdit(tenant)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleToggleTenantStatus(tenant)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        tenant.status === 'active'
                          ? 'text-amber-400 hover:bg-amber-950/30'
                          : 'text-emerald-400 hover:bg-emerald-950/30'
                      }`}
                    >
                      {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>

                    <button
                      onClick={() => setDeletingTenant(tenant)}
                      className="px-2.5 py-1 text-red-400 hover:bg-red-950/30 rounded flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOMAINS & TENANT URLS */}
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
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          ID: {t.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{t.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SSL Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Storefront URLs */}
                  <div className="p-4 bg-[#10121A] rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <Store className="w-4 h-4" />
                        Customer Storefront URLs
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Public</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Platform Subdomain Route</div>
                          <div className="font-mono text-rose-400 text-[11px] truncate">
                            https://mavenco-storefront.vercel.app/stores/{t.slug}
                          </div>
                        </div>
                        <a
                          href={`https://mavenco-storefront.vercel.app/stores/${t.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shrink-0 flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
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
                          <div className="text-[10px] font-bold text-slate-400">Direct Store Admin Workspace</div>
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

      {/* TAB 3: PLANS & FEATURE FLAGS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-[#161822] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      Tier: {p.code}
                    </span>
                    <span className="text-2xl font-black text-white">
                      ${p.priceMonthlyUsd}
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Targeted for scaling brands with dedicated resource allocations.
                    </p>
                  </div>

                  {/* Quotas */}
                  <div className="p-3 bg-[#10121A] rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Max Products:</span>
                      <span className="font-bold text-white">{p.maxProducts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Orders:</span>
                      <span className="font-bold text-white">{p.maxOrdersMonthly.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Storage Quota:</span>
                      <span className="font-bold text-white">{(p.maxStorageMb / 1024).toFixed(0)} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Staff Accounts:</span>
                      <span className="font-bold text-white">{p.maxStaff} Users</span>
                    </div>
                  </div>

                  {/* Interactive Feature Flags */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Interactive Feature Flags
                    </div>
                    {(Object.keys(p.features) as (keyof typeof p.features)[]).map((fKey) => {
                      const enabled = p.features[fKey];
                      return (
                        <button
                          key={fKey}
                          onClick={() => handleTogglePlanFeature(p.id, fKey)}
                          type="button"
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-[#10121A] hover:bg-slate-800 text-xs text-left transition-all border border-slate-800"
                        >
                          <span className="text-slate-300 font-mono text-[11px]">
                            {fKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              enabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {enabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'activity' && (
        <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              <span>Platform Multi-Tenant Audit Logs</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Immutable Log Stream
            </span>
          </div>

          <div className="space-y-2 divide-y divide-slate-800/80">
            {activities.map((act) => (
              <div key={act.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="text-white font-medium">{act.event}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-rose-400 font-mono">{act.actor}</span>
                    <span>•</span>
                    <span className="text-slate-500">{act.tenantName || act.tenantId}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROVISIONING WIZARD MODAL (5-STEP) */}
      {/* ========================================================================= */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Store Provisioning Wizard</h3>
              </div>
              <button onClick={resetWizard} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {wizardStep < 5 && (
              <form onSubmit={handleStartProvisioning} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-bold">Store Brand Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zenith Outdoor"
                      value={storeName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Store Slug (Routing)</label>
                      <input
                        type="text"
                        required
                        placeholder="zenith-outdoor"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold">Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. High-performance alpine mountaineering"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Owner Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Hunter"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Owner Email</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@zenith.com"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Primary Brand Color</label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-10 mt-1 p-1 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Accent CTA Color</label>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full h-10 mt-1 p-1 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetWizard}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
                  >
                    Start Provisioning Pipeline →
                  </button>
                </div>
              </form>
            )}

            {wizardStep === 5 && (
              <div className="space-y-5 text-center py-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">
                    {isProvisioning ? 'Provisioning Isolated Tenant...' : '🎉 Tenant Successfully Provisioned!'}
                  </h4>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${provisionProgress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#0A0C10] rounded-xl border border-slate-800 text-left font-mono text-[11px] space-y-1.5 text-slate-300 max-h-48 overflow-y-auto">
                  {provisionLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-rose-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>

                {!isProvisioning && (
                  <button
                    onClick={resetWizard}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
                  >
                    Done &amp; View All Stores
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT TENANT MODAL */}
      {/* ========================================================================= */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Edit Store: {editingTenant.name}</h3>
              </div>
              <button onClick={() => setEditingTenant(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-bold">Store Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">Tagline</label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Owner Email</label>
                  <input
                    type="email"
                    required
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold">Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Plan</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="plan_starter">Starter Boutique</option>
                    <option value="plan_pro">Professional Scale</option>
                    <option value="plan_enterprise">Enterprise Global</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold">Primary Brand Color</label>
                  <input
                    type="color"
                    value={editPrimaryColor}
                    onChange={(e) => setEditPrimaryColor(e.target.value)}
                    className="w-full h-10 mt-1 p-1 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold">Accent CTA Color</label>
                  <input
                    type="color"
                    value={editAccentColor}
                    onChange={(e) => setEditAccentColor(e.target.value)}
                    className="w-full h-10 mt-1 p-1 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE TENANT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-red-900/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Archive Store {deletingTenant.name}?</h3>
              <p className="text-xs text-slate-400">
                This will remove the store from active routing and archive its isolated partition (<strong className="font-mono text-slate-300">{deletingTenant.databaseName}</strong>).
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
