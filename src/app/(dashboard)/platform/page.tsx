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
  Clock,
  ShoppingBag,
  MessageSquare,
  Phone,
  UserCheck,
  Calendar,
  Send,
  FileText,
  Download,
  Award,
  Megaphone,
  Receipt,
} from 'lucide-react';
import {
  PlatformService,
  TenantStore,
  TenantDomain,
  TenantPlan,
  PlatformMetrics,
  PlatformActivityLog,
  PlatformInquiry,
} from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';

const STOREFRONT_BASE_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://mavenco-storefront.vercel.app';
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://mavenco-admin.vercel.app';

type TabType = 'overview' | 'tenants' | 'plans' | 'domains' | 'inquiries' | 'activity';

function PlatformContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as any;

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantStore[]>([]);
  const [plans, setPlans] = useState<TenantPlan[]>([]);
  const [activities, setActivities] = useState<PlatformActivityLog[]>([]);
  const [inquiries, setInquiries] = useState<PlatformInquiry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Inquiry filters & search
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'contacted' | 'provisioned' | 'archived'>('all');
  const [inquirySearch, setInquirySearch] = useState('');

  useEffect(() => {
    if (tabParam && ['overview', 'tenants', 'plans', 'domains', 'inquiries', 'activity'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabType) => {
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
  const [customFeatures, setCustomFeatures] = useState<Record<string, boolean>>({
    customDomains: true,
    advancedAnalytics: true,
    richCms: true,
    productReviews: true,
    abandonedCart: true,
    aiFeatures: true,
    apiAccess: true,
  });

  // Blueprint Store Cloner State
  const [blueprintSource, setBlueprintSource] = useState<string>('none');

  // Official GST / Tax Invoice Generator Modal State
  const [invoiceTenant, setInvoiceTenant] = useState<TenantStore | null>(null);

  // Global Superadmin Broadcast Announcement State
  const [broadcastMsg, setBroadcastMsg] = useState<string>('');
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan?.features) {
      setCustomFeatures({ ...plan.features });
    }
  };

  const handleApplyBlueprint = (sourceSlug: string) => {
    setBlueprintSource(sourceSlug);
    if (sourceSlug === 'none') return;

    const sourceTenant = tenants.find((t) => t.slug === sourceSlug);
    if (sourceTenant) {
      setPrimaryColor(sourceTenant.theme?.primaryColor || '#0F172A');
      setAccentColor(sourceTenant.theme?.accentColor || '#6366F1');
      setTagline(sourceTenant.tagline || 'Curated Modern Lifestyle Brand');
      if (sourceTenant.planId) {
        setSelectedPlanId(sourceTenant.planId);
      }
      showToast(`Blueprint layout & theme cloned from ${sourceTenant.name}!`, 'info');
    }
  };

  const handleSendPaymentReminderWhatsApp = (tenant: TenantStore) => {
    const plan = plans.find((p) => p.id === tenant.planId) || plans[1] || plans[0];
    const serverFee = plan.monthlyEquivalentInr || 4000;
    const msg = `Hi ${tenant.ownerName},\n\nThis is a friendly renewal reminder for your store *${tenant.name}* cloud infrastructure hosting.\n\n*Plan:* ${plan.name}\n*Monthly Cloud Server Fee:* ₹${serverFee.toLocaleString('en-IN')}\n*Due Date:* Next 5 business days\n\nPlease confirm UPI/Bank transfer payment or reply to this message to renew.\n\nThank you,\nMavenco Cloud Operations`;
    const cleanPhone = '918239019096'; // Default fallback or tenant contact phone
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendPaymentReminderEmail = (tenant: TenantStore) => {
    const plan = plans.find((p) => p.id === tenant.planId) || plans[1] || plans[0];
    const serverFee = plan.monthlyEquivalentInr || 4000;
    const subject = `Monthly Cloud Server Renewal: ${tenant.name} (₹${serverFee.toLocaleString('en-IN')})`;
    const body = `Hi ${tenant.ownerName},\n\nYour monthly cloud server hosting renewal for ${tenant.name} (${plan.name}) is due.\n\nAmount Due: ₹${serverFee.toLocaleString('en-IN')}\n\nPlease transfer and share the transaction UTR receipt.\n\nBest regards,\nMavenco Platform Billing Team`;
    window.location.href = `mailto:${tenant.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handlePublishBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setActiveBroadcast(broadcastMsg);
    setIsBroadcastModalOpen(false);
    showToast('Platform-wide announcement broadcasted to all merchant dashboards!', 'success');
  };

  const handleToggleCustomFeature = (featureKey: string) => {
    setCustomFeatures((prev) => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

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
  const [storefrontDomainInput, setStorefrontDomainInput] = useState('');
  const [adminDomainInput, setAdminDomainInput] = useState('');
  const [domainSslStatus, setDomainSslStatus] = useState<'connected' | 'verifying' | 'pending'>('connected');
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  const handleOpenDomainModal = (tenant: TenantStore) => {
    setEditingDomainTenant(tenant);
    setStorefrontDomainInput(tenant.primaryDomain || `${tenant.slug}.com`);
    setAdminDomainInput(tenant.adminCustomDomain || `admin.${tenant.primaryDomain || tenant.slug + '.com'}`);
    setDomainSslStatus('connected');
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomainTenant) return;

    setIsSavingDomain(true);
    const cleanStorefrontDomain = storefrontDomainInput
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    const cleanAdminDomain = adminDomainInput
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    if (!cleanStorefrontDomain) {
      showToast('Storefront domain cannot be empty', 'error');
      setIsSavingDomain(false);
      return;
    }

    try {
      const updatedDomains: TenantDomain[] = [
        {
          id: `dom_sf_${Date.now()}`,
          domain: cleanStorefrontDomain,
          type: 'storefront',
          isPrimary: true,
          status: domainSslStatus,
          sslActive: domainSslStatus === 'connected',
          createdAt: new Date().toISOString(),
        },
        ...(cleanAdminDomain
          ? [
              {
                id: `dom_adm_${Date.now()}`,
                domain: cleanAdminDomain,
                type: 'admin' as const,
                isPrimary: false,
                status: domainSslStatus,
                sslActive: domainSslStatus === 'connected',
                createdAt: new Date().toISOString(),
              },
            ]
          : []),
      ];

      // Update in MongoDB Atlas
      await fetch('/api/v1/platform/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDomainTenant.id,
          slug: editingDomainTenant.slug,
          primaryDomain: cleanStorefrontDomain,
          adminCustomDomain: cleanAdminDomain,
          domains: updatedDomains,
        }),
      });

      // Record activity in MongoDB
      await PlatformService.logActivity({
        event: `Updated domains for store ${editingDomainTenant.name}: Storefront (${cleanStorefrontDomain}), Admin (${cleanAdminDomain})`,
        actor: 'superadmin@platform.com',
        tenantId: editingDomainTenant.id,
        tenantName: editingDomainTenant.name,
        severity: 'info',
      });

      // Update local state
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingDomainTenant.id
            ? { ...t, primaryDomain: cleanStorefrontDomain, adminCustomDomain: cleanAdminDomain, domains: updatedDomains }
            : t
        )
      );

      showToast(`Custom domains updated: ${cleanStorefrontDomain} & ${cleanAdminDomain}!`, 'success');
      setEditingDomainTenant(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update custom domains', 'error');
    } finally {
      setIsSavingDomain(false);
    }
  };

  const loadPlatformData = async () => {
    const [m, tList, pList, actList, inqList] = await Promise.all([
      PlatformService.getMetrics(),
      PlatformService.listTenants(),
      PlatformService.listPlans(),
      PlatformService.listActivityLogs(),
      PlatformService.listInquiries(),
    ]);
    setMetrics(m);
    setTenants(tList);
    setPlans([...pList]);
    setActivities(actList);
    setInquiries(inqList);
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleUpdateInquiryStatus = async (id: string, newStatus: PlatformInquiry['status']) => {
    const success = await PlatformService.updateInquiryStatus(id, newStatus);
    if (success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      showToast(`Inquiry marked as ${newStatus.toUpperCase()}`, 'success');
    } else {
      showToast('Failed to update inquiry status', 'error');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry from the database?')) return;
    const success = await PlatformService.deleteInquiry(id);
    if (success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      showToast('Inquiry deleted from database', 'info');
    } else {
      showToast('Failed to delete inquiry', 'error');
    }
  };

  const handleConvertInquiryToStore = (inq: PlatformInquiry) => {
    const brandClean = inq.brandName || 'New Brand';
    const slugClean = brandClean.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/(^-|-$)/g, '');
    
    setStoreName(brandClean);
    setStoreSlug(slugClean);
    setTagline('Curated Modern Lifestyle Brand');
    setOwnerName(inq.fullName);
    setOwnerEmail(inq.email);

    // Map plan
    if (inq.interestedPlan?.includes('Starter')) {
      setSelectedPlanId('plan_starter');
    } else if (inq.interestedPlan?.includes('Enterprise')) {
      setSelectedPlanId('plan_enterprise');
    } else {
      setSelectedPlanId('plan_pro');
    }

    setWizardStep(1);
    setIsProvisionModalOpen(true);
    showToast(`Pre-filled Store Provisioning Wizard for ${brandClean}!`, 'success');
  };

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
        temporaryPassword: tempPassword,
        features: customFeatures,
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
    setSelectedPlanId('plan_pro');
    setCustomFeatures({
      customDomains: true,
      advancedAnalytics: true,
      richCms: true,
      productReviews: true,
      abandonedCart: true,
      aiFeatures: true,
      apiAccess: true,
    });
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
      {/* Global Superadmin Broadcast Alert Banner */}
      {activeBroadcast && (
        <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-amber-200">
            <Megaphone className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-extrabold uppercase tracking-wider text-amber-400 mr-2">Live Merchant Broadcast:</span>
              <span className="text-slate-200">{activeBroadcast}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveBroadcast(null)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

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

            <div className="flex items-center gap-3 z-10 flex-wrap">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition-all"
              >
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Broadcast Notice</span>
              </button>

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
                onClick={() => handleTabChange('inquiries')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all relative"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Inquiries</span>
                {inquiries.filter((i) => i.status === 'new').length > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-extrabold rounded-full animate-pulse">
                    {inquiries.filter((i) => i.status === 'new').length} NEW
                  </span>
                )}
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
                    const tierRevenue = subscriberCount * (p.monthlyEquivalentInr || 2000);
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#10121A] border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            ₹{(p.monthlyEquivalentInr || 2000).toLocaleString('en-IN')}/mo Server
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>One-Time Fee</span>
                            <span className="font-bold text-white">₹{(p.oneTimeFeeInr || 24999).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Subscribers</span>
                            <span className="font-bold text-emerald-400">{subscriberCount} Stores</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Cloud Server Revenue</span>
                            <span className="font-bold text-rose-400">₹{tierRevenue.toLocaleString('en-IN')}/mo</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Max {p.maxProducts.toLocaleString('en-IN')} Products</span>
                          <span>{p.maxStaff} Staff Accounts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Infrastructure & Activity Stream (1 Col) */}
            <div className="space-y-6">
              {/* Platform Merchant GMV Leaderboard */}
              <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">Merchant GMV Leaderboard</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Velocity
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {tenants.slice(0, 4).map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#10121A] border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] ${
                            idx === 0
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs">{t.name}</div>
                          <div className="text-[10px] text-slate-400">{t.planName}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-400 text-xs">
                          ₹{((t.metrics?.monthlyRevenue || 280000) * (idx === 0 ? 1.8 : idx === 1 ? 1.2 : 0.9)).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">{140 - idx * 28} orders/mo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                      <span className="text-slate-500">Server Renewal:</span>
                      <span className="text-amber-400 font-medium font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Due in 14 Days</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleImpersonate(tenant)}
                    className="py-1.5 px-2.5 bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center justify-center gap-1 transition-all"
                    title="Impersonate Store Admin"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Impersonate</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSendPaymentReminderWhatsApp(tenant)}
                      className="p-1.5 text-emerald-400 hover:text-white hover:bg-emerald-950/30 border border-emerald-500/20 rounded-lg transition-all"
                      title="Send WhatsApp Server Renewal Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleSendPaymentReminderEmail(tenant)}
                      className="p-1.5 text-sky-400 hover:text-white hover:bg-sky-950/30 border border-sky-500/20 rounded-lg transition-all"
                      title="Send Email Server Renewal Reminder"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setInvoiceTenant(tenant)}
                      className="p-1.5 text-amber-400 hover:text-white hover:bg-amber-950/30 border border-amber-500/20 rounded-lg transition-all"
                      title="Generate & Download Official GST / Tax Invoice"
                    >
                      <FileText className="w-3.5 h-3.5" />
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
                          <div className="text-[10px] font-bold text-slate-400">Platform Subdomain Route</div>
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

                      <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] font-bold text-slate-400">Custom Admin Domain</div>
                          <div className="font-mono text-white font-bold text-[11px] truncate">
                            https://{t.adminCustomDomain || `admin.${t.primaryDomain || t.slug + '.com'}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-sky-400 font-bold bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
                            Admin Portal
                          </span>
                          <button
                            onClick={() => handleOpenDomainModal(t)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-bold border border-slate-700 flex items-center gap-1"
                            title="Configure Admin Domain"
                          >
                            <Edit className="w-3 h-3 text-sky-400" />
                            <span>Edit</span>
                          </button>
                        </div>
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

      {/* TAB 4: INQUIRIES & DEMO LEADS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {/* Hero Banner for Inquiries */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#12141D] via-[#161822] to-[#1A1D2B] p-6 rounded-2xl border border-emerald-900/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  Prospect Inquiries &amp; Live Demo Leads
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {inquiries.filter((i) => i.status === 'new').length} New Leads Pending
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <MessageSquare className="w-7 h-7 text-emerald-400" />
                <span>Demo Inquiries &amp; Prospect Leads</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Review incoming client evaluation inquiries from the storefront, connect directly via WhatsApp/Email, and convert leads into live provisioned tenant stores with 1 click.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 flex-wrap">
              <button
                onClick={() => loadPlatformData()}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Leads</span>
              </button>
              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Provision New Store</span>
              </button>
            </div>
          </div>

          {/* Inquiry Filters & Search Bar */}
          <div className="bg-[#161822] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {(
                [
                  { id: 'all', label: 'All Leads', count: inquiries.length },
                  { id: 'new', label: 'New', count: inquiries.filter((i) => i.status === 'new').length },
                  { id: 'contacted', label: 'Contacted', count: inquiries.filter((i) => i.status === 'contacted').length },
                  { id: 'provisioned', label: 'Provisioned', count: inquiries.filter((i) => i.status === 'provisioned').length },
                  { id: 'archived', label: 'Archived', count: inquiries.filter((i) => i.status === 'archived').length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInquiryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    inquiryFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40'
                      : 'bg-[#10121A] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-extrabold ${
                      inquiryFilter === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by name, brand, email..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full bg-[#10121A] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Inquiries List */}
          <div className="space-y-3">
            {inquiries
              .filter((inq) => {
                if (inquiryFilter !== 'all' && inq.status !== inquiryFilter) return false;
                if (inquirySearch) {
                  const q = inquirySearch.toLowerCase();
                  return (
                    inq.fullName.toLowerCase().includes(q) ||
                    (inq.brandName && inq.brandName.toLowerCase().includes(q)) ||
                    inq.email.toLowerCase().includes(q) ||
                    (inq.phone && inq.phone.includes(q))
                  );
                }
                return true;
              })
              .map((inq) => {
                const cleanWhatsApp = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '';
                return (
                  <div
                    key={inq.id}
                    className="p-5 bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-lg"
                  >
                    {/* Left: Lead Details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-lg ${
                          inq.status === 'new'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : inq.status === 'contacted'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : inq.status === 'provisioned'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {inq.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-white text-base">{inq.fullName}</h3>
                          <span className="text-xs text-rose-400 font-bold px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                            {inq.brandName || 'Unspecified Brand'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border ${
                              inq.status === 'new'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : inq.status === 'contacted'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : inq.status === 'provisioned'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {inq.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                          <a
                            href={`mailto:${inq.email}?subject=Mavenco%20Commerce%20Demo%20for%20${encodeURIComponent(inq.brandName || inq.fullName)}`}
                            className="hover:text-sky-400 flex items-center gap-1 text-slate-300 font-medium"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inq.email}</span>
                          </a>

                          {inq.phone && (
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{inq.phone}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <CreditCard className="w-3 h-3 text-amber-400" />
                            <span>{inq.interestedPlan || 'Professional Scale'}</span>
                          </span>

                          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </span>
                        </div>

                        {inq.message && inq.message !== 'No custom note attached' && (
                          <p className="text-xs text-slate-400 italic bg-[#10121A] p-2 rounded-lg border border-slate-800 max-w-2xl mt-1">
                            "{inq.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & Status Controls */}
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                      {/* Status Selector */}
                      <select
                        value={inq.status}
                        onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as any)}
                        className="bg-[#10121A] border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-2 font-medium focus:outline-none focus:border-emerald-500"
                      >
                        <option value="new">🟢 Status: New Lead</option>
                        <option value="contacted">🟡 Status: Contacted</option>
                        <option value="provisioned">🔵 Status: Provisioned</option>
                        <option value="archived">⚪ Status: Archived</option>
                      </select>

                      {/* WhatsApp Button */}
                      {cleanWhatsApp && (
                        <a
                          href={`https://wa.me/${cleanWhatsApp}?text=Hi%20${encodeURIComponent(inq.fullName)}%2C%20thank%20you%20for%20requesting%20a%20demo%20of%20Mavenco%20Commerce%20Platform%20for%20${encodeURIComponent(inq.brandName || inq.fullName)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Convert to Store Button */}
                      <button
                        onClick={() => handleConvertInquiryToStore(inq)}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition-all hover:scale-105"
                        title="Provision new tenant store from this inquiry"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Convert to Store</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Inquiry from Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {inquiries.length === 0 && (
              <div className="p-12 text-center bg-[#161822] rounded-3xl border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">No Prospect Inquiries Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When prospects click <strong>"Contact Us for Demo"</strong> on your public storefront, their inquiries will automatically populate here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
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
                  5-Day Rolling Retention (Auto-Purged)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Activity className="w-7 h-7 text-sky-400" />
                <span>Platform Audit Trail &amp; Security Logs</span>
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Cryptographic activity logs, tenant provisioning records, admin impersonation sessions, and domain routing changes. Automatically retained for 5 days and purged from MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              <span className="px-3.5 py-2 rounded-xl bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30 font-mono">
                {activities.length} Events (Last 5 Days)
              </span>
            </div>
          </div>

          <div className="bg-[#161822] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>Event Stream History</span>
              </h3>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>5-Day Auto-Delete Window Active</span>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Store Provisioning Wizard</h3>
                  <p className="text-xs text-slate-400">Configure client tenant branding, SaaS plan, and active feature flags</p>
                </div>
              </div>
              <button onClick={resetWizard} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {wizardStep < 5 && (
                <form onSubmit={handleStartProvisioning} className="space-y-6">
                  {/* Step 1: Brand & Basic Identity */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-rose-400" />
                      <span>1. Brand Identity &amp; Routing</span>
                    </div>

                    {/* Optional Blueprint Template Cloner */}
                    <div className="p-3 bg-[#0D0F16] rounded-2xl border border-rose-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                          <span>Optional: Clone Blueprint from Existing Store</span>
                        </span>
                        <span className="text-[9px] text-slate-400">Copies theme &amp; layouts</span>
                      </div>
                      <select
                        value={blueprintSource}
                        onChange={(e) => handleApplyBlueprint(e.target.value)}
                        className="w-full p-2 bg-[#141724] border border-slate-700/80 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
                      >
                        <option value="none">✨ Clean Slate (Custom Configuration)</option>
                        {tenants.map((t) => (
                          <option key={t.slug} value={t.slug}>
                            🏬 Clone Blueprint from {t.name} ({t.planName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Store Brand Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Zenith Outdoor"
                          value={storeName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold">Store Slug (Routing) *</label>
                        <input
                          type="text"
                          required
                          placeholder="zenith-outdoor"
                          value={storeSlug}
                          onChange={(e) => setStoreSlug(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Store Currency</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
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
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
                        >
                          <option value="active">Active (Production Live)</option>
                          <option value="trial">Trial (14-Day Sandbox)</option>
                          <option value="suspended">Suspended (Paused)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-bold">Store Tagline / Slogan</label>
                      <input
                        type="text"
                        placeholder="e.g. High-performance alpine mountaineering & essentials"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Step 2: Merchant Administrator */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>2. Store Owner &amp; Admin Credentials</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Owner Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Hunter"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Owner Email (Admin Login) *</label>
                        <input
                          type="email"
                          required
                          placeholder="alex@zenith.com"
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Primary Brand Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-9 p-0.5 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-full p-2 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Accent CTA Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-10 h-9 p-0.5 bg-[#10121A] border border-slate-700 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-full p-2 bg-[#10121A] border border-slate-700 rounded-xl text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: SaaS Billing Plan Tier Selection */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>3. SaaS Billing Plan Tier *</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Select commercial plan</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {plans.map((p) => {
                        const isSelected = selectedPlanId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPlan(p.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-950/30'
                                : 'bg-[#10121A] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                <Check className="w-2.5 h-2.5" />
                                <span>ACTIVE</span>
                              </div>
                            )}

                            <div>
                              <div className="text-xs font-bold text-white">{p.name}</div>
                              <div className="text-sm font-bold text-amber-400 mt-1 font-mono">
                                ₹{p.oneTimeFeeInr.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                + ₹{p.monthlyEquivalentInr.toLocaleString('en-IN')}/mo server
                              </div>
                            </div>

                            <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                              <span>Max {p.maxProducts} Prods</span>
                              <span>{p.maxStaff} Staff</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Active SaaS Feature Flags Studio */}
                  <div className="p-4 bg-[#10121A] rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>4. Feature Flags &amp; Capabilities Studio</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Toggle client features on/off
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: 'customDomains', label: 'Custom Domains & SSL Ingress', desc: 'White-label CNAME & TLS certificates', icon: Globe },
                        { key: 'abandonedCart', label: 'Abandoned Cart Recovery', desc: 'SMS/Email recovery workflows', icon: ShoppingBag },
                        { key: 'aiFeatures', label: 'AI Copywriting & SEO Studio', desc: 'Generative descriptions & SEO meta', icon: Sparkles },
                        { key: 'advancedAnalytics', label: 'Advanced Funnel Analytics', desc: 'Cohort retention & conversion rates', icon: BarChart3 },
                        { key: 'richCms', label: 'Visual Drag-Drop CMS Studio', desc: 'Dynamic lookbooks & promo banners', icon: LayoutDashboard },
                        { key: 'productReviews', label: 'Verified Customer Reviews', desc: 'Photo reviews & star ratings', icon: CheckSquare },
                        { key: 'apiAccess', label: 'Headless REST API & Webhooks', desc: 'Developer API tokens & webhooks', icon: Key },
                      ].map((item) => {
                        const Icon = item.icon || Zap;
                        const isEnabled = !!customFeatures[item.key];
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => handleToggleCustomFeature(item.key)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isEnabled
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200'
                                : 'bg-[#0B0D13] border-slate-800/80 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isEnabled ? 'text-emerald-400' : 'text-slate-600'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="text-[11px] font-semibold truncate text-white">
                                  {item.label}
                                </div>
                                <div className="text-[9px] text-slate-400 truncate">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                                isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {isEnabled ? 'ENABLED' : 'DISABLED'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetWizard}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5"
                    >
                      <span>Start Provisioning Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
                    <option value="plan_starter">Starter Boutique (₹24,999 One-Time + ₹2,000/mo server)</option>
                    <option value="plan_pro">Professional Scale (₹49,999 One-Time + ₹4,000/mo server)</option>
                    <option value="plan_enterprise">Enterprise Global (₹1,39,999 One-Time + ₹8,000/mo cluster)</option>
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
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Edit Storefront &amp; Admin Custom Domains</h3>
              </div>
              <button
                onClick={() => setEditingDomainTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDomain} className="space-y-5">
              <div className="p-3.5 bg-[#10121A] rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">{editingDomainTenant.name}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  Store ID: {editingDomainTenant.id} • Slug: {editingDomainTenant.slug} • DB: {editingDomainTenant.databaseName}
                </div>
              </div>

              {/* 1. Customer Storefront Domain */}
              <div className="p-4 bg-[#10121A] rounded-2xl border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Customer Storefront Domain *</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Where buyers shop</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. resests.com or shopreset.in"
                    value={storefrontDomainInput}
                    onChange={(e) => setStorefrontDomainInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0C0E15] rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400">CNAME &rarr; cname.mavenco-commerce.com</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('cname.mavenco-commerce.com');
                      showToast('Storefront CNAME copied to clipboard!', 'success');
                    }}
                    className="text-rose-400 hover:text-rose-300 font-sans font-bold text-[10px]"
                  >
                    Copy CNAME
                  </button>
                </div>
              </div>

              {/* 2. Merchant Admin Custom Domain */}
              <div className="p-4 bg-[#10121A] rounded-2xl border border-sky-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Merchant Admin Custom Domain</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Where store staff login</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. admin.resests.com or reset-admin.com"
                    value={adminDomainInput}
                    onChange={(e) => setAdminDomainInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <Shield className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0C0E15] rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400">CNAME &rarr; cname.mavenco-admin.com</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('cname.mavenco-admin.com');
                      showToast('Admin CNAME copied to clipboard!', 'success');
                    }}
                    className="text-sky-400 hover:text-sky-300 font-sans font-bold text-[10px]"
                  >
                    Copy CNAME
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">SSL Certificate &amp; Routing Status</label>
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
                  {isSavingDomain ? 'Saving...' : 'Save & Update Both Domains'}
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
      {/* ========================================================================= */}
      {/* GLOBAL BROADCAST ANNOUNCEMENT MODAL */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141724] border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Platform Announcement</h3>
                  <p className="text-xs text-slate-400">Post a global banner to all active merchant dashboards</p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</div>
              <div className="space-y-1.5">
                {[
                  '⚠️ Scheduled Cloud Database Maintenance: Tonight at 2:00 AM IST (Zero Downtime Expected).',
                  '🚀 SaaS Platform Upgrade v3.4 Live: New AI SEO Studio & Visual Drag-Drop CMS Blocks Available.',
                  '🔒 Security Notice: Automated TLS 1.3 Wildcard SSL Certificate Renewal Completed.',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBroadcastMsg(preset)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#0A0C10] hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 text-xs text-slate-300 hover:text-amber-300 transition-all font-medium leading-relaxed"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold">Custom Broadcast Message</label>
                <textarea
                  rows={3}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Enter system announcement or release notice..."
                  className="w-full mt-1 p-3 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishBroadcast}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Publish Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL GST / TAX INVOICE GENERATOR MODAL */}
      {/* ========================================================================= */}
      {invoiceTenant && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-slate-700 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#161824] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Official Platform Tax Invoice</h3>
                  <p className="text-xs text-slate-400">License &amp; Cloud Maintenance Billing Voucher</p>
                </div>
              </div>
              <button
                onClick={() => setInvoiceTenant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Invoice Container */}
            <div className="p-6 overflow-y-auto space-y-6 bg-[#0E1018] text-xs text-slate-300">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    <span>MAVENCO</span>
                    <span className="text-rose-400 text-xs px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 uppercase font-mono">
                      CLOUD SLA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Mavenco Global Commerce Cloud Engine</p>
                  <p className="text-[10px] text-slate-500">GSTIN: 07AAACM1234F1Z5 • Reg. Cloud Provider</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg font-mono">
                    STATUS: PAID
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    INV-2026-{invoiceTenant.code || invoiceTenant.slug.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 bg-[#141622] p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">BILLED TO (CLIENT):</span>
                  <div className="font-bold text-white text-sm mt-0.5">{invoiceTenant.name}</div>
                  <div className="text-[11px] text-slate-400">{invoiceTenant.ownerName} ({invoiceTenant.ownerEmail})</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{invoiceTenant.primaryDomain}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">PLATFORM TIER:</span>
                  <div className="font-bold text-rose-400 text-sm mt-0.5">{invoiceTenant.planName}</div>
                  <div className="text-[11px] text-slate-400">Monthly Server Renewal: 14 Days Remaining</div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 tracking-wider">
                    <th className="py-2 font-bold">Service Description</th>
                    <th className="py-2 text-center font-bold">Cycle</th>
                    <th className="py-2 text-right font-bold">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Mavenco Multi-Tenant Headless Platform License ({invoiceTenant.planName})
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">One-Time</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">
                      ₹{invoiceTenant.planId === 'plan_starter' ? '24,999' : invoiceTenant.planId === 'plan_enterprise' ? '1,39,999' : '49,999'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Dedicated MongoDB Cluster &amp; Next.js Serverless Edge SLA
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">Monthly</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">
                      ₹{invoiceTenant.planId === 'plan_starter' ? '2,000' : invoiceTenant.planId === 'plan_enterprise' ? '8,000' : '4,000'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono text-slate-200">
                    ₹{invoiceTenant.planId === 'plan_starter' ? '26,999.00' : invoiceTenant.planId === 'plan_enterprise' ? '1,47,999.00' : '53,999.00'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Integrated GST (18%):</span>
                  <span className="font-mono text-slate-200">
                    ₹{invoiceTenant.planId === 'plan_starter' ? '4,859.82' : invoiceTenant.planId === 'plan_enterprise' ? '26,639.82' : '9,719.82'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span className="text-emerald-400">Grand Total Invoice:</span>
                  <span className="font-mono text-emerald-400">
                    ₹{invoiceTenant.planId === 'plan_starter' ? '31,858.82' : invoiceTenant.planId === 'plan_enterprise' ? '1,74,638.82' : '63,718.82'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-[#161824] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Digitally signed &amp; verified by Mavenco Cloud</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInvoiceTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
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
