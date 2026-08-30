'use client';

import React, { useState } from 'react';
import { Key, Code, Copy, Check, Plus, Trash2, Globe, Shield, Terminal } from 'lucide-react';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { useToast } from '@/lib/toast-context';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  role: 'read_only' | 'read_write' | 'full_access';
  createdAt: string;
  lastUsed: string;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'failing';
  createdAt: string;
}

export default function ApiSettingsPage() {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key_1',
      name: 'Production Mobile App Key',
      keyPrefix: 'mv_live_928f...',
      fullKey: 'mv_live_928f0941a84f3c09b189283749281a',
      role: 'full_access',
      createdAt: '12 days ago',
      lastUsed: '4 mins ago',
    },
    {
      id: 'key_2',
      name: 'ERP / Warehouse Sync Key',
      keyPrefix: 'mv_live_109c...',
      fullKey: 'mv_live_109ca88410294829bc817263548192',
      role: 'read_write',
      createdAt: '1 month ago',
      lastUsed: '1 hour ago',
    },
  ]);

  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: 'wh_1',
      url: 'https://api.inventory-hub.io/webhooks/mavenco',
      events: ['order.created', 'order.paid', 'inventory.low'],
      status: 'active',
      createdAt: '3 weeks ago',
    },
  ]);

  const handleGenerateKey = () => {
    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: `New API Key #${apiKeys.length + 1}`,
      keyPrefix: 'mv_live_' + Math.random().toString(36).substring(2, 6) + '...',
      fullKey: 'mv_live_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18),
      role: 'full_access',
      createdAt: 'Just now',
      lastUsed: 'Never',
    };
    setApiKeys([newKey, ...apiKeys]);
    showToast('New production API key generated!', 'success');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    showToast('API key revoked', 'info');
  };

  return (
    <FeatureGate
      featureKey="apiAccess"
      featureName="Headless REST API &amp; Webhooks Engine"
      featureDescription="Developer API keys, custom ERP integrations, warehouse webhooks, and mobile app authentication tokens."
    >
      <div className="space-y-6 pb-20 select-none max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Developer Ecosystem
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">REST API &amp; Webhooks</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect external mobile apps, ERP systems, and warehouse logistics pipelines.
            </p>
          </div>

          <button
            onClick={handleGenerateKey}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>

        {/* API Keys List */}
        <div className="bg-[#161822] rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-rose-400" />
              <span>Active Merchant Secret Keys</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{apiKeys.length} Active Keys</span>
          </div>

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-[#10121A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{k.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {k.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="bg-[#0A0C10] px-2 py-0.5 rounded border border-slate-800">{k.keyPrefix}</span>
                    <span className="text-slate-500">• Created {k.createdAt}</span>
                    <span className="text-slate-500">• Last used {k.lastUsed}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(k.fullKey, k.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 flex items-center gap-1.5"
                  >
                    {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{copiedId === k.id ? 'Copied Key!' : 'Copy Key'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* cURL Quickstart Example */}
        <div className="bg-[#161822] rounded-2xl border border-slate-800 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-sm">Quickstart cURL Endpoint</h3>
          </div>
          <pre className="p-4 bg-[#0A0C10] rounded-xl border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto">
{`curl -X GET https://mavenco-storefront.vercel.app/api/v1/content/homepage \\
  -H "Authorization: Bearer mv_live_your_api_key" \\
  -H "x-tenant-slug: your-store-slug"`}
          </pre>
        </div>

        {/* Webhooks Section */}
        <div className="bg-[#161822] rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Event Webhook Subscriptions</span>
            </h3>
          </div>

          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 rounded-xl bg-[#10121A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-mono text-white font-bold truncate">{wh.url}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {wh.events.map((ev, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs shrink-0 font-mono">
                  ACTIVE 200 OK
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
