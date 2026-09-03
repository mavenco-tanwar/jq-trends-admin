'use client';

import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ArrowDown,
  Layers,
  Sparkles,
  Sliders,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import {
  AutomationWorkflowRecord,
  AutomationExecutionRecord,
} from '@/types/integration-hub.types';

export default function AutomationsPage() {
  const { showToast } = useToast();
  const [workflows, setWorkflows] = useState<AutomationWorkflowRecord[]>([]);
  const [executions, setExecutions] = useState<AutomationExecutionRecord[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflowRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'builder' | 'executions' | 'templates'>('workflows');
  const [isLoading, setIsLoading] = useState(true);

  // Dry run state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.get<{
        workflows: AutomationWorkflowRecord[];
        executions: AutomationExecutionRecord[];
      }>('/api/v1/integrations/automations');

      if (res.data) {
        setWorkflows(res.data.workflows);
        setExecutions(res.data.executions);
        if (res.data.workflows.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(res.data.workflows[0]);
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

  const handleDryRun = async () => {
    setIsTesting(true);
    try {
      const res = await ApiClient.post<any>('/api/v1/integrations/automations', {
        action: 'test_dry_run',
        workflowId: selectedWorkflow?.id,
      });
      if (res.data) {
        setTestResult(res.data);
      }
      showToast(res.message || 'Dry run simulation succeeded!', 'success');
    } catch {
      showToast('Simulation failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const templates = [
    {
      title: 'High-Value Order &rarr; NetSuite ERP & VIP Alert',
      trigger: 'Order Paid (> $500)',
      action: 'Create Sales Order + WhatsApp Alert',
      category: 'Finance & Loyalty',
    },
    {
      title: 'Low Stock Safeguard &rarr; Pause Marketplace SKU',
      trigger: 'Inventory (< 3 units)',
      action: 'Amazon / eBay SKU Unpublish',
      category: 'Inventory',
    },
    {
      title: 'Large Refund Approval Gate &rarr; Accounting Ledger',
      trigger: 'Refund Initiated (> $1,000)',
      action: 'Require Finance Sign-Off',
      category: 'Governance',
    },
    {
      title: 'Abandoned Checkout Recovery &rarr; Dynamic AI Coupon',
      trigger: 'Cart Inactive (1 Hour)',
      action: 'Send 10% Voucher via Klaviyo/Email',
      category: 'Marketing',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0C0F17] p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
              <Workflow className="w-3.5 h-3.5" />
              Automation Engine
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              Deterministic Logic
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">No-Code Automation &amp; Workflows</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Orchestrate WHEN &rarr; IF &rarr; THEN automated logic with approval gates, idempotency, and anti-loop recursion guards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('builder')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-950/40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* 2. TABS BAR */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'workflows'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-[#0C0F17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Active Workflows ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'builder'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-[#0C0F17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Visual Workflow Canvas
        </button>
        <button
          onClick={() => setActiveTab('executions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'executions'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-[#0C0F17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Execution History ({executions.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-[#0C0F17] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Pre-Built Templates
        </button>
      </div>

      {/* 3. WORKFLOWS LIST */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => {
                setSelectedWorkflow(wf);
                setActiveTab('builder');
              }}
              className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20 uppercase">
                    v{wf.version} {wf.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {wf.executionsCount24h} runs / 24h
                  </span>
                </div>

                <div>
                  <strong className="text-white text-base block font-bold group-hover:text-amber-400 transition-colors">
                    {wf.name}
                  </strong>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {wf.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <span className="text-[10px] uppercase font-bold text-slate-500">WHEN</span>
                    <span>{wf.trigger.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <span className="text-[10px] uppercase font-bold text-slate-500">IF</span>
                    <span>
                      {wf.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="text-[10px] uppercase font-bold text-slate-500">THEN</span>
                    <span>{wf.actions.map((a) => a.payloadSummary).join(' &rarr; ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Updated: {new Date(wf.updatedAt).toLocaleDateString()}</span>
                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Canvas &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. VISUAL WORKFLOW CANVAS */}
      {activeTab === 'builder' && selectedWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Viewport */}
          <div className="lg:col-span-2 bg-[#090C12] p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center space-y-4 relative overflow-hidden">
            <div className="w-full flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <strong className="text-white text-base block font-bold">{selectedWorkflow.name}</strong>
                <span className="text-xs text-slate-500">Visual Node Execution Graph</span>
              </div>
              <button
                onClick={handleDryRun}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTesting ? 'Simulating...' : 'Test Dry Run'}</span>
              </button>
            </div>

            {/* NODE 1: TRIGGER */}
            <div className="w-full max-w-md p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 to-rose-900/30 border border-rose-500/40 shadow-xl space-y-1">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] uppercase font-bold">
                1. Event Trigger
              </span>
              <strong className="text-white text-sm block font-bold">{selectedWorkflow.trigger.label}</strong>
              <span className="text-xs text-slate-400 font-mono">Event: {selectedWorkflow.trigger.event}</span>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-600 animate-bounce" />

            {/* NODE 2: CONDITIONS */}
            <div className="w-full max-w-md p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-amber-900/30 border border-amber-500/40 shadow-xl space-y-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] uppercase font-bold">
                2. Condition Gate
              </span>
              <strong className="text-white text-sm block font-bold">Evaluation Filter</strong>
              <div className="space-y-1 pt-1 font-mono text-xs text-slate-300">
                {selectedWorkflow.conditions.map((c, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950 border border-slate-800">
                    {c.field} <span className="text-amber-400 font-bold">{c.operator}</span> {c.value}
                  </div>
                ))}
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-600" />

            {/* NODE 3: ACTIONS */}
            {selectedWorkflow.actions.map((act, idx) => (
              <React.Fragment key={act.id}>
                <div className="w-full max-w-md p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 border border-emerald-500/40 shadow-xl space-y-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] uppercase font-bold">
                    3.{idx + 1} Action &rarr; {act.type.replace(/_/g, ' ')}
                  </span>
                  <strong className="text-white text-sm block font-bold">{act.target}</strong>
                  <span className="text-xs text-slate-400 font-mono">{act.payloadSummary}</span>
                </div>
                {idx < selectedWorkflow.actions.length - 1 && (
                  <ArrowDown className="w-5 h-5 text-slate-600" />
                )}
              </React.Fragment>
            ))}

            <ArrowDown className="w-5 h-5 text-slate-600" />

            {/* NODE 4: END */}
            <div className="w-full max-w-md p-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs text-slate-500">
              Workflow Complete &amp; State Persisted
            </div>
          </div>

          {/* Configuration & Simulation Drawer */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Workflow Properties
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Idempotency Key</span>
                  <span className="font-mono text-slate-300">sha256(tenant + eventId + step)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Anti-Loop Recursion Protection</span>
                  <span className="font-mono text-emerald-400">Max Depth: 5 executions/min</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Error Handling</span>
                  <span className="font-mono text-slate-300">Exponential Backoff &rarr; Tenant DLQ</span>
                </div>
              </div>
            </div>

            {testResult && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dry Run Trace ({testResult.totalDurationMs}ms)
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {testResult.simulatedSteps.map((s: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-emerald-500/20 flex justify-between items-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{s.step}</span>
                        <span className="text-emerald-200">{s.output}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-bold">
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. EXECUTION LOGS */}
      {activeTab === 'executions' && (
        <div className="bg-[#0C0F17] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workflow Execution Trace Stream</h3>
            <span className="text-xs text-slate-500">Atomic step trace &amp; latency tracking</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Execution ID</th>
                  <th className="p-3">Workflow Name</th>
                  <th className="p-3">Trigger Ingested</th>
                  <th className="p-3">Pipeline Trace</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-900/50">
                    <td className="p-3 text-amber-400 font-bold">{exec.id}</td>
                    <td className="p-3 text-white font-sans font-bold">{exec.workflowName}</td>
                    <td className="p-3 text-slate-300">{exec.triggerEvent}</td>
                    <td className="p-3 text-slate-400 font-sans text-xs">{exec.stepsSummary}</td>
                    <td className="p-3 text-slate-400">{exec.durationMs}ms</td>
                    <td className="p-3 text-slate-500">{new Date(exec.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border uppercase text-[9px] font-bold ${
                        exec.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {exec.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TEMPLATES GALLERY */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] uppercase font-bold">
                  {tpl.category}
                </span>
                <strong className="text-white text-base block font-bold">{tpl.title}</strong>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div><span className="text-slate-500">WHEN:</span> <span className="text-slate-300">{tpl.trigger}</span></div>
                  <div><span className="text-slate-500">THEN:</span> <span className="text-emerald-300">{tpl.action}</span></div>
                </div>
              </div>

              <button
                onClick={() => showToast(`Template installed! Opening canvas...`, 'success')}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
