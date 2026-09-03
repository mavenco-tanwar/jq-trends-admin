'use client';

import React, { useState, useEffect } from 'react';
import {
  Cable,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRightLeft,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  Plus,
  Lock,
  FileSpreadsheet,
  Check,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import {
  IntegrationProvider,
  TenantIntegrationInstance,
  IntegrationSyncJob,
  FieldMappingRule,
  IntegrationConflictRecord,
  ReconciliationReport,
} from '@/types/integration-hub.types';

type IntegrationTab =
  | 'installed'
  | 'marketplace'
  | 'sync_jobs'
  | 'mappings'
  | 'conflicts'
  | 'reconciliation'
  | 'health';

export default function IntegrationHubPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<IntegrationTab>('installed');

  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [instances, setInstances] = useState<TenantIntegrationInstance[]>([]);
  const [syncJobs, setSyncJobs] = useState<IntegrationSyncJob[]>([]);
  const [mappings, setMappings] = useState<FieldMappingRule[]>([]);
  const [conflicts, setConflicts] = useState<IntegrationConflictRecord[]>([]);
  const [reconciliations, setReconciliations] = useState<ReconciliationReport[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mapping test state
  const [testInput, setTestInput] = useState('  silk-gown-black-01  ');
  const [testTransformType, setTestTransformType] = useState('uppercase');
  const [testOutput, setTestOutput] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [provRes, instRes, syncRes, mapRes, cnfRes, recRes] = await Promise.all([
        ApiClient.get<IntegrationProvider[]>('/api/v1/integrations/providers'),
        ApiClient.get<TenantIntegrationInstance[]>('/api/v1/integrations/instances'),
        ApiClient.get<IntegrationSyncJob[]>('/api/v1/integrations/sync'),
        ApiClient.get<FieldMappingRule[]>('/api/v1/integrations/mappings'),
        ApiClient.get<IntegrationConflictRecord[]>('/api/v1/integrations/conflicts'),
        ApiClient.get<ReconciliationReport[]>('/api/v1/integrations/reconciliation'),
      ]);

      if (provRes.data) setProviders(provRes.data);
      if (instRes.data) setInstances(instRes.data);
      if (syncRes.data) setSyncJobs(syncRes.data);
      if (mapRes.data) setMappings(mapRes.data);
      if (cnfRes.data) setConflicts(cnfRes.data);
      if (recRes.data) setReconciliations(recRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerSync = async (integrationId: string, entityType: string) => {
    setIsSyncing(true);
    try {
      const res = await ApiClient.post<any>('/api/v1/integrations/sync', {
        integrationId,
        entityType,
        mode: 'incremental',
        direction: 'bidirectional',
      });
      showToast(res.message || 'Sync job completed successfully!', 'success');
      await fetchData();
    } catch {
      showToast('Sync trigger failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    try {
      const res = await ApiClient.post<any>('/api/v1/integrations/instances', {
        action: 'test_connection',
        id,
      });
      showToast(res.message || 'Connection test successful!', 'success');
    } catch {
      showToast('Connection test failed', 'error');
    }
  };

  const handleTestTransform = async () => {
    try {
      const res = await ApiClient.post<any>('/api/v1/integrations/mappings', {
        action: 'test_transform',
        sampleInput: testInput,
        transformationType: testTransformType,
      });
      if (res.data) setTestOutput(res.data.output);
      showToast('Transformation preview updated!', 'success');
    } catch {
      showToast('Transformation preview failed', 'error');
    }
  };

  const handleResolveConflict = async (id: string, resolutionAction: string) => {
    try {
      const res = await ApiClient.post<any>('/api/v1/integrations/conflicts', {
        id,
        resolutionAction,
      });
      showToast(res.message || 'Conflict resolved!', 'success');
      await fetchData();
    } catch {
      showToast('Resolution failed', 'error');
    }
  };

  const handleRunReconciliation = async (category: string) => {
    try {
      const res = await ApiClient.post<any>('/api/v1/integrations/reconciliation', { category });
      showToast(res.message || 'Reconciliation audit completed!', 'success');
      await fetchData();
    } catch {
      showToast('Reconciliation run failed', 'error');
    }
  };

  const tabs = [
    { id: 'installed', label: 'Installed Connectors', count: instances.length },
    { id: 'marketplace', label: 'Connector Marketplace', count: providers.length },
    { id: 'sync_jobs', label: 'Sync Engine & Jobs', count: syncJobs.length },
    { id: 'mappings', label: 'Field Mappings', count: mappings.length },
    { id: 'conflicts', label: 'Conflict Studio', count: conflicts.filter(c => c.status === 'pending').length },
    { id: 'reconciliation', label: 'Reconciliation', count: reconciliations.length },
    { id: 'health', label: 'Health & Circuits' },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER & METRICS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0C0F17] p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest text-rose-400 flex items-center gap-1">
              <Cable className="w-3.5 h-3.5" />
              Universal Connector Platform
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              Module 30 Live
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Integration Hub &amp; Sync Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bi-directional synchronization, declarative field mapping, and discrepancy reconciliation across ERP, CRM, POS &amp; Accounting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTriggerSync('inst_netsuite_01', 'inventory')}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All Live'}</span>
          </button>
        </div>
      </div>

      {/* 2. STATS RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0F17] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Connected</span>
          <span className="text-xl font-black text-white">{instances.length}</span>
          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Active Connectors</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0C0F17] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Sync Success</span>
          <span className="text-xl font-black text-emerald-400">99.7%</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Zero Data Loss</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0C0F17] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Sync Jobs</span>
          <span className="text-xl font-black text-sky-400">{syncJobs.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Past 24h</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0C0F17] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Conflicts</span>
          <span className="text-xl font-black text-amber-400">{conflicts.filter(c => c.status === 'pending').length}</span>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">Awaiting Review</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0C0F17] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Reconciled Items</span>
          <span className="text-xl font-black text-indigo-400">2,830</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Ledger Balanced</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0C0F17] border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Circuit State</span>
          <span className="text-xl font-black text-emerald-400">CLOSED</span>
          <span className="text-[10px] text-emerald-300/80 block mt-0.5">Optimal Latency</span>
        </div>
      </div>

      {/* 3. TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as IntegrationTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                : 'bg-[#0C0F17] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB 1: INSTALLED CONNECTORS */}
      {activeTab === 'installed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instances.map((inst) => (
            <div key={inst.id} className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-base font-bold">{inst.name}</strong>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 uppercase">
                      {inst.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    Credentials Ref: {inst.credentialsRef}
                  </span>
                </div>

                <button
                  onClick={() => handleTestConnection(inst.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ping Remote</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Last Sync</span>
                  <span className="text-slate-300">
                    {inst.lastSyncAt ? new Date(inst.lastSyncAt).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Rate Limit Usage</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${inst.rateLimitUsagePercent}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-[10px]">{inst.rateLimitUsagePercent}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  Configured: {Object.keys(inst.configuration).join(', ')}
                </span>
                <button
                  onClick={() => handleTriggerSync(inst.id, 'inventory')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CONNECTOR MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((prov) => (
            <div key={prov.id} className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prov.iconBg} flex items-center justify-center font-bold text-white shadow-lg`}>
                    {prov.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] uppercase font-bold">
                    {prov.category}
                  </span>
                </div>

                <div>
                  <strong className="text-white text-base block font-bold">{prov.name}</strong>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prov.description}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Supported Sync Domains</span>
                  <div className="flex flex-wrap gap-1">
                    {prov.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[9px] border border-slate-800">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{prov.authType}</span>
                <button
                  onClick={() => showToast(`Opening installation wizard for ${prov.name}`, 'info')}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Install Connector
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SYNC JOBS */}
      {activeTab === 'sync_jobs' && (
        <div className="bg-[#0C0F17] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sync Job History &amp; Checkpoints</h3>
            <span className="text-xs text-slate-500">Atomic pagination &amp; recovery enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Integration</th>
                  <th className="p-3">Domain &amp; Mode</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Records Processed</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Checkpoint</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {syncJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/50">
                    <td className="p-3 text-rose-400 font-bold">{job.id}</td>
                    <td className="p-3 text-white font-sans font-bold">{job.integrationName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 uppercase text-[10px]">
                        {job.entityType} ({job.mode})
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 uppercase">{job.direction}</td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {job.successCount} / {job.processedCount}
                    </td>
                    <td className="p-3 text-slate-400">{job.durationMs}ms</td>
                    <td className="p-3 text-slate-500">{job.cursor || 'none'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase text-[9px] font-bold">
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FIELD MAPPINGS */}
      {activeTab === 'mappings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0C0F17] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Field Mappings</h3>
              <span className="text-xs text-slate-500">Declarative transformation schema</span>
            </div>

            <div className="p-4 divide-y divide-slate-800/80 space-y-3">
              {mappings.map((m) => (
                <div key={m.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                      {m.internalField}
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-slate-600" />
                    <div className="p-2 rounded bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800">
                      {m.externalField}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono uppercase">
                      {m.transformationType} {m.transformationParam ? `(${m.transformationParam})` : ''}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Valid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Transformation Tester */}
          <div className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Transformation Preview
            </h3>
            <p className="text-xs text-slate-400">
              Test deterministic transformations safely without arbitrary script execution risks.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sample Input Value</label>
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Transformation Function</label>
                <select
                  value={testTransformType}
                  onChange={(e) => setTestTransformType(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="uppercase">uppercase()</option>
                  <option value="lowercase">lowercase()</option>
                  <option value="trim">trim()</option>
                  <option value="currency_convert">currencyConvert(cents &rarr; $ USD)</option>
                  <option value="math_multiply">mathMultiply(factor: 0.01)</option>
                </select>
              </div>

              <button
                onClick={handleTestTransform}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Evaluate Transformation
              </button>

              {testOutput && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Computed Output</span>
                  <span className="font-mono text-xs text-emerald-200 block mt-1">{testOutput}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONFLICTS */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {conflicts.map((cnf) => (
            <div key={cnf.id} className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${cnf.status === 'pending' ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <strong className="text-white text-sm font-bold">
                    Conflict in {cnf.entityType}: {cnf.conflictField}
                  </strong>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    cnf.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {cnf.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Detected: {new Date(cnf.detectedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Internal Commerce Value ({cnf.internalId})</span>
                  <strong className="text-indigo-300 text-sm block mt-1">{cnf.internalValue}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">External Provider Value ({cnf.externalId})</span>
                  <strong className="text-amber-300 text-sm block mt-1">{cnf.externalValue}</strong>
                </div>
              </div>

              {cnf.status === 'pending' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleResolveConflict(cnf.id, 'internal_wins')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold text-xs cursor-pointer"
                  >
                    Keep Internal Value
                  </button>
                  <button
                    onClick={() => handleResolveConflict(cnf.id, 'external_wins')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/30 font-bold text-xs cursor-pointer"
                  >
                    Accept External Override
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reconciliations.map((rec) => (
            <div key={rec.id} className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-white text-base block font-bold capitalize">
                    {rec.category.replace(/_/g, ' ')}
                  </strong>
                  <span className="text-xs text-slate-500 font-mono">
                    Last run: {new Date(rec.lastRunAt).toLocaleTimeString()}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  rec.status === 'balanced'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {rec.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Checked</span>
                  <span className="text-white font-bold">{rec.totalChecked}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Matched</span>
                  <span className="text-emerald-400 font-bold">{rec.matchedCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Discrepancies</span>
                  <span className={`${rec.discrepancyCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                    {rec.discrepancyCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Missing Links</span>
                  <span className="text-slate-400">0</span>
                </div>
              </div>

              <button
                onClick={() => handleRunReconciliation(rec.category)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run Discrepancy Audit</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: HEALTH & CIRCUIT BREAKER */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Circuit Breaker &amp; Fault Tolerance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic circuit trip triggers if a remote provider encounters 5 consecutive 5xx errors or timeouts within a 60-second window, preventing cascading downstream latency.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">NetSuite Circuit</span>
                <span className="text-emerald-400 font-bold">CLOSED (0 errors)</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">QuickBooks Circuit</span>
                <span className="text-emerald-400 font-bold">CLOSED (0 errors)</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">ShipStation Circuit</span>
                <span className="text-emerald-400 font-bold">CLOSED (0 errors)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Tenant Isolation &amp; Dead-Letter Queue (DLQ)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Failed webhook events and malformed records are safely quarantined into the isolated tenant DLQ for inspection, retry, or permanent dismissal.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-white text-base font-bold">0 DLQ Items</span>
                <span className="text-slate-500 text-xs block">All sync queues operating smoothly</span>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                100% Ingested
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
