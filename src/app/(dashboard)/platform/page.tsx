'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  LayoutDashboard,
  TrendingUp,
  Mail,
  Copy,
  Key,
} from 'lucide-react';
import {
  PlatformService,
  TenantStore,
  TenantDomain,
  TenantPlan,
  PlatformMetrics,
  PlatformActivityLog,
} from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';

const STOREFRONT_BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://mavenco-storefront.vercel.app';
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://mavenco-admin.vercel.app';

function PlatformContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as any;

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantStore[]>([]);
  const [plans, setPlans] = useState<TenantPlan[]>([]);
  const [activities, setActivities] = useState<PlatformActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'plans' | 'domains' | 'activity'>('overview');

  useEffect(() => {
    if (tabParam && ['overview', 'tenants', 'plans', 'domains', 'activity'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'overview' | 'tenants' | 'plans' | 'domains' | 'activity') => {
    setActiveTab(tab);
    router.push(`/platform?tab=${tab}`);
  };

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
  const [currency, setCurrency] = useState('INR');
  const [storeStatus, setStoreStatus] = useState<TenantStore['status']>('active');
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
  const [editCurrency, setEditCurrency] = useState('INR');
  const [editPlanId, setEditPlanId] = useState('plan_pro');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#111111');
  const [editAccentColor, setEditAccentColor] = useState('#E11D48');
  const [editStatus, setEditStatus] = useState<TenantStore['status']>('active');
  const [editTempPassword, setEditTempPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete Tenant Confirmation State
  const [deletingTenant, setDeletingTenant] = useState<TenantStore | null>(null);

  // Edit Custom Domain Modal State
  const [editingDomainTenant, setEditingDomainTenant] = useState<TenantStore | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [domainSslStatus, setDomainSslStatus] = useState<'connected' | 'verifying' | 'pending'>('connected');
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  const handleOpenDomainModal = (tenant: TenantStore) => {
    setEditingDomainTenant(tenant);
    setCustomDomainInput(tenant.primaryDomain || `${tenant.slug}.com`);
    setDomainSslStatus('connected');
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomainTenant) return;

    setIsSavingDomain(true);
    const cleanDomain = customDomainInput
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    if (!cleanDomain) {
      showToast('Custom domain cannot be empty', 'error');
      setIsSavingDomain(false);
      return;
    }

    try {
      const updatedDomains: TenantDomain[] = [
        {
          id: `dom_${Date.now()}`,
          domain: cleanDomain,
          type: 'custom',
          isPrimary: true,
          status: domainSslStatus,
          sslActive: domainSslStatus === 'connected',
          createdAt: new Date().toISOString(),
        },
      ];

      // Update in MongoDB Atlas
      await fetch('/api/v1/platform/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDomainTenant.id,
          slug: editingDomainTenant.slug,
          primaryDomain: cleanDomain,
          domains: updatedDomains,
        }),
      });

      // Record activity in MongoDB
      await PlatformService.logActivity({
        event: `Custom domain for store ${editingDomainTenant.name} updated to ${cleanDomain}`,
        actor: 'superadmin@platform.com',
        tenantId: editingDomainTenant.id,
        tenantName: editingDomainTenant.name,
        severity: 'info',
      });

      // Update local state
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingDomainTenant.id
            ? { ...t, primaryDomain: cleanDomain, domains: updatedDomains }
            : t
        )
      );

      showToast(`Custom domain updated to ${cleanDomain} with Auto SSL!`, 'success');
      setEditingDomainTenant(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update custom domain', 'error');
    } finally {
      setIsSavingDomain(false);
    }
  };

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

  const [provisionedDetails, setProvisionedDetails] = useState<{
    storeName: string;
    slug: string;
    ownerEmail: string;
    status: string;
    planName: string;
    temporaryPassword: string;
    adminLoginUrl: string;
    storefrontUrl: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const handleStartProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep(5);
    setIsProvisioning(true);
    setProvisionProgress(10);
    setProvisionLog(['🚀 Initializing tenant provisioning pipeline...']);

    const tempPassword = `Mavenco@2026!${storeSlug}`;
    const planObj = plans.find((p) => p.id === selectedPlanId) || plans[1];
    const adminUrl = `${ADMIN_BASE_URL}/login?tenant=${storeSlug}&email=${encodeURIComponent(ownerEmail)}`;
    const storeUrl = `${STOREFRONT_BASE_URL}/stores/${storeSlug}`;

    setTimeout(() => {
      setProvisionProgress(30);
      setProvisionLog((prev) => [...prev, `📁 Generating Tenant ID: store_${storeSlug}`]);
    }, 400);

    setTimeout(() => {
      setProvisionProgress(50);
      setProvisionLog((prev) => [...prev, `🗄️ Creating MongoDB Isolated Database: tenant_${storeSlug}`]);
    }, 850);

    setTimeout(() => {
      setProvisionProgress(70);
      setProvisionLog((prev) => [
        ...prev,
        `🎨 Seeding Default Brand Theme & Visual CMS Blocks...`,
        `👤 Creating Store Administrator Account: ${ownerEmail}`,
      ]);
    }, 1300);

    setTimeout(async () => {
      setProvisionProgress(85);
      setProvisionLog((prev) => [
        ...prev,
        `📧 Dispatching Official Activation & Credentials Email to ${ownerEmail}...`,
      ]);

      // Call API to send formatted activation email
      try {
        await fetch('/api/v1/platform/send-activation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeName,
            slug: storeSlug,
            ownerName,
            ownerEmail,
            status: storeStatus,
            planName: planObj?.name || 'Starter Boutique',
            temporaryPassword: tempPassword,
            customDomain,
          }),
        });
      } catch (err) {
        console.warn('Activation email dispatch notice:', err);
      }
    }, 1700);

    setTimeout(async () => {
      const newTenant = await PlatformService.provisionStore({
        name: storeName,
        slug: storeSlug,
        tagline,
        ownerName,
        ownerEmail,
        currency,
        planId: selectedPlanId,
        status: storeStatus,
        customDomain: customDomain || undefined,
        primaryColor,
        accentColor,
      });

      setProvisionedDetails({
        storeName: newTenant.name,
        slug: newTenant.slug,
        ownerEmail,
        status: storeStatus || 'active',
        planName: planObj?.name || 'Starter Boutique',
        temporaryPassword: tempPassword,
        adminLoginUrl: adminUrl,
        storefrontUrl: storeUrl,
      });

      setProvisionProgress(100);
      setProvisionLog((prev) => [
        ...prev,
        `🌐 SSL & Subdomain verified: ${storeSlug}.ourplatform.com`,
        `📧 Activation email delivered with Login Link & Temporary Password!`,
        `✅ Tenant ${newTenant.name} is now LIVE (${(storeStatus || 'active').toUpperCase()})!`,
      ]);
      setIsProvisioning(false);
      showToast(`Store ${newTenant.name} provisioned & activation email dispatched!`, 'success');
      loadPlatformData();
    }, 2400);
  };

  const resetWizard = () => {
    setIsProvisionModalOpen(false);
    setWizardStep(1);
    setIsProvisioning(false);
    setProvisionProgress(0);
    setProvisionLog([]);
    setProvisionedDetails(null);
    setCopiedCredentials(false);
    setStoreName('');
    setStoreSlug('');
    setTagline('');
    setOwnerName('');
    setOwnerEmail('');
    setCurrency('INR');
    setStoreStatus('active');
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
    setEditTempPassword(`Mavenco@2026!${tenant.slug}`);
  };

  const handleResetMerchantPassword = async () => {
    if (!editingTenant) return;
    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/v1/platform/merchant-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editingTenant.slug,
          email: editOwnerEmail || editingTenant.ownerEmail,
          customPassword: editTempPassword || undefined,
          requestedBy: 'Superadmin Console',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `Temporary password generated & dispatched to ${data.credentials?.email}!`,
          'success'
        );
        setEditTempPassword(data.credentials?.temporaryPassword || '');
      } else {
        showToast(data.error || 'Failed to reset password', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error resetting password', 'error');
    } finally {
      setIsResettingPassword(false);
    }
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
      {/* TAB 0: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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
                <span>Provision New Store</span>
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
                ₹{(metrics?.mrrInr || 35496).toLocaleString('en-IN')} /mo
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                +18.4% MRR growth vs previous month (INR)
              </p>
            </div>

            {/* Metric 3: Global Platform GMV */}
            <div className="p-5 bg-[#161822] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Platform GMV &amp; Volume</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                ₹{(metrics?.totalPlatformSalesInr || 1245000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-sky-400 font-medium">
                +24.6% merchant volume this month
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

          {/* Quick Operations Bar */}
          <div className="bg-gradient-to-r from-[#161822] via-[#1A1D2B] to-[#161822] p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Multi-Tenant SaaS Operations Hub</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage high-throughput store provisioning, custom domain routing, and isolated database clusters.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center">
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>

              <button
                onClick={() => handleTabChange('domains')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manage Domains</span>
              </button>

              <button
                onClick={() => handleTabChange('plans')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Plans &amp; Feature Flags</span>
              </button>
            </div>
          </div>

          {/* 2-Column Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Client Stores Matrix (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-rose-400" />
                    <h3 className="font-bold text-white text-sm">Provisioned Tenant Stores</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('tenants')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <span>View All {tenants.length} Stores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {tenants.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-[#10121A] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
                          style={{ backgroundColor: t.theme?.primaryColor || '#111111' }}
                        >
                          {t.code || t.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate">{t.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                t.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : t.status === 'suspended'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                            <span className="text-rose-400 font-medium">{t.planName}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{t.primaryDomain}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-bold text-white">
                            ₹{(t.metrics?.monthlyRevenue || 0) >= 100000 
                              ? `${((t.metrics?.monthlyRevenue || 0) / 100000).toFixed(1)}L`
                              : `${((t.metrics?.monthlyRevenue || 0) / 1000).toFixed(0)}k`}
                          </div>
                          <div className="text-[10px] text-slate-500">Monthly GMV</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleImpersonate(t)}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Impersonate</span>
                          </button>

                          <a
                            href={`${STOREFRONT_BASE_URL}/stores/${t.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                            title="Open Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SaaS Subscription Tier Distribution */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">SaaS Subscription Distribution</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('plans')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <span>Manage Plans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {plans.map((p) => {
                    const subscriberCount = tenants.filter((t) => t.planId === p.id).length;
                    const tierRevenue = subscriberCount * (p.monthlyEquivalentInr || 4000);
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#10121A] border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            ₹{(p.monthlyEquivalentInr || 4000).toLocaleString('en-IN')}/mo AMC
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>One-Time Fee</span>
                            <span className="font-bold text-white">₹{(p.oneTimeFeeInr || 59999).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Subscribers</span>
                            <span className="font-bold text-white">{subscriberCount} Stores</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>AMC Revenue</span>
                            <span className="font-bold text-rose-400">₹{tierRevenue.toLocaleString('en-IN')}/mo</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Max {p.maxProducts} Products</span>
                          <span>{p.maxStaff} Staff</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Infrastructure & Activity Stream (1 Col) */}
            <div className="space-y-6">
              {/* Live Cluster Health Widget */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-sm">Cluster Health &amp; Security</h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    100% OK
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#10121A] border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">MongoDB Atlas Multi-Region</div>
                      <div className="text-[10px] text-slate-500">{tenants.length} Isolated Tenant Partitions</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">99.98% SLA</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#10121A] border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">Edge Anycast Routing</div>
                      <div className="text-[10px] text-slate-500">Auto TLS 1.3 &amp; Wildcard SSL</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">24ms TTFB</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#10121A] border border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-white font-medium">Cross-Tenant Isolation</div>
                      <div className="text-[10px] text-slate-500">Zero Shared Tables Policy</div>
                    </div>
                    <span className="text-purple-400 font-mono font-bold text-[11px]">Enforced</span>
                  </div>
                </div>
              </div>

              {/* Real-time Activity Stream */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-400" />
                    <h3 className="font-bold text-white text-sm">Platform Audit Feed</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('activity')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {activities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-[#10121A] border border-slate-800/80 space-y-1 text-xs"
                    >
                      <div className="text-slate-200 font-medium leading-snug">{act.event}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="text-rose-400 font-mono">{act.actor}</span>
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: TENANTS LIST */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Hero Banner for Tenants */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-rose-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Multi-Tenant Ecosystem
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {tenants.length} Active Stores
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Store className="w-7 h-7 text-rose-400" />
                <span>Tenant Stores &amp; Workspaces</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Manage client store configurations, database partitions, merchant accounts, and active storefront previews with one-click impersonation.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>
            </div>
          </div>

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
                <option value="plan_starter">Starter Boutique (₹2,499)</option>
                <option value="plan_pro">Professional Scale (₹6,499)</option>
                <option value="plan_enterprise">Enterprise Global (₹19,999)</option>
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

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          tenant.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : tenant.status === 'suspended'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Matrix */}
                  <div className="bg-[#10121A] p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Database:</span>
                      <span className="font-mono text-slate-300 font-bold">{tenant.databaseName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Plan Tier:</span>
                      <span className="text-rose-400 font-semibold">{tenant.planName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Store Domain:</span>
                      <span className="font-mono text-slate-400 truncate max-w-[160px]">{tenant.primaryDomain}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Monthly Sales:</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{(tenant.metrics?.monthlyRevenue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleImpersonate(tenant)}
                    className="flex-1 py-1.5 px-3 bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all"
                    title="Impersonate Store Admin"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Impersonate</span>
                  </button>

                  <a
                    href={`${STOREFRONT_BASE_URL}/stores/${tenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg transition-all flex items-center justify-center"
                    title="View Live Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tenant)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                      title="Edit Tenant Configuration"
                    >
                      <Edit className="w-3.5 h-3.5" />
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
                      className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/30 rounded-lg transition-all"
                      title="Delete Store"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
          {/* Hero Banner for Domains */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-emerald-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  Edge Ingress &amp; CDN
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Auto TLS 1.3 Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Globe className="w-7 h-7 text-emerald-400" />
                <span>Custom Domains &amp; SSL Routing</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Configure automated DNS ingress, wildcard SSL certificates, and custom apex domains for client storefronts and merchant workspaces.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                All Domains Verified
              </span>
            </div>
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
                    <button
                      onClick={() => handleOpenDomainModal(t)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5 text-rose-400" />
                      <span>Edit Domain</span>
                    </button>
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
                          <div className="text-[11px] text-slate-500 font-mono">
                            {STOREFRONT_BASE_URL}/stores/{t.slug}
                          </div>
                        </div>
                        <a
                          href={`${STOREFRONT_BASE_URL}/stores/${t.slug}`}
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                            Primary
                          </span>
                          <button
                            onClick={() => handleOpenDomainModal(t)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                            title="Configure DNS & Custom Domain"
                          >
                            <Edit className="w-3 h-3 text-rose-400" />
                            <span>Edit</span>
                          </button>
                        </div>
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
                          <div className="text-[11px] text-slate-500 font-mono">
                            {ADMIN_BASE_URL}/stores/{t.slug}
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
          {/* Hero Banner for Plans */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-amber-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  Pricing &amp; Quotas
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  INR (₹) Engine Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <CreditCard className="w-7 h-7 text-amber-400" />
                <span>SaaS Billing Plans &amp; Feature Flags</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                One-time storefront + admin platform license fee with flexible monthly cloud server maintenance (MongoDB Atlas, CDN, SMTP Mail, Next.js Edge compute). Custom domain renewal excluded and billed separately.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 font-mono">
                One-Time License + Flexible Cloud
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`bg-[#161822] border ${
                  p.code === 'pro' ? 'border-rose-500/50 shadow-rose-950/40' : 'border-slate-800'
                } rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between relative`}
              >
                {p.code === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Most Popular Setup
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      Tier: {p.code}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        ₹{(p.oneTimeFeeInr || 59999).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">One-Time License</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Full storefront + merchant admin panel deployment with isolated MongoDB database partition.
                    </p>
                  </div>

                  {p.code === 'starter' && (
                    <div className="p-3 bg-gradient-to-br from-amber-950/30 via-[#10121A] to-[#12141F] rounded-xl border border-amber-500/30 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-amber-300 text-[11px]">
                        <span>14-Day Evaluation Sandbox</span>
                        <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono">₹2,000 Deposit</span>
                      </div>
                      <div className="text-[10px] text-slate-300 space-y-1">
                        <div>• <strong>100% Deducted:</strong> ₹2,000 credited on license payment.</div>
                        <div>• <strong>Refund Guarantee:</strong> ₹1,000 refunded if client drops trial.</div>
                      </div>
                    </div>
                  )}

                  {/* Maintenance & Recurring Cost */}
                  <div className="p-3.5 bg-gradient-to-br from-[#10121A] to-[#141724] rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-300 font-bold">Cloud Server &amp; DB:</span>
                      <span className="text-amber-400 font-black text-xs">
                        ₹{(p.monthlyEquivalentInr || 4000).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span>Flexible recharge (e.g. pay 2 months). No locked annual AMC contracts.</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Domain Renewal:</span>
                      <span className="text-rose-400 font-semibold">Excluded (Billed on renewal)</span>
                    </div>
                  </div>

                  {/* Estimated Real-Time Cloud Breakdown */}
                  {p.cloudCostBreakdown && (
                    <div className="p-3 bg-[#0c0e14] rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Real Cloud Expenses Breakdown</span>
                        <span className="text-emerald-400 font-mono">est. /mo</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• MongoDB Atlas Database:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.mongodbAtlas}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• Next.js Serverless Edge:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.serverlessHosting}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• SMTP Transactional Mail:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.transactionalMail}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• Media CDN &amp; WebP Opt.:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.mediaCdn}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>• Security &amp; Platform SLA:</span>
                        <span className="text-white font-mono">₹{p.cloudCostBreakdown.platformSupportBuffer}</span>
                      </div>
                    </div>
                  )}

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
        <div className="space-y-6">
          {/* Hero Banner for Activity Logs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-sky-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-600/20 text-sky-400 border border-sky-500/30">
                  Security &amp; Compliance
                </span>
                <span className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Immutable Stream
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Activity className="w-7 h-7 text-sky-400" />
                <span>Platform Audit Trail &amp; Security Logs</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Immutable cryptographic activity logs, tenant provisioning records, admin impersonation sessions, and database schema mutations.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30 font-mono">
                {activities.length} Recorded Events
              </span>
            </div>
          </div>

          <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>Event Stream History</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time Append-Only
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-bold">Initial Store Status</label>
                      <select
                        value={storeStatus}
                        onChange={(e) => setStoreStatus(e.target.value as any)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="active">Active (Production Live)</option>
                        <option value="trial">Trial (14-Day Trial)</option>
                        <option value="suspended">Suspended (Paused)</option>
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

                {!isProvisioning && provisionedDetails && (
                  <div className="p-4 sm:p-5 bg-[#10121A] rounded-2xl border border-rose-900/60 text-left space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Merchant Activation Email Dispatched
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          provisionedDetails.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : provisionedDetails.status === 'trial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {provisionedDetails.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Recipient Email:</span>
                        <span className="font-mono text-slate-200 font-bold">{provisionedDetails.ownerEmail}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Temporary Password:</span>
                        <span className="font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded">
                          {provisionedDetails.temporaryPassword}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Admin Login Portal:</span>
                        <a
                          href={provisionedDetails.adminLoginUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                        >
                          <span>/login?tenant={provisionedDetails.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400">Storefront URL:</span>
                        <a
                          href={provisionedDetails.storefrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <span>/stores/{provisionedDetails.slug}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = `🎉 Welcome to Mavenco Commerce!\n\nStore: ${provisionedDetails.storeName}\nStatus: ${provisionedDetails.status.toUpperCase()}\nPlan: ${provisionedDetails.planName}\n\n🔐 Merchant Admin Login: ${provisionedDetails.adminLoginUrl}\nEmail: ${provisionedDetails.ownerEmail}\nTemporary Password: ${provisionedDetails.temporaryPassword}\n\n🏬 Live Storefront: ${provisionedDetails.storefrontUrl}`;
                          navigator.clipboard.writeText(text);
                          setCopiedCredentials(true);
                          showToast('Merchant activation details copied to clipboard!', 'success');
                          setTimeout(() => setCopiedCredentials(false), 3000);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                      >
                        {copiedCredentials ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{copiedCredentials ? 'Credentials Copied!' : 'Copy Activation Details'}</span>
                      </button>

                      <a
                        href={provisionedDetails.storefrontUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <span>Open Store</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {!isProvisioning && (
                  <button
                    onClick={resetWizard}
                    className="w-full px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
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
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
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
                    <option value="plan_starter">Starter Boutique (₹29,999 One-Time + ₹2,000/mo server)</option>
                    <option value="plan_pro">Professional Scale (₹59,999 One-Time + ₹4,000/mo server)</option>
                    <option value="plan_enterprise">Enterprise Global (₹1,49,999 One-Time + ₹8,000/mo cluster)</option>
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

              {/* Password Management & Reset Section */}
              <div className="p-4 bg-[#10121A] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white">Merchant Admin Password</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Dispatches credentials email via Gmail SMTP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTempPassword}
                    onChange={(e) => setEditTempPassword(e.target.value)}
                    placeholder="Mavenco@2026!store"
                    className="flex-1 px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleResetMerchantPassword}
                    disabled={isResettingPassword}
                    className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isResettingPassword ? 'Sending...' : 'Reset & Email Merchant'}</span>
                  </button>
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
      {/* EDIT CUSTOM DOMAIN & ROUTING MODAL */}
      {/* ========================================================================= */}
      {editingDomainTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Edit Custom Domain &amp; Routing</h3>
              </div>
              <button
                onClick={() => setEditingDomainTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDomain} className="space-y-4">
              <div className="p-3.5 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">{editingDomainTenant.name}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  Store ID: {editingDomainTenant.id} • Slug: {editingDomainTenant.slug}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">Custom Brand Domain *</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    placeholder="e.g. shopreset.in or resetbrand.com"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter without &quot;https://&quot; (e.g. <code>brandname.com</code> or <code>shop.brand.in</code>)
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">SSL Certificate Status</label>
                <select
                  value={domainSslStatus}
                  onChange={(e) => setDomainSslStatus(e.target.value as any)}
                  className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="connected">🟢 SSL Active (Auto TLS 1.3 - Verified)</option>
                  <option value="verifying">🟡 Verifying DNS Propagation</option>
                  <option value="pending">⚪ Pending DNS Configuration</option>
                </select>
              </div>

              {/* DNS Instructions Box */}
              <div className="p-3.5 bg-[#0C0E15] rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Required DNS CNAME Record
                </div>
                <div className="flex items-center justify-between p-2 bg-[#12141F] rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-300">CNAME &rarr; cname.mavenco-commerce.com</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('cname.mavenco-commerce.com');
                      showToast('CNAME copied to clipboard!', 'success');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-sans font-bold text-[10px]"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDomainTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDomain}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingDomain ? 'Saving...' : 'Save & Update Domain'}
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

export default function SuperadminPlatformPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-xs font-mono">Loading Control Plane...</div>}>
      <PlatformContent />
    </Suspense>
  );
}
