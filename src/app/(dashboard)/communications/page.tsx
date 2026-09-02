'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Radio,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Check,
  X,
  Eye,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  NotificationTemplate,
  NotificationProviderConfig,
  NotificationDeliveryLog,
} from '@/types/notifications-commerce.types';

export default function CommunicationsStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'providers' | 'compliance' | 'broadcast'>('logs');
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [providers, setProviders] = useState<NotificationProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Broadcast State
  const [broadcastRecipient, setBroadcastRecipient] = useState('aanya.kapoor@example.com');
  const [broadcastChannel, setBroadcastChannel] = useState<'email' | 'sms' | 'whatsapp' | 'push' | 'in_app'>('email');
  const [broadcastEvent, setBroadcastEvent] = useState('order.created');
  const [broadcastSubject, setBroadcastSubject] = useState('Exclusive Private Runway Invitation');
  const [broadcastContent, setBroadcastContent] = useState('Hi Aanya, you are cordially invited to our Private Autumn Lookbook preview.');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const logsRes = await ApiClient.get<any>(`/api/v1/notifications/logs?tenant=${tenantSlug}`);
      if (logsRes.data) setLogs(logsRes.data);

      const tmplRes = await ApiClient.get<any>(`/api/v1/notifications/templates?tenant=${tenantSlug}`);
      if (tmplRes.data) setTemplates(tmplRes.data);

      const provRes = await ApiClient.get<any>(`/api/v1/notifications/providers?tenant=${tenantSlug}`);
      if (provRes.data) setProviders(provRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleSendTestBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/notifications/logs', {
        tenantId: tenantSlug,
        recipient: broadcastRecipient,
        channel: broadcastChannel,
        event: broadcastEvent,
        subject: broadcastSubject,
        contentSnippet: broadcastContent,
      });

      showToast(`Test ${broadcastChannel.toUpperCase()} broadcast dispatched to ${broadcastRecipient}!`, 'success');
      fetchData();
    } catch {
      showToast('Failed to dispatch notification', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Omnichannel Messaging Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-400" />
            Notifications &amp; Communication Center
          </h1>
          <p className="text-xs text-slate-400">
            Provider-agnostic routing for Email, SMS, WhatsApp, Push, and In-App customer alerts with audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Test Message</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Messages Sent</span>
          <span className="text-xl font-mono font-black text-white">4,892</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Delivery Success</span>
          <span className="text-xl font-mono font-black text-emerald-400">99.4%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Gateways</span>
          <span className="text-xl font-mono font-black text-indigo-400">{providers.length} Connected</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Published Templates</span>
          <span className="text-xl font-mono font-black text-white">{templates.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg Delivery Time</span>
          <span className="text-xl font-mono font-black text-amber-400">180ms</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Delivery Logs &amp; Queue ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Omnichannel Templates ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'providers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Providers &amp; Gateways ({providers.length})</span>
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
          <span>Consent &amp; Quiet Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'broadcast'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Test Message</span>
        </button>
      </div>

      {/* TAB 1: DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Delivery Logs</h3>
              <p className="text-xs text-slate-400">Real-time status updates across all communication channels.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Snippet</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.sentAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{log.recipient}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                        {log.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.event}</td>
                    <td className="p-3.5 text-slate-300 truncate max-w-xs">{log.contentSnippet}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Omnichannel Templates</h3>
              <p className="text-xs text-slate-400">Configured messages for email, SMS, WhatsApp, and push.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-sm font-bold">{t.name}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300">
                      v{t.version}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Event: <strong>{t.event}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {t.channels.map((ch) => (
                      <span key={ch} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">
                        {ch}
                      </span>
                    ))}
                  </div>

                  {t.subject && (
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono truncate">
                      Subject: {t.subject}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Variables: {t.variables.length}</span>
                  <span className="text-emerald-400 font-bold">Published</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Provider Adapters &amp; Routing</h3>
              <p className="text-xs text-slate-400">Gateway connectivity and automatic fallback health status.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm uppercase">{p.providerName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                    {p.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Channel: <strong className="text-white uppercase">{p.channel}</strong></div>
                  <div>Success Rate: <strong className="text-emerald-400 font-mono">{p.successRate}%</strong></div>
                  <div>Avg Latency: <strong className="text-white font-mono">{p.avgLatencyMs}ms</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  {p.senderEmail || p.senderPhone || 'Internal Gateway'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Quiet Hours &amp; Frequency Caps</h3>
              <p className="text-xs text-slate-400">Prevent customer fatigue and adhere to regional messaging mandates.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block font-bold">Quiet Hours (10:00 PM – 8:00 AM)</strong>
                <span className="text-slate-400 text-[11px]">Marketing SMS and WhatsApp broadcasts are held in queue until morning.</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block font-bold">Global Frequency Cap</strong>
                <span className="text-slate-400 text-[11px]">Maximum 3 messages per customer per week across all non-transactional channels.</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                Enforced
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST / TEST SEND */}
      {activeTab === 'broadcast' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Manual Test Broadcast</h3>
              <p className="text-xs text-slate-400">Dispatch a test notification to verify provider connectivity.</p>
            </div>
          </div>

          <form onSubmit={handleSendTestBroadcast} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Channel</label>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="push">Push</option>
                  <option value="in_app">In-App Notification</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Recipient Address / Phone</label>
                <input
                  type="text"
                  value={broadcastRecipient}
                  onChange={(e) => setBroadcastRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Subject Line</label>
              <input
                type="text"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Message Content</label>
              <textarea
                rows={3}
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Notification</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
