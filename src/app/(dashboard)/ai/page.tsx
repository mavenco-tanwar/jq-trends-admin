'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Bot,
  MessageSquare,
  TrendingUp,
  Package,
  ShieldCheck,
  Zap,
  Layers,
  Wand2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Send,
  Lock,
  Search,
  Sliders,
  DollarSign,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import {
  AIOverviewStats,
  AIModelDefinition,
  AIRecommendationConfig,
  AIContentDraft,
  DemandForecastRecord,
  AIAgentDefinition,
  AIToolExecutionRecord,
  AIStoreAssistantConfig,
  AIInsightRecord,
  AIModerationRecord,
} from '@/types/ai-intelligence.types';

export default function AIIntelligenceStudioPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'recommendations' | 'content' | 'forecasting' | 'agents' | 'assistant' | 'insights' | 'moderation'
  >('overview');

  const [stats, setStats] = useState<AIOverviewStats>({
    totalTokensUsed: 1420500,
    monthlyTokenBudget: 3500000,
    aiRevenueAttributedMinor: 3480000,
    forecastAccuracyPercentage: 94.2,
    activeAgentsCount: 3,
    supportDeflectionRate: 68.4,
    estimatedCostMinor: 4260,
    currency: 'USD',
  });

  const [models, setModels] = useState<AIModelDefinition[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendationConfig[]>([]);
  const [drafts, setDrafts] = useState<AIContentDraft[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecastRecord[]>([]);
  const [agents, setAgents] = useState<AIAgentDefinition[]>([]);
  const [executions, setExecutions] = useState<AIToolExecutionRecord[]>([]);
  const [assistantConfig, setAssistantConfig] = useState<AIStoreAssistantConfig | null>(null);
  const [insights, setInsights] = useState<AIInsightRecord[]>([]);
  const [moderations, setModerations] = useState<AIModerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Content Generation Form
  const [genProductTitle, setGenProductTitle] = useState('');
  const [genProductSku, setGenProductSku] = useState('');
  const [genField, setGenField] = useState<'description' | 'seo_title' | 'bullet_points'>('description');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // Storefront Assistant Simulator
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; citations?: string[] }>>([
    {
      role: 'assistant',
      text: 'Welcome to Lumina Luxury Concierge. How may I assist you with sizing, materials, or delivery timelines today?',
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Copilot Ask
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotAnswer, setCopilotAnswer] = useState<string | null>(null);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usageRes, recRes, draftRes, fcRes, agtRes, astRes, insRes, modRes] = await Promise.all([
        ApiClient.get<any>('/api/v1/ai/usage'),
        ApiClient.get<any>('/api/v1/ai/recommendations'),
        ApiClient.get<any>('/api/v1/ai/content'),
        ApiClient.get<any>('/api/v1/ai/forecasting'),
        ApiClient.get<any>('/api/v1/ai/agents'),
        ApiClient.get<any>('/api/v1/ai/assistant'),
        ApiClient.get<any>('/api/v1/ai/insights'),
        ApiClient.get<any>('/api/v1/ai/moderation'),
      ]);

      if (usageRes.data?.stats) setStats(usageRes.data.stats);
      if (usageRes.data?.models) setModels(usageRes.data.models);
      if (recRes.data) setRecommendations(recRes.data);
      if (draftRes.data) setDrafts(draftRes.data);
      if (fcRes.data) setForecasts(fcRes.data);
      if (agtRes.data?.agents) setAgents(agtRes.data.agents);
      if (agtRes.data?.executions) setExecutions(agtRes.data.executions);
      if (astRes.data) setAssistantConfig(astRes.data);
      if (insRes.data) setInsights(insRes.data);
      if (modRes.data) setModerations(modRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genProductTitle) {
      showToast('Please specify a product title', 'error');
      return;
    }
    setIsGeneratingContent(true);
    try {
      await ApiClient.post<any>('/api/v1/ai/content', {
        productTitle: genProductTitle,
        productSku: genProductSku || 'SKU-NEW',
        field: genField,
      });
      showToast('AI Content generated & queued for approval!', 'success');
      setGenProductTitle('');
      setGenProductSku('');
      await fetchData();
    } catch {
      showToast('Content generation failed', 'error');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleApproveDraft = async (id: string) => {
    try {
      await ApiClient.patch<any>('/api/v1/ai/content', { id, status: 'approved' });
      showToast('Draft approved and published to catalog!', 'success');
      await fetchData();
    } catch {
      showToast('Failed to approve draft', 'error');
    }
  };

  const handleAgentApproval = async (executionId: string, action: 'approve' | 'reject') => {
    try {
      await ApiClient.post<any>('/api/v1/ai/agents', { executionId, action });
      showToast(`Agent action ${action === 'approve' ? 'approved' : 'rejected'}!`, 'success');
      await fetchData();
    } catch {
      showToast('Failed to process agent approval', 'error');
    }
  };

  const handleToggleRecommendation = async (id: string, currentEnabled: boolean) => {
    try {
      await ApiClient.patch<any>('/api/v1/ai/recommendations', { id, enabled: !currentEnabled });
      showToast('Recommendation strategy updated!', 'success');
      await fetchData();
    } catch {
      showToast('Failed to update strategy', 'error');
    }
  };

  const handleSendAssistantChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userText = chatQuery;
    setChatQuery('');
    setChatHistory((prev) => [...prev, { role: 'user', text: userText }]);
    setIsSendingChat(true);

    try {
      const res = await ApiClient.post<any>('/api/v1/ai/assistant', { query: userText });
      if (res.data?.reply) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', text: res.data.reply, citations: res.data.citations },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'I am currently operating in offline mode. Please contact human support.' },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;

    setIsCopilotThinking(true);
    setCopilotAnswer(null);

    setTimeout(() => {
      if (copilotQuestion.toLowerCase().includes('stock') || copilotQuestion.toLowerCase().includes('inventory')) {
        setCopilotAnswer('Lumina Hero SKU (Midnight Silk Gown) has 14 units remaining. At current run rate (2.1/day), stockout is projected in 8 days. Reorder of 50 units recommended.');
      } else if (copilotQuestion.toLowerCase().includes('revenue') || copilotQuestion.toLowerCase().includes('sales')) {
        setCopilotAnswer('Trailing 30-day revenue is $489.2k (+18.4% velocity). AI recommendations drove $34,800 (7.1% of GMV) with a 14.8% PDP conversion rate.');
      } else {
        setCopilotAnswer(`Analysis complete: Trailing conversion is healthy at 4.82%. 3 Autonomous AI agents are active with 0 security exceptions.`);
      }
      setIsCopilotThinking(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER & COPILOT */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0C0F17] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest text-rose-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Intelligence Layer
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              {stats.activeAgentsCount} Agents Online
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">AI-Powered Commerce Intelligence Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalization, demand forecasting, autonomous agents, RAG shopping assistants &amp; merchandising copilot.
          </p>
        </div>

        {/* Quick Copilot Box */}
        <form onSubmit={handleAskCopilot} className="w-full lg:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask Copilot (e.g. Stockout risk on silk gowns?)..."
              value={copilotQuestion}
              onChange={(e) => setCopilotQuestion(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
            <Bot className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isCopilotThinking}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {isCopilotThinking ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </div>

      {/* Copilot Answer Display */}
      {copilotAnswer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-indigo-950/30 to-slate-950 border border-rose-500/30 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Copilot Synthesis &amp; Diagnostic Insight</span>
          </div>
          <p className="text-slate-200">{copilotAnswer}</p>
        </div>
      )}

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Token Meter</span>
          <span className="text-xl font-mono font-black text-indigo-400">
            {(stats.totalTokensUsed / 1000000).toFixed(2)}M / 3.5M
          </span>
          <span className="text-[10px] text-slate-500 font-bold block">40.5% budget used</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Revenue Lift</span>
          <span className="text-xl font-mono font-black text-emerald-400">
            ${(stats.aiRevenueAttributedMinor / 100).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block">+7.1% of GMV</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Forecast Accuracy</span>
          <span className="text-xl font-mono font-black text-white">{stats.forecastAccuracyPercentage}%</span>
          <span className="text-[10px] text-emerald-400 font-bold block">90-day backtest</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Support Deflection</span>
          <span className="text-xl font-mono font-black text-white">{stats.supportDeflectionRate}%</span>
          <span className="text-[10px] text-indigo-400 font-bold block">Automated resolution</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active AI Agents</span>
          <span className="text-xl font-mono font-black text-amber-400">{stats.activeAgentsCount} Fleet</span>
          <span className="text-[10px] text-slate-400 font-bold block">0 security alerts</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Est. Cost</span>
          <span className="text-xl font-mono font-black text-rose-400">
            ${(stats.estimatedCostMinor / 100).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 font-bold block">Trailing 30 days</span>
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
          <Cpu className="w-3.5 h-3.5" />
          <span>Intelligence Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'recommendations'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Content &amp; SEO Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('forecasting')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'forecasting'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Demand Forecasting</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Autonomous Agents</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Shopping Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Merchandising Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'moderation'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Moderation &amp; Safety</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & MODELS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              <span>Registered Multi-Model AI Routing Pool</span>
            </h3>

            <div className="space-y-3">
              {models.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white text-sm">{m.displayName}</strong>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {m.provider.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {m.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Task Routing: {m.taskTypes.join(', ')} • Context Limit: {(m.contextLimitTokens / 1000).toFixed(0)}k tokens
                    </div>
                  </div>

                  <span className="font-mono font-bold text-slate-300 text-right">
                    ${(m.costPer1kTokensMinor / 1000).toFixed(4)} / 1k tokens
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">AI Governance &amp; Safeguards</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Tenant Context Isolation</strong>
                  <p className="text-[11px] text-slate-400">Strict zero cross-tenant knowledge access enforced at middleware layer.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Deterministic Commerce Authority</strong>
                  <p className="text-[11px] text-slate-400">AI cannot mutate financial ledgers, payment states, or live prices directly.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">PII Redaction Guard</strong>
                  <p className="text-[11px] text-slate-400">Payment credentials, CVV, and customer contact data masked before inference.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">AI Product Recommendations &amp; Personalization</h3>
            <p className="text-xs text-slate-400">Configure placement strategies, minimum candidate confidence, and inventory availability filtering.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Placement</th>
                  <th className="p-3.5">Strategy</th>
                  <th className="p-3.5">Min Confidence</th>
                  <th className="p-3.5">Fallback Policy</th>
                  <th className="p-3.5">CTR Lift</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-white font-sans font-bold capitalize">{rec.placement}</td>
                    <td className="p-3.5 text-slate-300 font-sans capitalize">{rec.strategy.replace(/_/g, ' ')}</td>
                    <td className="p-3.5 text-indigo-400 font-bold">{(rec.minConfidence * 100).toFixed(0)}%</td>
                    <td className="p-3.5 text-slate-400 font-sans capitalize">{rec.fallbackStrategy.replace(/_/g, ' ')}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">+{rec.clickThroughRatePercentage}%</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleRecommendation(rec.id, rec.enabled)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          rec.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rec.enabled ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT & SEO */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Generate Product Copy &amp; SEO Tags</h3>
              <p className="text-xs text-slate-400">Produce grounded, fact-checked descriptions adhering to luxury brand voice guidelines.</p>
            </div>

            <form onSubmit={handleGenerateContent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cashmere Tailored Overcoat"
                  value={genProductTitle}
                  onChange={(e) => setGenProductTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">SKU Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. LUM-OC-009"
                    value={genProductSku}
                    onChange={(e) => setGenProductSku(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Content Field</label>
                  <select
                    value={genField}
                    onChange={(e: any) => setGenField(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="description">Product Description</option>
                    <option value="seo_title">SEO Title &amp; Metadata</option>
                    <option value="bullet_points">Feature Bullet Points</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingContent}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isGeneratingContent ? 'Synthesizing Copy...' : 'Generate AI Copy Draft'}</span>
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Pending Draft Approvals</h3>
            <div className="space-y-3">
              {drafts.map((d) => (
                <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-white block font-bold">{d.productTitle}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">{d.productSku} • {d.field.toUpperCase()}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    &quot;{d.generatedValue}&quot;
                  </p>

                  {d.status === 'draft' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleApproveDraft(d.id)}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Approve &amp; Publish
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEMAND FORECASTING */}
      {activeTab === 'forecasting' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Predictive Demand Forecasting &amp; Replenishment Planner</h3>
            <p className="text-xs text-slate-400">90-day probabilistic velocity models, stockout risk flags, and automated reorder triggers.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">SKU &amp; Product</th>
                  <th className="p-3.5">Stock on Hand</th>
                  <th className="p-3.5">30-Day Demand</th>
                  <th className="p-3.5">90-Day Demand</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Recommendation</th>
                  <th className="p-3.5 text-right">Reorder Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {forecasts.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-sans">
                      <strong className="text-white block">{f.productTitle}</strong>
                      <span className="text-slate-500 text-[11px]">{f.sku} • {f.category}</span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-bold">{f.currentStockOnHand}</td>
                    <td className="p-3.5 text-white">{f.predictedDemand30d}</td>
                    <td className="p-3.5 text-white">{f.predictedDemand90d}</td>
                    <td className="p-3.5 text-indigo-400 font-bold">{(f.confidenceScore * 100).toFixed(0)}%</td>
                    <td className="p-3.5 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          f.reorderRecommendation === 'urgent_reorder'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : f.reorderRecommendation === 'reorder_soon'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {f.reorderRecommendation.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      {f.reorderUnits > 0 ? `+${f.reorderUnits} units` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUTONOMOUS AGENTS */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Autonomous AI Agents Fleet</span>
            </h3>

            <div className="space-y-3">
              {agents.map((ag) => (
                <div key={ag.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="text-white text-sm">{ag.name}</strong>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      {ag.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{ag.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Allowed Tools: {ag.allowedTools.join(', ')} • Executions: {ag.totalExecutions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Agent Tool Execution Audit &amp; Approvals</h3>
            <div className="space-y-3">
              {executions.map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-white block font-bold">{ex.agentName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">Tool: {ex.toolName} ({ex.riskLevel})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        ex.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : ex.status === 'pending_approval'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  <div className="text-slate-300 text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
                    <strong>Input:</strong> {ex.inputSummary}
                    <br />
                    <strong>Outcome:</strong> {ex.outputSummary}
                  </div>

                  {ex.status === 'pending_approval' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleAgentApproval(ex.id, 'approve')}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Authorize Mutation
                      </button>
                      <button
                        onClick={() => handleAgentApproval(ex.id, 'reject')}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SHOPPING ASSISTANT SIMULATOR */}
      {activeTab === 'assistant' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                <span>Storefront Shopping Assistant (RAG Grounded)</span>
              </h3>
              <p className="text-xs text-slate-400">Simulate customer product inquiries, size guidance, and shipping policies.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              Online • Luxury Concierge Tone
            </span>
          </div>

          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.citations && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                      Citations: {msg.citations.join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendAssistantChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask assistant: 'Is the midnight gown in stock?', 'What is your shipping policy?'..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSendingChat}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: MERCHANDISING INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Daily Merchandising &amp; Catalog Insights</h3>
          <div className="space-y-3">
            {insights.map((ins) => (
              <div key={ins.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        ins.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {ins.severity} SEVERITY
                    </span>
                    <strong className="text-white text-sm">{ins.title}</strong>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-mono font-bold">
                    {(ins.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <p className="text-slate-300">{ins.summary}</p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>Actionable Step:</strong> {ins.actionableRecommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">AI Content Moderation &amp; UGC Screening</h3>
            <p className="text-xs text-slate-400">Automated screening for spam, toxic comments, phishing links, and unauthorized product claims.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Author &amp; Type</th>
                  <th className="p-3.5">Content Snippet</th>
                  <th className="p-3.5">Safety Score</th>
                  <th className="p-3.5">Flagged Categories</th>
                  <th className="p-3.5 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {moderations.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-sans">
                      <strong className="text-white block">{mod.authorName}</strong>
                      <span className="text-slate-500 text-[11px] uppercase">{mod.entityType}</span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-sans italic max-w-xs truncate">&quot;{mod.contentSnippet}&quot;</td>
                    <td className="p-3.5 font-bold text-indigo-400">{(mod.safetyScore * 100).toFixed(0)}%</td>
                    <td className="p-3.5 font-sans text-rose-400 font-bold">
                      {mod.flaggedCategories.length > 0 ? mod.flaggedCategories.join(', ') : 'None (Safe)'}
                    </td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          mod.decision === 'auto_approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : mod.decision === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {mod.decision.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
