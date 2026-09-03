'use client';

import React, { useState, useEffect } from 'react';
import {
  Code,
  Key,
  Shield,
  Bell,
  Package,
  FileText,
  Activity,
  FlaskConical,
  Sparkles,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Zap,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import {
  DeveloperOverviewStats,
  APIKeyRecord,
  OAuthAppRecord,
  WebhookSubscriptionRecord,
  WebhookDeliveryLog,
  AppMarketplaceListing,
  APIAccessLogRecord,
  OpenAPIEndpointSpec,
} from '@/types/developer-platform.types';

export default function DeveloperPortalPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'keys' | 'oauth' | 'webhooks' | 'apps' | 'docs' | 'logs' | 'sandbox'
  >('overview');

  const [stats, setStats] = useState<DeveloperOverviewStats>({
    totalApiRequests24h: 2842000,
    activeApiKeysCount: 3,
    installedAppsCount: 4,
    webhookDeliverySuccessRate: 99.8,
    p95LatencyMs: 48,
    rateLimitUsagePercent: 32.5,
    errorRatePercent: 0.04,
  });

  const [apiKeys, setApiKeys] = useState<APIKeyRecord[]>([]);
  const [oauthApps, setOauthApps] = useState<OAuthAppRecord[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscriptionRecord[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>([]);
  const [marketplaceApps, setMarketplaceApps] = useState<AppMarketplaceListing[]>([]);
  const [accessLogs, setAccessLogs] = useState<APIAccessLogRecord[]>([]);
  const [docsEndpoints, setDocsEndpoints] = useState<OpenAPIEndpointSpec[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Key Modal / Form
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'sandbox'>('production');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['products:read', 'orders:read']);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);

  // New OAuth App Modal
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [newOAuthName, setNewOAuthName] = useState('');
  const [newOAuthRedirect, setNewOAuthRedirect] = useState('');
  const [createdOAuthSecret, setCreatedOAuthSecret] = useState<string | null>(null);

  // New Webhook Modal
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['order.paid']);
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState<string | null>(null);

  // API Docs Explorer
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenAPIEndpointSpec | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'typescript' | 'python' | 'php'>('curl');

  // Copied helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Copied ${label} to clipboard!`, 'success');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [keysRes, oauthRes, whRes, appsRes, logsRes, docsRes] = await Promise.all([
        ApiClient.get<any>('/api/v1/developers/keys'),
        ApiClient.get<any>('/api/v1/developers/oauth'),
        ApiClient.get<any>('/api/v1/developers/webhooks'),
        ApiClient.get<any>('/api/v1/developers/apps'),
        ApiClient.get<any>('/api/v1/developers/logs'),
        ApiClient.get<any>('/api/v1/developers/docs'),
      ]);

      if (keysRes.data) setApiKeys(keysRes.data);
      if (oauthRes.data) setOauthApps(oauthRes.data);
      if (whRes.data?.subscriptions) setWebhooks(whRes.data.subscriptions);
      if (whRes.data?.logs) setWebhookLogs(whRes.data.logs);
      if (appsRes.data) setMarketplaceApps(appsRes.data);
      if (logsRes.data?.stats) setStats(logsRes.data.stats);
      if (logsRes.data?.logs) setAccessLogs(logsRes.data.logs);
      if (docsRes.data) {
        setDocsEndpoints(docsRes.data);
        if (docsRes.data.length > 0 && !selectedEndpoint) {
          setSelectedEndpoint(docsRes.data[0]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    try {
      const res = await ApiClient.post<any>('/api/v1/developers/keys', {
        name: newKeyName,
        environment: newKeyEnv,
        scopes: newKeyScopes,
      });
      if (res.data?.rawSecretToShowOnce) {
        setCreatedRawKey(res.data.rawSecretToShowOnce);
      }
      showToast('API Key generated successfully!', 'success');
      await fetchData();
    } catch {
      showToast('Failed to generate key', 'error');
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await ApiClient.patch<any>('/api/v1/developers/keys', { id, action: 'revoke' });
      showToast('API Key revoked!', 'success');
      await fetchData();
    } catch {
      showToast('Failed to revoke key', 'error');
    }
  };

  const handleCreateOAuthApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOAuthName) return;
    try {
      const res = await ApiClient.post<any>('/api/v1/developers/oauth', {
        name: newOAuthName,
        redirectUris: [newOAuthRedirect || 'https://myapp.com/callback'],
        allowedScopes: ['products:read', 'orders:read'],
      });
      if (res.data?.rawClientSecretToShowOnce) {
        setCreatedOAuthSecret(res.data.rawClientSecretToShowOnce);
      }
      showToast('OAuth App registered!', 'success');
      await fetchData();
    } catch {
      showToast('Failed to register OAuth app', 'error');
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    try {
      const res = await ApiClient.post<any>('/api/v1/developers/webhooks', {
        endpointUrl: newWebhookUrl,
        subscribedEvents: newWebhookEvents,
      });
      if (res.data?.signingSecret) {
        setCreatedWebhookSecret(res.data.signingSecret);
      }
      showToast('Webhook subscription activated!', 'success');
      await fetchData();
    } catch {
      showToast('Failed to create webhook', 'error');
    }
  };

  const handleDispatchTestWebhook = async (subId: string, eventType: string) => {
    try {
      await ApiClient.post<any>('/api/v1/developers/webhooks', {
        action: 'test_dispatch',
        subscriptionId: subId,
        eventType,
      });
      showToast('Test Webhook dispatched & 200 OK received!', 'success');
      await fetchData();
    } catch {
      showToast('Test dispatch failed', 'error');
    }
  };

  const handleToggleAppInstall = async (id: string, currentlyInstalled: boolean) => {
    try {
      await ApiClient.post<any>('/api/v1/developers/apps', {
        id,
        action: currentlyInstalled ? 'uninstall' : 'install',
      });
      showToast(`App ${currentlyInstalled ? 'uninstalled' : 'installed'} successfully!`, 'success');
      await fetchData();
    } catch {
      showToast('Failed to update app installation', 'error');
    }
  };

  const handleResetSandbox = async () => {
    try {
      await ApiClient.post<any>('/api/v1/developers/sandbox', { action: 'reset_seed_data' });
      showToast('Sandbox environment reset to clean seed baseline!', 'success');
    } catch {
      showToast('Failed to reset sandbox', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0C0F17] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              Public API &amp; App Ecosystem
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              API v1 Stable (P95: {stats.p95LatencyMs}ms)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Developer Platform &amp; Integrations Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage API credentials, OAuth 2.0 applications, HMAC webhooks, app marketplace, SDKs &amp; sandbox testing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreatedRawKey(null);
              setNewKeyName('');
              setIsKeyModalOpen(true);
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create API Key</span>
          </button>
        </div>
      </div>

      {/* 2. METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">API Calls (24h)</span>
          <span className="text-xl font-mono font-black text-indigo-400">
            {(stats.totalApiRequests24h / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block">+14.2% volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">P95 Latency</span>
          <span className="text-xl font-mono font-black text-white">{stats.p95LatencyMs}ms</span>
          <span className="text-[10px] text-emerald-400 font-bold block">Target: &lt;100ms</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Webhook Delivery</span>
          <span className="text-xl font-mono font-black text-emerald-400">{stats.webhookDeliverySuccessRate}%</span>
          <span className="text-[10px] text-slate-400 font-bold block">HMAC-SHA256</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active API Keys</span>
          <span className="text-xl font-mono font-black text-amber-400">{stats.activeApiKeysCount} Keys</span>
          <span className="text-[10px] text-slate-400 font-bold block">0 compromised</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Installed Apps</span>
          <span className="text-xl font-mono font-black text-white">{stats.installedAppsCount} Active</span>
          <span className="text-[10px] text-indigo-400 font-bold block">Marketplace</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rate Limit Meter</span>
          <span className="text-xl font-mono font-black text-emerald-400">{stats.rateLimitUsagePercent}%</span>
          <span className="text-[10px] text-slate-500 font-bold block">10,000 req/min cap</span>
        </div>
      </div>

      {/* 3. TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Quickstart &amp; Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'keys'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('oauth')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'oauth'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>OAuth 2.0 Apps</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'webhooks'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Webhook Subscriptions</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'apps'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>App Marketplace</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>API Docs &amp; Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Gateway Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Sandbox &amp; Testing</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & QUICKSTART */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>Quickstart cURL Authentication</span>
            </h3>
            <p className="text-xs text-slate-400">
              Authenticate requests using the <code className="text-rose-400 font-mono">Authorization: Bearer sk_live_...</code> header.
            </p>

            <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre>
{`curl -X GET "https://api.mavenco.com/v1/products?limit=10" \\
  -H "Authorization: Bearer sk_live_9a2f..." \\
  -H "x-tenant-slug: lumina-luxury" \\
  -H "Content-Type: application/json"`}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    `curl -X GET "https://api.mavenco.com/v1/products?limit=10" -H "Authorization: Bearer sk_live_9a2f..." -H "x-tenant-slug: lumina-luxury" -H "Content-Type: application/json"`,
                    'cURL Command'
                  )
                }
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedText === 'cURL Command' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === 'cURL Command' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Base Production URL</span>
                <strong className="text-white font-mono text-[11px] block mt-1">https://api.mavenco.com/v1</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Sandbox Mock URL</span>
                <strong className="text-white font-mono text-[11px] block mt-1">https://sandbox.mavenco.com/v1</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Rate Limit Burst</span>
                <strong className="text-emerald-400 font-mono text-[11px] block mt-1">10,000 req / min</strong>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">SDK Client Libraries</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">TypeScript / Node.js SDK</strong>
                  <span className="text-[10px] text-slate-500 font-mono">npm install @mavenco/commerce-sdk</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  v2.4.0
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Python SDK</strong>
                  <span className="text-[10px] text-slate-500 font-mono">pip install mavenco-commerce</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  v2.1.0
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">PHP / Composer SDK</strong>
                  <span className="text-[10px] text-slate-500 font-mono">composer require mavenco/sdk</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  v1.9.4
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API KEYS STUDIO */}
      {activeTab === 'keys' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic API Keys</h3>
              <p className="text-xs text-slate-400">Scoped credentials for direct backend integrations and server-to-server operations.</p>
            </div>
            <button
              onClick={() => {
                setCreatedRawKey(null);
                setNewKeyName('');
                setIsKeyModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Key</span>
            </button>
          </div>

          {/* Newly Generated Key Alert */}
          {createdRawKey && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>API Key Generated — Copy it now!</span>
              </div>
              <p className="text-slate-300">
                For security reasons, this raw token will <strong>never be shown again</strong>. Store it securely in your secrets manager.
              </p>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-emerald-300 font-bold">
                <span className="flex-1 select-all">{createdRawKey}</span>
                <button
                  onClick={() => copyToClipboard(createdRawKey, 'API Key')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Copy Key
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Key Name</th>
                  <th className="p-3.5">Prefix</th>
                  <th className="p-3.5">Environment</th>
                  <th className="p-3.5">Assigned Scopes</th>
                  <th className="p-3.5">Last Used</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-sans">
                      <strong className="text-white block">{k.name}</strong>
                      <span className="text-[10px] text-slate-500">{k.id}</span>
                    </td>
                    <td className="p-3.5 text-indigo-400 font-bold">{k.keyPrefix}...</td>
                    <td className="p-3.5 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          k.environment === 'production' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {k.environment}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-300 text-[11px] max-w-xs truncate">
                      {k.scopes.join(', ')}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      {k.status === 'active' ? (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-[10px] font-bold cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-bold">
                          REVOKED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OAUTH 2.0 APPS */}
      {activeTab === 'oauth' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">OAuth 2.0 Applications</h3>
              <p className="text-xs text-slate-400">Authorization Code flow with PKCE for third-party integrations and public marketplace apps.</p>
            </div>
            <button
              onClick={() => {
                setCreatedOAuthSecret(null);
                setNewOAuthName('');
                setIsOAuthModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register App</span>
            </button>
          </div>

          {createdOAuthSecret && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
              <strong className="text-emerald-400 block font-bold">Client Secret Generated!</strong>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-emerald-300 font-bold flex justify-between items-center">
                <span>{createdOAuthSecret}</span>
                <button
                  onClick={() => copyToClipboard(createdOAuthSecret, 'Client Secret')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Copy Secret
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oauthApps.map((app) => (
              <div key={app.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-white text-sm block font-bold">{app.name}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Client ID: {app.clientId}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                  <div><strong>Redirect:</strong> {app.redirectUris.join(', ')}</div>
                  <div><strong>Scopes:</strong> {app.allowedScopes.join(', ')}</div>
                  <div><strong>Installations:</strong> {app.activeInstallations} stores</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOK SUBSCRIPTIONS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white">Active Webhook Subscriptions</h3>
                <p className="text-xs text-slate-400">Real-time HTTP push events signed with HMAC-SHA256.</p>
              </div>
              <button
                onClick={() => {
                  setCreatedWebhookSecret(null);
                  setNewWebhookUrl('');
                  setIsWebhookModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Webhook</span>
              </button>
            </div>

            {createdWebhookSecret && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
                <strong className="text-emerald-400 block font-bold">Webhook Signing Secret Generated!</strong>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-emerald-300 font-bold flex justify-between items-center">
                  <span>{createdWebhookSecret}</span>
                  <button
                    onClick={() => copyToClipboard(createdWebhookSecret, 'Signing Secret')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Copy Secret
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {webhooks.map((w) => (
                <div key={w.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-mono text-sm">{w.endpointUrl}</strong>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDispatchTestWebhook(w.id, w.subscribedEvents[0] || 'order.paid')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span>Send Test Ping</span>
                      </button>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                    <span>Events: {w.subscribedEvents.join(', ')}</span>
                    <span>Delivered: {w.successCount} OK / {w.failureCount} Fail</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Recent Webhook Deliveries &amp; Payloads</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 font-sans">
                  <tr>
                    <th className="p-3.5">Event Topic</th>
                    <th className="p-3.5">HTTP Status</th>
                    <th className="p-3.5">Latency</th>
                    <th className="p-3.5">Payload Summary</th>
                    <th className="p-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {webhookLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-rose-400 font-bold">{l.eventType}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">{l.httpStatus} OK</td>
                      <td className="p-3.5 text-slate-300">{l.latencyMs}ms</td>
                      <td className="p-3.5 text-slate-300 font-sans">{l.payloadSummary}</td>
                      <td className="p-3.5 text-right text-slate-500 text-[11px]">
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: APP MARKETPLACE */}
      {activeTab === 'apps' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">App Marketplace &amp; Partner Integrations</h3>
            <p className="text-xs text-slate-400">Discover and install pre-built apps for logistics, marketing, accounting, and AI automation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaceApps.map((app) => (
              <div key={app.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center font-bold text-white text-base shadow-md`}>
                      {app.name.charAt(0)}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase font-mono">
                      {app.category}
                    </span>
                  </div>

                  <div>
                    <strong className="text-white text-sm block font-bold">{app.name}</strong>
                    <span className="text-[10px] text-slate-500">by {app.developerName}</span>
                  </div>

                  <p className="text-slate-300 text-xs line-clamp-2">{app.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono font-bold text-white">
                    {app.monthlyPriceMinor === 0 ? 'Free' : `$${(app.monthlyPriceMinor / 100).toFixed(2)}/mo`}
                  </span>

                  <button
                    onClick={() => handleToggleAppInstall(app.id, app.isInstalled)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                      app.isInstalled
                        ? 'bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 border border-slate-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30'
                    }`}
                  >
                    {app.isInstalled ? 'Installed (Uninstall)' : 'Install App'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: API DOCS & EXPLORER */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white">OpenAPI v1 Catalog</h3>
            <div className="space-y-2">
              {docsEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedEndpoint?.id === ep.id
                      ? 'bg-rose-950/40 border-rose-500/50 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : ep.method === 'POST'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px]">{ep.path}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">{ep.summary}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            {selectedEndpoint ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      {selectedEndpoint.method}
                    </span>
                    <strong className="text-white text-base font-mono">{selectedEndpoint.path}</strong>
                  </div>
                  <p className="text-slate-300 mt-1">{selectedEndpoint.description}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Required OAuth Scopes</span>
                  <span className="text-rose-400 font-mono text-[11px] font-bold">
                    {selectedEndpoint.requiredScopes.join(', ')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Sample Response</span>
                    <div className="flex gap-1">
                      {(['curl', 'typescript', 'python', 'php'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setCodeLanguage(lang)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            codeLanguage === lang ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-xs overflow-x-auto">
                    <pre>{selectedEndpoint.sampleResponseJson}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select an endpoint from the catalog to view documentation.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: GATEWAY LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">API Gateway Request Stream</h3>
            <p className="text-xs text-slate-400">Live transaction logs with tenant isolation and cryptographic identity trace.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 font-sans">
                <tr>
                  <th className="p-3.5">Method &amp; Endpoint</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">Actor Identity</th>
                  <th className="p-3.5">Request ID</th>
                  <th className="p-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {accessLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-white">{log.method}</span>{' '}
                      <span className="text-slate-300">{log.endpoint}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.httpStatus < 300
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {log.httpStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{log.latencyMs}ms</td>
                    <td className="p-3.5 text-indigo-400 font-sans">{log.actorIdentifier}</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{log.requestId}</td>
                    <td className="p-3.5 text-right text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: SANDBOX & TESTING */}
      {activeTab === 'sandbox' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-rose-400" />
                <span>Developer Sandbox &amp; Mock Seed Data</span>
              </h3>
              <p className="text-xs text-slate-400">Isolated testing environment with generic mock catalog and synthetic transactions.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              Sandbox Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block font-bold">Mock Catalog Dataset</strong>
                <span className="text-slate-400 text-[11px]">45 Products • 120 Orders • 80 Customers</span>
              </div>
              <button
                onClick={handleResetSandbox}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Baseline</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <strong className="text-white block font-bold">Simulated Network Conditions</strong>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Artificial Webhook Delay</span>
                <span className="font-mono text-emerald-400">80ms</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Simulated Error Rate</span>
                <span className="font-mono text-emerald-400">0% (Strict Determinism)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Generate Cryptographic API Key</h3>
            <form onSubmit={handleCreateAPIKey} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Key Description / Integration Name</label>
                <input
                  type="text"
                  placeholder="e.g. ERP Inventory Webhook Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Environment</label>
                <select
                  value={newKeyEnv}
                  onChange={(e: any) => setNewKeyEnv(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="production">Production (sk_live_...)</option>
                  <option value="sandbox">Sandbox (sk_test_...)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE OAUTH MODAL */}
      {isOAuthModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Register OAuth 2.0 Application</h3>
            <form onSubmit={handleCreateOAuthApp} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Application Name</label>
                <input
                  type="text"
                  placeholder="e.g. Klaviyo Integration"
                  value={newOAuthName}
                  onChange={(e) => setNewOAuthName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Redirect URI</label>
                <input
                  type="url"
                  placeholder="https://myapp.com/oauth/callback"
                  value={newOAuthRedirect}
                  onChange={(e) => setNewOAuthRedirect(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOAuthModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WEBHOOK MODAL */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create Webhook Subscription</h3>
            <form onSubmit={handleCreateWebhook} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Destination HTTPS Endpoint URL</label>
                <input
                  type="url"
                  placeholder="https://api.myapp.com/v1/webhooks"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
