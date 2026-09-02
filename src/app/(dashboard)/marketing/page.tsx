'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  MessageSquare,
  Smartphone,
  Tag,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Sliders,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  CustomerSegment,
  MarketingCampaign,
  LifecycleAutomation,
} from '@/types/crm-marketing.types';

export default function MarketingCRMPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'segments' | 'campaigns' | 'automations' | 'analytics' | 'compliance'>('segments');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [automations, setAutomations] = useState<LifecycleAutomation[]>([]);

  // Modals
  const [isNewSegmentOpen, setIsNewSegmentOpen] = useState(false);
  const [newSeg, setNewSeg] = useState({
    name: 'High-Spender VIPs ($3,000+)',
    description: 'Customers with over $3,000 lifetime spend or 3+ orders.',
    minSpent: 3000,
    minOrders: 2,
    rfmStage: 'champions' as any,
  });

  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCamp, setNewCamp] = useState({
    name: 'Summer Silk 15% VIP Drop',
    channel: 'email' as any,
    audienceSegmentId: 'seg_vip',
    audienceName: '👑 VIP Champions ($5,000+ Spend)',
    subject: 'VIP Early Access: Handwoven Summer Silk & Cashmere',
    content: 'Hi {{customer.firstName}}, enjoy 15% off fine silk garments with voucher {{coupon.code}}.',
    discountCode: 'SILK15',
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const segRes = await ApiClient.get<any>(`/api/v1/marketing/segments?tenant=${tenantSlug}`);
      if (segRes.data) setSegments(segRes.data);

      const campRes = await ApiClient.get<any>(`/api/v1/marketing/campaigns?tenant=${tenantSlug}`);
      if (campRes.data) setCampaigns(campRes.data);

      const autoRes = await ApiClient.get<any>(`/api/v1/marketing/automations?tenant=${tenantSlug}`);
      if (autoRes.data) setAutomations(autoRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [tenantSlug]);

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/marketing/segments', {
        tenantId: tenantSlug,
        name: newSeg.name,
        description: newSeg.description,
        type: 'dynamic',
        conditions: {
          minSpent: Number(newSeg.minSpent),
          minOrders: Number(newSeg.minOrders),
          rfmStage: newSeg.rfmStage,
        },
      });
      showToast(`Dynamic segment "${newSeg.name}" created!`, 'success');
      setIsNewSegmentOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to create segment', 'error');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/marketing/campaigns', {
        tenantId: tenantSlug,
        name: newCamp.name,
        channel: newCamp.channel,
        audienceSegmentId: newCamp.audienceSegmentId,
        audienceName: newCamp.audienceName,
        subject: newCamp.subject,
        content: newCamp.content,
        discountCode: newCamp.discountCode,
      });
      showToast(`Broadcast campaign "${newCamp.name}" dispatched!`, 'success');
      setIsNewCampaignOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to dispatch campaign', 'error');
    }
  };

  const handleToggleAutomation = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await ApiClient.patch('/api/v1/marketing/automations', { id, status: nextStatus });
      showToast(`Automation status changed to ${nextStatus.toUpperCase()}`, 'info');
      fetchAllData();
    } catch {
      showToast('Failed to update automation', 'error');
    }
  };

  const handleDeleteSegment = async (id: string) => {
    try {
      await ApiClient.delete(`/api/v1/marketing/segments?id=${id}`);
      showToast('Segment removed', 'info');
      fetchAllData();
    } catch {
      showToast('Failed to delete segment', 'error');
    }
  };

  // Top Metrics
  const totalSubscribers = segments.reduce((sum, s) => sum + (s.estimatedAudienceCount || 0), 0);
  const attributedRevenue = campaigns.reduce((sum, c) => sum + (c.analytics?.revenue || 0), 0);
  const cartRecoveryGMV = automations
    .filter((a) => a.triggerType === 'abandoned_cart')
    .reduce((sum, a) => sum + (a.stats?.recoveredRevenue || 0), 0);
  const activeAutomationsCount = automations.filter((a) => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Audience &amp; Lifecycle Automation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-rose-400" />
            Customer Marketing, CRM &amp; Automation
          </h1>
          <p className="text-xs text-slate-400">
            Design dynamic RFM segments, broadcast multi-channel campaigns, and deploy automated cart recovery workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewSegmentOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>Create Segment</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewCampaignOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Reach</span>
          <span className="text-xl font-mono font-black text-white">{totalSubscribers.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Campaign GMV</span>
          <span className="text-xl font-mono font-black text-emerald-400">${attributedRevenue.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cart Recovery GMV</span>
          <span className="text-xl font-mono font-black text-rose-400">${cartRecoveryGMV.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Journeys</span>
          <span className="text-xl font-mono font-black text-amber-400">{activeAutomationsCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Broadcasts Sent</span>
          <span className="text-xl font-mono font-black text-white">{campaigns.length}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'segments'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Audience Segments ({segments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('automations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'automations'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Lifecycle Journeys ({automations.length})</span>
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
          <span>Revenue Attribution</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'compliance'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Consent &amp; Privacy</span>
        </button>
      </div>

      {/* TAB 1: AUDIENCE SEGMENTS */}
      {activeTab === 'segments' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Dynamic Audience Segments &amp; RFM Intelligence</h3>
              <p className="text-xs text-slate-400">Rule-based customer cohorts automatically evaluated in real-time.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{s.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {s.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{s.description}</p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Audience Size:</span>
                      <strong className="font-mono text-emerald-400">{s.estimatedAudienceCount} Members</strong>
                    </div>
                    {s.conditions?.minSpent && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min Spend:</span>
                        <span>${s.conditions.minSpent.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteSegment(s.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Segment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Campaign Dispatcher</h3>
              <p className="text-xs text-slate-400">Multi-channel email, SMS, and WhatsApp marketing blasts.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Campaign Name</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Audience</th>
                  <th className="p-3.5 text-center">Open Rate</th>
                  <th className="p-3.5 text-center">Clicks</th>
                  <th className="p-3.5 text-right">Attributed GMV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {campaigns.map((c) => {
                  const openRate = c.analytics.sent > 0 ? ((c.analytics.opened / c.analytics.sent) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        <div>{c.name}</div>
                        {c.subject && <div className="text-[10px] text-slate-400 font-normal">{c.subject}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {c.channel.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">{c.audienceName}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-400">{openRate}%</td>
                      <td className="p-3.5 text-center font-mono text-white">{c.analytics.clicked}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        ${c.analytics.revenue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIFECYCLE AUTOMATIONS */}
      {activeTab === 'automations' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Trigger-Based Lifecycle Workflows</h3>
              <p className="text-xs text-slate-400">Autonomous customer journeys that run 24/7 in the background.</p>
            </div>
          </div>

          <div className="space-y-3">
            {automations.map((a) => (
              <div
                key={a.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{a.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                      {a.channel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{a.templateBody}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                    <span>Triggers: <strong className="text-white font-mono">{a.stats?.triggers || 0}</strong></span>
                    <span>Recovered Orders: <strong className="text-emerald-400 font-mono">{a.stats?.recoveredOrders || 0}</strong></span>
                    <span>Recovered GMV: <strong className="text-emerald-400 font-mono">${(a.stats?.recoveredRevenue || 0).toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAutomation(a.id, a.status)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      a.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {a.status === 'active' ? '● Live Journey' : '○ Paused'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REVENUE ATTRIBUTION */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Performing Marketing Channels</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-rose-400" />
                  <div>
                    <strong className="text-white block font-bold">Email Newsletters &amp; Drops</strong>
                    <span className="text-slate-400 text-[10px]">62% of Total Marketing GMV</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400">$57,000</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <div>
                    <strong className="text-white block font-bold">SMS Flash Broadcasts</strong>
                    <span className="text-slate-400 text-[10px]">38% of Total Marketing GMV</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400">$32,400</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automated Lifecycle Recovery Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Abandoned Cart 1h / 24h Flow</strong>
                  <span className="text-slate-400 text-[10px]">82 Recovered Orders</span>
                </div>
                <span className="font-mono font-bold text-rose-400">$49,200</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">New Member Welcome + WELCOME10</strong>
                  <span className="text-slate-400 text-[10px]">142 First Orders</span>
                </div>
                <span className="font-mono font-bold text-rose-400">$85,200</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONSENT & PRIVACY */}
      {activeTab === 'compliance' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Consent Management &amp; Frequency Caps</h3>
              <p className="text-xs text-slate-400">Ensure compliant customer messaging and prevent message fatigue.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block font-bold">Global Frequency Cap</strong>
                <span className="text-slate-400 text-[11px]">Maximum 3 marketing messages per customer per week across all channels.</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                Enforced
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block font-bold">One-Click Unsubscribe Headers</strong>
                <span className="text-slate-400 text-[11px]">Automatic List-Unsubscribe email headers compliant with Google &amp; Yahoo 2024 mandates.</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NEW SEGMENT MODAL */}
      {isNewSegmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create Dynamic Segment</h3>
                <p className="text-xs text-slate-400">Define rule conditions to isolate high-value shoppers.</p>
              </div>
              <button onClick={() => setIsNewSegmentOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Segment Name</label>
                <input
                  type="text"
                  value={newSeg.name}
                  onChange={(e) => setNewSeg({ ...newSeg, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newSeg.description}
                  onChange={(e) => setNewSeg({ ...newSeg, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={newSeg.minSpent}
                    onChange={(e) => setNewSeg({ ...newSeg, minSpent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Min Orders</label>
                  <input
                    type="number"
                    min={0}
                    value={newSeg.minOrders}
                    onChange={(e) => setNewSeg({ ...newSeg, minOrders: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSegmentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW CAMPAIGN MODAL */}
      {isNewCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create &amp; Dispatch Broadcast</h3>
                <p className="text-xs text-slate-400">Launch a targeted promotional drop to selected cohorts.</p>
              </div>
              <button onClick={() => setIsNewCampaignOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Channel</label>
                  <select
                    value={newCamp.channel}
                    onChange={(e) => setNewCamp({ ...newCamp, channel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="email">Email Broadcast</option>
                    <option value="sms">SMS Flash</option>
                    <option value="whatsapp">WhatsApp Concierge</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Audience</label>
                  <select
                    value={newCamp.audienceSegmentId}
                    onChange={(e) => {
                      const sel = segments.find((s) => s.id === e.target.value);
                      setNewCamp({
                        ...newCamp,
                        audienceSegmentId: e.target.value,
                        audienceName: sel?.name || 'Selected Cohort',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject Line</label>
                <input
                  type="text"
                  value={newCamp.subject}
                  onChange={(e) => setNewCamp({ ...newCamp, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Message Content (Personalized)</label>
                <textarea
                  rows={3}
                  value={newCamp.content}
                  onChange={(e) => setNewCamp({ ...newCamp, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Dispatch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
