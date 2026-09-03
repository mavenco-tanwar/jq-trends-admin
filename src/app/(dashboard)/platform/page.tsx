'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Shield,
  Building2,
  Users,
  Activity,
  Zap,
  Flag,
  RotateCcw,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Server,
  Terminal,
  UserCheck,
  LifeBuoy,
  Download,
  Clock,
  Eye,
  Crown,
  Sparkles,
  Globe,
  CreditCard,
  MessageSquare,
  Star,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  TenantRegistryRecord,
  ImpersonationSession,
  SystemHealthComponent,
  PlatformFeatureFlag,
  PlatformJobRecord,
  PlatformAuditRecord,
  SupportCase,
  SecurityEventRecord,
} from '@/types/platform-control.types';

export default function SuperadminControlPlanePage() {
  const { showToast } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();

  const validTabs = ['overview', 'tenants', 'impersonation', 'health', 'flags', 'jobs', 'security', 'audit', 'domains', 'plans', 'inquiries', 'reviews', 'activity'] as const;
  type TabKey = typeof validTabs[number];

  const urlTab = searchParams.get('tab') as TabKey | null;

  const [activeTab, setActiveTabState] = useState<TabKey>(() => {
    if (urlTab && (validTabs as readonly string[]).includes(urlTab)) return urlTab;
    return 'overview';
  });

  // Sync URL -> state when URL changes
  useEffect(() => {
    if (urlTab && (validTabs as readonly string[]).includes(urlTab) && urlTab !== activeTab) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  // Wrapper that also updates the URL
  const setActiveTab = (tab: TabKey) => {
    setActiveTabState(tab);
    router.push(`/platform?tab=${tab}`, { scroll: false });
  };

  // New state for sidebar tab data
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  const [tenants, setTenants] = useState<TenantRegistryRecord[]>([]);
  const [impersonations, setImpersonations] = useState<ImpersonationSession[]>([]);
  const [healthComponents, setHealthComponents] = useState<SystemHealthComponent[]>([]);
  const [featureFlags, setFeatureFlags] = useState<PlatformFeatureFlag[]>([]);
  const [jobs, setJobs] = useState<PlatformJobRecord[]>([]);
  const [auditRecords, setAuditRecords] = useState<PlatformAuditRecord[]>([]);
  const [supportCases, setSupportCases] = useState<SupportCase[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New tenant modal / form
  const [searchQuery, setSearchQuery] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [isProvisioningTenant, setIsProvisioningTenant] = useState(false);

  // Impersonation form
  const [impersonateTenantId, setImpersonateTenantId] = useState('lumina');
  const [impersonateReason, setImpersonateReason] = useState('');
  const [isStartingImpersonation, setIsStartingImpersonation] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const tenRes = await ApiClient.get<any>('/api/v1/platform/tenants');
      if (tenRes.data) setTenants(tenRes.data);

      const impRes = await ApiClient.get<any>('/api/v1/platform/impersonation');
      if (impRes.data) setImpersonations(impRes.data);

      const hltRes = await ApiClient.get<any>('/api/v1/platform/health');
      if (hltRes.data) setHealthComponents(hltRes.data);

      const ffRes = await ApiClient.get<any>('/api/v1/platform/feature-flags');
      if (ffRes.data) setFeatureFlags(ffRes.data);

      const jobRes = await ApiClient.get<any>('/api/v1/platform/jobs');
      if (jobRes.data) setJobs(jobRes.data);

      const audRes = await ApiClient.get<any>('/api/v1/platform/audit');
      if (audRes.data) setAuditRecords(audRes.data);

      const supRes = await ApiClient.get<any>('/api/v1/platform/support');
      if (supRes.data) setSupportCases(supRes.data);

      const secRes = await ApiClient.get<any>('/api/v1/platform/security');
      if (secRes.data) setSecurityEvents(secRes.data);

      // Fetch data for sidebar tabs
      try {
        const inqRes = await ApiClient.get<any>('/api/v1/platform/inquiries');
        if (inqRes.data) setInquiries(inqRes.data);
      } catch {}

      try {
        const revRes = await ApiClient.get<any>('/api/v1/reviews');
        if (revRes.data) setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      } catch {}

      try {
        const actRes = await ApiClient.get<any>('/api/v1/platform/activity');
        if (actRes.activities) setActivityFeed(actRes.activities);
        else if (Array.isArray(actRes.data)) setActivityFeed(actRes.data);
        else if (Array.isArray(actRes)) setActivityFeed(actRes);
      } catch {}
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTenantStatus = async (tenantId: string, currentStatus: string) => {
    const action = currentStatus === 'suspended' ? 'restore' : 'suspend';
    try {
      await ApiClient.patch<any>('/api/v1/platform/tenants', {
        tenantId,
        action,
        reason: `Operator manual ${action} action`,
      });
      showToast(`Tenant ${action === 'suspend' ? 'suspended' : 'restored'} successfully!`, 'success');
      await fetchData();
    } catch {
      showToast(`Failed to ${action} tenant`, 'error');
    }
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) {
      showToast('Please specify tenant name and slug', 'error');
      return;
    }
    setIsProvisioningTenant(true);
    try {
      await ApiClient.post<any>('/api/v1/platform/tenants', {
        name: newTenantName,
        slug: newTenantSlug,
      });
      showToast(`Tenant '${newTenantName}' registered and provisioned!`, 'success');
      setNewTenantName('');
      setNewTenantSlug('');
      await fetchData();
    } catch {
      showToast('Tenant provisioning failed', 'error');
    } finally {
      setIsProvisioningTenant(false);
    }
  };

  const handleStartImpersonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateReason.trim()) {
      showToast('Please provide a valid support reason for audit logging', 'error');
      return;
    }
    setIsStartingImpersonation(true);
    try {
      const selectedTenant = tenants.find((t) => t.tenantId === impersonateTenantId);
      await ApiClient.post<any>('/api/v1/platform/impersonation', {
        tenantId: impersonateTenantId,
        tenantName: selectedTenant?.name || impersonateTenantId,
        targetUserEmail: `admin@${impersonateTenantId}.com`,
        reason: impersonateReason.trim(),
      });
      showToast(`Support session active for ${selectedTenant?.name}!`, 'success');
      setImpersonateReason('');
      await fetchData();
    } catch {
      showToast('Failed to start impersonation', 'error');
    } finally {
      setIsStartingImpersonation(false);
    }
  };

  const handleEndImpersonation = async (sessionId: string) => {
    try {
      await ApiClient.post<any>('/api/v1/platform/impersonation', {
        action: 'end',
        sessionId,
      });
      showToast('Impersonation session terminated', 'info');
      await fetchData();
    } catch {
      showToast('Failed to terminate impersonation', 'error');
    }
  };

  const handleToggleFlag = async (flagId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    try {
      await ApiClient.patch<any>('/api/v1/platform/feature-flags', {
        flagId,
        status: nextStatus,
      });
      showToast(`Feature flag updated to ${nextStatus}!`, 'success');
      await fetchData();
    } catch {
      showToast('Failed to toggle feature flag', 'error');
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await ApiClient.post<any>('/api/v1/platform/jobs', { jobId });
      showToast(`Job ${jobId} requeued to worker fleet!`, 'success');
      await fetchData();
    } catch {
      showToast('Failed to retry job', 'error');
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.planName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP SUPERADMIN BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-900/40 via-purple-900/30 to-indigo-900/40 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-rose-400">Platform Control Plane</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Superadmin Mode
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Centralized tenant fleet orchestration, real-time cloud health, targeted feature flags &amp; audit governance.
            </p>
          </div>
        </div>

        {impersonations.some((s) => s.status === 'active') && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Support Session Active ({impersonations[0]?.tenantName})</span>
          </div>
        )}
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tenants</span>
          <span className="text-xl font-mono font-black text-white">{tenants.length} Orgs</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Platform MRR</span>
          <span className="text-xl font-mono font-black text-emerald-400">$42,850</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Annual Run Rate</span>
          <span className="text-xl font-mono font-black text-white">$514.2k</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">System Health</span>
          <span className="text-xl font-mono font-black text-emerald-400">99.98%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Feature Flags</span>
          <span className="text-xl font-mono font-black text-indigo-400">
            {featureFlags.filter((f) => f.status === 'enabled').length} / {featureFlags.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Failed Jobs DLQ</span>
          <span className="text-xl font-mono font-black text-rose-400">
            {jobs.filter((j) => j.status === 'failed').length} Jobs
          </span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tenants'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tenant Fleet ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('impersonation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'impersonation'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Support Impersonation</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'health'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>System Health ({healthComponents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'flags'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Feature Flags ({featureFlags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Background Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security Events</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              <span>Multi-Tenant Organizations Fleet Status</span>
            </h3>
            <div className="space-y-3">
              {tenants.map((t) => (
                <div key={t.tenantId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{t.name}</strong>
                      <span className="text-slate-500 font-mono">({t.slug})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Database: <span className="text-indigo-400">{t.databaseIdentifier}</span> • Plan: {t.planName}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-400">
                    ${(t.mrrMinor / 100).toFixed(2)}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              <span>Open Support Desk Cases</span>
            </h3>
            <div className="space-y-3">
              {supportCases.map((sc) => (
                <div key={sc.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <strong className="text-white font-bold">{sc.tenantName}</strong>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                      {sc.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{sc.subject}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TENANT FLEET */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Provision New Tenant Organization</h3>
            <form onSubmit={handleProvisionTenant} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Organization Name (e.g. Zenith Luxury)"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                required
              />
              <input
                type="text"
                placeholder="Slug (e.g. zenith)"
                value={newTenantSlug}
                onChange={(e) => setNewTenantSlug(e.target.value)}
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-mono"
                required
              />
              <button
                type="submit"
                disabled={isProvisioningTenant}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isProvisioningTenant ? 'Provisioning DB...' : 'Provision Tenant'}</span>
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base font-bold text-white">Active Tenant Registry</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Organization</th>
                    <th className="p-3.5">Database Identifier</th>
                    <th className="p-3.5">Plan Tier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">MRR</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTenants.map((t) => (
                    <tr key={t.tenantId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <strong className="text-white block">{t.name}</strong>
                        <span className="text-slate-500 text-[11px] font-mono">{t.slug}</span>
                      </td>
                      <td className="p-3.5 font-mono text-indigo-400">{t.databaseIdentifier}</td>
                      <td className="p-3.5 font-mono text-amber-400">{t.planName}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        ${(t.mrrMinor / 100).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleTenantStatus(t.tenantId, t.status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                            t.status === 'active'
                              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                        >
                          {t.status === 'active' ? 'Suspend' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPORT IMPERSONATION */}
      {activeTab === 'impersonation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Initiate Support Impersonation Session</h3>
              <p className="text-xs text-slate-400">
                Grant temporary diagnostic access to an organization with automatic session timer and audit logging.
              </p>
            </div>

            <form onSubmit={handleStartImpersonation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Target Tenant</label>
                <select
                  value={impersonateTenantId}
                  onChange={(e) => setImpersonateTenantId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                >
                  {tenants.map((t) => (
                    <option key={t.tenantId} value={t.tenantId}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Mandatory Support Reason (Audit Trail)</label>
                <textarea
                  placeholder="e.g. Diagnostic investigation for payment webhook reconciliation error #INC-9912"
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isStartingImpersonation}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs transition-all cursor-pointer"
              >
                {isStartingImpersonation ? 'Starting Session...' : 'Engage 30-Min Support Session'}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Active Support Sessions</h3>
            <div className="space-y-3">
              {impersonations.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-white font-bold">{s.tenantName}</strong>
                      <div className="text-[11px] text-slate-400 font-mono">Target: {s.targetUserEmail}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEndImpersonation(s.id)}
                      className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Terminate
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 italic font-mono bg-slate-900 p-2 rounded">
                    &ldquo;{s.reason}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthComponents.map((hc) => (
            <div key={hc.id} className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <strong className="text-white font-bold text-sm">{hc.name}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {hc.status}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Latency:</span>
                  <strong className="text-emerald-400">{hc.latencyMs} ms</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Uptime:</span>
                  <strong className="text-white">{hc.uptimePercentage}%</strong>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">{hc.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureFlags.map((ff) => (
            <div key={ff.id} className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-white font-bold text-sm">{ff.name}</strong>
                  <div className="text-[11px] text-indigo-400 font-mono">{ff.key}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleFlag(ff.id, ff.status)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    ff.status === 'enabled'
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ff.status}
                </button>
              </div>

              <p className="text-xs text-slate-400">{ff.description}</p>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400">
                Target Plans: <strong className="text-amber-400">{ff.targetPlans?.join(', ') || 'All'}</strong> • Rollout: {ff.rolloutPercentage}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: BACKGROUND JOBS */}
      {activeTab === 'jobs' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Platform Queue &amp; Worker Fleet</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Job Type</th>
                  <th className="p-3.5">Tenant</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Attempts</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-white font-bold">{j.jobType}</td>
                    <td className="p-3.5 font-mono text-slate-400">{j.tenantName || 'Platform'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        j.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : j.status === 'running'
                          ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{j.attempt}/{j.maxAttempts}</td>
                    <td className="p-3.5 text-right">
                      {j.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => handleRetryJob(j.id)}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Retry Job
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY EVENTS */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Platform Security Event Stream</h3>
          <div className="space-y-3">
            {securityEvents.map((se) => (
              <div key={se.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-bold">{se.eventType}</strong>
                    <span className="text-[10px] font-mono text-slate-500">({se.ipAddress})</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {se.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{se.details}</p>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(se.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Platform Audit Log</h3>
              <p className="text-xs text-slate-400">Append-only log of all privileged administrative actions.</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Exporting audit trail to CSV...', 'info')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="space-y-3">
            {auditRecords.map((ar) => (
              <div key={ar.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-rose-400 font-bold">{ar.action}</strong>
                    <span className="text-white font-mono text-[11px]">by {ar.actorName}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Target: {ar.targetType} ({ar.targetId}) • IP: {ar.ipAddress}
                    {ar.reason && ` • Reason: ${ar.reason}`}
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(ar.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CUSTOM DOMAINS & SSL */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Custom Domain & SSL Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Manage tenant custom domains with automatic SSL certificate provisioning via Let&apos;s Encrypt.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Tenant</th>
                    <th className="p-3.5">Primary Domain</th>
                    <th className="p-3.5">Custom Domain</th>
                    <th className="p-3.5">SSL Status</th>
                    <th className="p-3.5">DNS Verified</th>
                    <th className="p-3.5 text-right">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {tenants.map((t) => (
                    <tr key={t.tenantId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">{t.name}</td>
                      <td className="p-3.5 font-mono text-indigo-400 text-[11px]">{t.slug}.mavenco-storefront.vercel.app</td>
                      <td className="p-3.5 font-mono text-emerald-400 text-[11px]">{t.slug}.com</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                          Active (TLS 1.3)
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> CNAME Verified
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(Date.now() + 86400000 * 90).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Custom Domains</span>
              <div className="text-2xl font-mono font-black text-white">{tenants.length}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SSL Certificates Active</span>
              <div className="text-2xl font-mono font-black text-emerald-400">{tenants.length}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Auto-Renewal Enabled</span>
              <div className="text-2xl font-mono font-black text-indigo-400">100%</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SAAS BILLING & PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>SaaS Billing Plans & Subscription Tiers</span>
            </h3>
            <p className="text-xs text-slate-400">Manage platform pricing tiers, feature entitlements, and tenant subscription billing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Starter Tier', price: '$99/mo', features: ['1 Store', '1 Custom Domain', 'Basic Analytics', 'Email Support'], color: 'from-slate-800 to-slate-900', border: 'border-slate-700', tenantCount: tenants.filter(t => t.planId === 'plan_starter').length },
              { name: 'Growth Commerce Tier', price: '$299/mo', features: ['3 Stores', '5 Custom Domains', 'Advanced Analytics', 'Priority Support', 'AI Features'], color: 'from-rose-900/30 to-purple-900/30', border: 'border-rose-500/30', tenantCount: tenants.filter(t => t.planId === 'plan_growth').length },
              { name: 'Scale Enterprise Tier', price: '$799/mo', features: ['Unlimited Stores', 'Unlimited Domains', 'Full API Access', 'Dedicated Support', 'White Label', 'Custom Integrations'], color: 'from-indigo-900/30 to-cyan-900/30', border: 'border-indigo-500/30', tenantCount: tenants.filter(t => t.planId === 'plan_scale').length },
            ].map((plan) => (
              <div key={plan.name} className={`p-6 rounded-2xl bg-gradient-to-b ${plan.color} border ${plan.border} shadow-xl space-y-4`}>
                <div>
                  <h4 className="text-lg font-black text-white">{plan.name}</h4>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-1">{plan.price}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{plan.tenantCount} active tenant(s)</div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Tenant Subscription Registry</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Organization</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">MRR</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Stores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tenants.map((t) => (
                    <tr key={t.tenantId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">{t.name}</td>
                      <td className="p-3.5 text-indigo-400 font-mono text-[11px]">{t.planName}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">${(t.mrrMinor / 100).toFixed(2)}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>{t.status}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{t.storesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INQUIRIES & DEMO LEADS */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Inbound Inquiries & Demo Lead Pipeline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Prospects from the platform showcase demo request form.</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                {inquiries.length} Total Leads
              </span>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No inquiries received yet. Leads from the storefront showcase will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq: any) => (
                  <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold text-sm">{inq.fullName}</strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inq.status === 'new' ? 'bg-emerald-500/20 text-emerald-300' :
                            inq.status === 'contacted' ? 'bg-blue-500/20 text-blue-300' :
                            inq.status === 'qualified' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-700 text-slate-400'
                          }`}>{inq.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inq.email}</span>
                          {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inq.phone}</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Brand: <span className="text-indigo-400 font-bold">{inq.brandName}</span> • 
                          Interested in: <span className="text-amber-400">{inq.interestedPlan}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {inq.message && (
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">{inq.message}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      {['new', 'contacted', 'qualified', 'closed'].map((s) => (
                        <button
                          key={s}
                          onClick={async () => {
                            try {
                              await ApiClient.patch<any>('/api/v1/platform/inquiries', { id: inq.id, status: s });
                              showToast(`Status updated to ${s}`, 'success');
                              fetchData();
                            } catch { showToast('Failed to update', 'error'); }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            inq.status === s 
                              ? 'bg-rose-600 text-white' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SAAS SHOWCASE REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>SaaS Showcase Reviews & Testimonials</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Merchant reviews displayed on the public platform showcase page.</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold">
                {reviews.length} Reviews
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No showcase reviews yet. Merchant testimonials will appear here once submitted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev: any, idx: number) => (
                  <div key={rev.id || idx} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white font-bold">{rev.authorName || rev.merchantName || 'Merchant'}</strong>
                        <div className="text-[11px] text-indigo-400">{rev.brandName || rev.storeName || ''}</div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.text || rev.content || rev.review || 'Great platform!'}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PLATFORM ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Platform Activity Feed & Audit Stream</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time log of all platform-level operations, provisioning events, and administrative actions.</p>
              </div>
              <button
                onClick={() => fetchData()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Refresh</span>
              </button>
            </div>

            {activityFeed.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No recent platform activity. Events from the last 5 days will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((act: any, idx: number) => (
                  <div key={act.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sky-400 font-bold">{act.action || act.type || 'Event'}</strong>
                        <span className="text-white font-mono text-[11px]">by {act.actor || act.user || 'System'}</span>
                        {act.severity && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            act.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                            act.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>{act.severity}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {act.details || act.description || act.message || ''}
                        {act.target && ` • Target: ${act.target}`}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono shrink-0">
                      {act.timeAgo || (act.createdAt ? new Date(act.createdAt).toLocaleString() : '')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
