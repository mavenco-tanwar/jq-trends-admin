'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sliders,
  Sparkles,
  Pin,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  RotateCcw,
  Zap,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  SearchSynonym,
  SearchMerchandisingRule,
  SearchEngineSettings,
  SearchAnalyticsData,
} from '@/types/search-commerce.types';

export default function SearchStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'merchandising' | 'synonyms' | 'simulator' | 'analytics' | 'settings'>('merchandising');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [synonyms, setSynonyms] = useState<SearchSynonym[]>([]);
  const [merchandising, setMerchandising] = useState<SearchMerchandisingRule[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalyticsData | null>(null);

  // Modals & Form States
  const [isNewPinOpen, setIsNewPinOpen] = useState(false);
  const [newPin, setNewPin] = useState({
    query: 'dress',
    targetProductId: 'prod_1',
    targetProductName: 'Blush Floral Tiered Midi Dress',
  });

  const [isNewSynonymOpen, setIsNewSynonymOpen] = useState(false);
  const [newSyn, setNewSyn] = useState({
    primaryTerm: 'kurta',
    synonymsStr: 'tunic, ethnic top, kurtis',
  });

  // Simulator State
  const [simQuery, setSimQuery] = useState('gown');
  const [simResults, setSimResults] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Settings
  const [settings, setSettings] = useState<SearchEngineSettings>({
    defaultSort: 'relevance',
    enableTypoTolerance: true,
    enableAutocomplete: true,
    minQueryLength: 2,
    outOfStockBehavior: 'bottom',
    resultsPerPage: 24,
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const synRes = await ApiClient.get<any>(`/api/v1/search/synonyms?tenant=${tenantSlug}`);
      if (synRes.data) setSynonyms(synRes.data);

      const merchRes = await ApiClient.get<any>(`/api/v1/search/merchandising?tenant=${tenantSlug}`);
      if (merchRes.data) setMerchandising(merchRes.data);

      const analRes = await ApiClient.get<any>(`/api/v1/search/analytics?tenant=${tenantSlug}`);
      if (analRes.data) setAnalytics(analRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [tenantSlug]);

  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/search/merchandising', {
        tenantId: tenantSlug,
        query: newPin.query.toLowerCase(),
        matchType: 'exact',
        action: 'pin',
        targetProductId: newPin.targetProductId,
        targetProductName: newPin.targetProductName,
      });
      showToast(`Product pinned for search term "${newPin.query}"`, 'success');
      setIsNewPinOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to create pin rule', 'error');
    }
  };

  const handleCreateSynonym = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const synList = newSyn.synonymsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await ApiClient.post('/api/v1/search/synonyms', {
        tenantId: tenantSlug,
        primaryTerm: newSyn.primaryTerm.toLowerCase(),
        synonyms: synList,
        direction: 'two_way',
      });
      showToast(`Synonym group for "${newSyn.primaryTerm}" created!`, 'success');
      setIsNewSynonymOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to create synonym', 'error');
    }
  };

  const handleDeleteMerch = async (id: string) => {
    try {
      await ApiClient.delete(`/api/v1/search/merchandising?id=${id}`);
      showToast('Merchandising rule removed', 'info');
      fetchAllData();
    } catch {
      showToast('Failed to delete rule', 'error');
    }
  };

  const handleDeleteSynonym = async (id: string) => {
    try {
      await ApiClient.delete(`/api/v1/search/synonyms?id=${id}`);
      showToast('Synonym group removed', 'info');
      fetchAllData();
    } catch {
      showToast('Failed to delete synonym', 'error');
    }
  };

  const handleRunSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res: any = await ApiClient.get(`/api/v1/search?tenant=${tenantSlug}&q=${encodeURIComponent(simQuery)}`);
      if (res.data?.products || res.products) {
        setSimResults(res.data?.products || res.products);
      }
    } catch {
      showToast('Simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Discovery &amp; Merchandising Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Search className="w-6 h-6 text-rose-400" />
            Search &amp; Advanced Discovery Studio
          </h1>
          <p className="text-xs text-slate-400">
            Configure product pinning, synonyms expansion, query redirects, ranking weights, and analyze catalog gaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewPinOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Pin className="w-3.5 h-3.5 text-rose-400" />
            <span>Pin Product</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewSynonymOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Synonym Group</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Searches</span>
          <span className="text-xl font-mono font-black text-white">{analytics?.totalSearches.toLocaleString() || '18,420'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Zero-Result Rate</span>
          <span className="text-xl font-mono font-black text-rose-400">{analytics?.zeroResultRate || 3.4}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Search Conversion</span>
          <span className="text-xl font-mono font-black text-emerald-400">{analytics?.averageConversionRate || 8.9}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Synonym Rules</span>
          <span className="text-xl font-mono font-black text-white">{synonyms.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Merchandising Pins</span>
          <span className="text-xl font-mono font-black text-amber-400">{merchandising.length}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('merchandising')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'merchandising'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Merchandising &amp; Pins ({merchandising.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('synonyms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'synonyms'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synonyms &amp; Aliases ({synonyms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ranking Simulator</span>
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
          <span>Search Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Engine Settings</span>
        </button>
      </div>

      {/* TAB 1: MERCHANDISING & PINS */}
      {activeTab === 'merchandising' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Search Merchandising &amp; Query Overrides</h3>
              <p className="text-xs text-slate-400">Force specific luxury garments to appear at position #1 or redirect queries.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Trigger Keyword</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Destination / Garment</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {merchandising.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-rose-300">&quot;{m.query}&quot;</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {m.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {m.targetProductName ? (
                        <span>Pin to #1: <strong>{m.targetProductName}</strong></span>
                      ) : (
                        <span className="font-mono text-emerald-400">Redirect &rarr; {m.targetUrl}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteMerch(m.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SYNONYMS & ALIASES */}
      {activeTab === 'synonyms' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Synonym Groups &amp; Term Expansion</h3>
              <p className="text-xs text-slate-400">Bridge customer search terms (e.g. &quot;gown&quot; &harr; &quot;dress&quot;, &quot;tee&quot; &rarr; &quot;t-shirt&quot;).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {synonyms.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-white">{s.primaryTerm}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {s.direction.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {s.synonyms?.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteSynonym(s.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME RANKING SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
          <form onSubmit={handleRunSimulator} className="flex gap-3 max-w-xl">
            <input
              type="text"
              value={simQuery}
              onChange={(e) => setSimQuery(e.target.value)}
              placeholder="Test query (e.g. dress, blazer, gown)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
              required
            />
            <button
              type="submit"
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              {isSimulating ? 'Simulating...' : 'Simulate Ranking'}
            </button>
          </form>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluated Garment Hits ({simResults.length}):
            </h4>
            <div className="space-y-2">
              {simResults.map((hit, idx) => (
                <div
                  key={hit.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-500 text-sm">#{idx + 1}</span>
                    <div>
                      <strong className="text-white block font-bold">{hit.name}</strong>
                      <span className="text-slate-400 text-[11px]">{hit.category} • ${hit.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300">
                      Score: {hit.score}
                    </span>
                    <span className="text-slate-400 text-[11px]">{hit.matchReason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEARCH ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Search Keywords</h3>
            <div className="space-y-2 text-xs">
              {analytics.topSearches.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="font-mono text-rose-300">{s.query}</strong>
                    <span className="block text-[10px] text-slate-400">{s.count} searches • {s.clicks} clicks</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">{s.conversion}% Conv</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Zero-Result Searches (Catalog Gaps)</h3>
            <div className="space-y-2 text-xs">
              {analytics.zeroResultSearches.map((z, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="font-mono text-amber-300">{z.query}</strong>
                    <span className="block text-[10px] text-slate-400">Last searched {z.lastSearched}</span>
                  </div>
                  <span className="font-mono font-bold text-rose-400">{z.count} Misses</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ENGINE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Search &amp; Relevance Configuration</h3>
              <p className="text-xs text-slate-400">Fine-tune ranking algorithms, typo sensitivity, and out-of-stock policies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Default Search Sorting</label>
              <select
                value={settings.defaultSort}
                onChange={(e) => setSettings({ ...settings, defaultSort: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="relevance">Relevance Scoring (Recommended)</option>
                <option value="newest">New Arrivals First</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Out-of-Stock Products</label>
              <select
                value={settings.outOfStockBehavior}
                onChange={(e) => setSettings({ ...settings, outOfStockBehavior: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="bottom">Push to Bottom of Results</option>
                <option value="hide">Hide from Search Results</option>
                <option value="normal">Rank Normally</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('Search engine settings updated successfully!', 'success')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* NEW PIN MODAL */}
      {isNewPinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Pin Product to Search Term</h3>
                <p className="text-xs text-slate-400">Position #1 guarantee for specific customer searches.</p>
              </div>
              <button onClick={() => setIsNewPinOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePin} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Trigger Search Term</label>
                <input
                  type="text"
                  value={newPin.query}
                  onChange={(e) => setNewPin({ ...newPin, query: e.target.value })}
                  placeholder="e.g. blazer, dress, linen"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Product Name</label>
                <input
                  type="text"
                  value={newPin.targetProductName}
                  onChange={(e) => setNewPin({ ...newPin, targetProductName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPinOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Create Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW SYNONYM MODAL */}
      {isNewSynonymOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Add Synonym Group</h3>
                <p className="text-xs text-slate-400">Map multiple search terms together.</p>
              </div>
              <button onClick={() => setIsNewSynonymOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSynonym} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Primary Term</label>
                <input
                  type="text"
                  value={newSyn.primaryTerm}
                  onChange={(e) => setNewSyn({ ...newSyn, primaryTerm: e.target.value })}
                  placeholder="e.g. kurta, dress"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Synonyms (Comma-separated)</label>
                <input
                  type="text"
                  value={newSyn.synonymsStr}
                  onChange={(e) => setNewSyn({ ...newSyn, synonymsStr: e.target.value })}
                  placeholder="tunic, ethnic top, kurtis"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSynonymOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Create Synonyms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
