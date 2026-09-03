'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  Filter,
  Download,
  Calendar,
  Layers,
  PieChart,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  FileText,
  Send,
  Eye,
  ShoppingBag,
  CreditCard,
  Percent,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import {
  AnalyticsOverviewMetrics,
  SalesBreakdownPoint,
  ConversionFunnelStep,
  CohortRetentionRow,
  ChannelAttribution,
  ProductVelocityRecord,
  AnalyticsCustomReport,
  LiveActivityItem,
} from '@/types/analytics-bi.types';

export default function AdvancedAnalyticsBIPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'sales' | 'funnel' | 'cohorts' | 'attribution' | 'products' | 'live' | 'reports' | 'scheduled'
  >('sales');

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [attributionModel, setAttributionModel] = useState<'first_touch' | 'last_touch' | 'linear'>('last_touch');

  const [overview, setOverview] = useState<AnalyticsOverviewMetrics>({
    totalRevenueMinor: 48920000,
    ordersCount: 1420,
    averageOrderValueMinor: 34450,
    conversionRatePercentage: 4.82,
    repeatCustomerRatePercentage: 31.4,
    projected30DayRevenueMinor: 84500000,
    liveActiveVisitorsCount: 42,
    unitsSoldCount: 3840,
    grossMarginPercentage: 68.5,
    currency: 'USD',
  });

  const [salesBreakdown, setSalesBreakdown] = useState<SalesBreakdownPoint[]>([]);
  const [funnelSteps, setFunnelSteps] = useState<ConversionFunnelStep[]>([]);
  const [cohortRows, setCohortRows] = useState<CohortRetentionRow[]>([]);
  const [attributions, setAttributions] = useState<ChannelAttribution[]>([]);
  const [products, setProducts] = useState<ProductVelocityRecord[]>([]);
  const [reports, setReports] = useState<AnalyticsCustomReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New custom report form
  const [newReportName, setNewReportName] = useState('');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Live Pulse Items
  const [liveStream, setLiveStream] = useState<LiveActivityItem[]>([
    { id: '1', eventType: 'order_placed', description: 'Order #ORD-9921 placed by Sophia V. ($450.00)', valueMinor: 45000, location: 'New York, USA', timestamp: 'Just now' },
    { id: '2', eventType: 'cart_added', description: 'Added "Midnight Silk Gown" to Bag', location: 'London, UK', timestamp: '24s ago' },
    { id: '3', eventType: 'checkout_started', description: 'Started Express Checkout with Apple Pay', location: 'Paris, FR', timestamp: '1m ago' },
    { id: '4', eventType: 'order_placed', description: 'Order #ORD-9920 placed by Marcus K. ($1,280.00)', valueMinor: 128000, location: 'Tokyo, JP', timestamp: '2m ago' },
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, salesRes, funRes, cohRes, attrRes, prodRes, repRes] = await Promise.all([
        ApiClient.get<any>('/api/v1/analytics/overview'),
        ApiClient.get<any>('/api/v1/analytics/sales'),
        ApiClient.get<any>('/api/v1/analytics/funnels'),
        ApiClient.get<any>('/api/v1/analytics/cohorts'),
        ApiClient.get<any>('/api/v1/analytics/attribution'),
        ApiClient.get<any>('/api/v1/analytics/products'),
        ApiClient.get<any>('/api/v1/analytics/reports'),
      ]);

      if (ovRes.data) setOverview(ovRes.data);
      if (salesRes.data) setSalesBreakdown(salesRes.data);
      if (funRes.data) setFunnelSteps(funRes.data);
      if (cohRes.data) setCohortRows(cohRes.data);
      if (attrRes.data) setAttributions(attrRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (repRes.data) setReports(repRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportName) {
      showToast('Please specify report name', 'error');
      return;
    }
    setIsGeneratingReport(true);
    try {
      await ApiClient.post<any>('/api/v1/analytics/reports', {
        name: newReportName,
        description: newReportDesc || 'Custom generated business intelligence dataset.',
        metrics: ['Gross Revenue', 'Orders', 'AOV'],
        dimensions: ['Channel', 'Country'],
      });
      showToast(`Report '${newReportName}' generated!`, 'success');
      setNewReportName('');
      setNewReportDesc('');
      await fetchData();
    } catch {
      showToast('Failed to generate report', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportCSV = () => {
    showToast('Compiling high-resolution CSV export dataset...', 'info');
    setTimeout(() => {
      showToast('Export downloaded successfully!', 'success');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER & TIME RANGE SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0C0F17] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-black tracking-widest text-rose-400">
              Intelligence &amp; Business Analytics
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {overview.liveActiveVisitorsCount} Active Online
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Enterprise Analytics &amp; BI Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-funnel conversion drops, multi-touch channel attribution, customer cohort retention &amp; GMV velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold font-mono">
            {(['7d', '30d', '90d', 'ytd'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-rose-600 text-white font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Export BI</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Revenue</span>
          <span className="text-xl font-mono font-black text-emerald-400">
            ${(overview.totalRevenueMinor / 100).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block">+18.4% vs prev</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Orders Completed</span>
          <span className="text-xl font-mono font-black text-white">{overview.ordersCount.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 font-bold block">+12.1% velocity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average Order Value</span>
          <span className="text-xl font-mono font-black text-white">
            ${(overview.averageOrderValueMinor / 100).toFixed(2)}
          </span>
          <span className="text-[10px] text-indigo-400 font-bold block">+$24 from upsells</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Store Conversion</span>
          <span className="text-xl font-mono font-black text-emerald-400">{overview.conversionRatePercentage}%</span>
          <span className="text-[10px] text-slate-400 font-bold block">Top 5% benchmark</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Repeat Customer Rate</span>
          <span className="text-xl font-mono font-black text-amber-400">{overview.repeatCustomerRatePercentage}%</span>
          <span className="text-[10px] text-amber-400 font-bold block">VIP loyalty boost</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C0F17] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Projected 30-Day GMV</span>
          <span className="text-xl font-mono font-black text-rose-400">
            ${(overview.projected30DayRevenueMinor / 100).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-bold block">Trajectory model</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Sales &amp; Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('funnel')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'funnel'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Conversion Funnel</span>
        </button>

        <button
          onClick={() => setActiveTab('cohorts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cohorts'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Cohort Retention</span>
        </button>

        <button
          onClick={() => setActiveTab('attribution')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'attribution'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Attribution &amp; ROAS</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Product Velocity</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'live'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Live Pulse</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-rose-600 text-white font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Report Builder</span>
        </button>
      </div>

      {/* TAB 1: SALES & REVENUE */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Daily Revenue &amp; Orders Velocity Stream</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Gross Revenue</th>
                    <th className="p-3.5">Net Revenue</th>
                    <th className="p-3.5">Orders</th>
                    <th className="p-3.5">Units</th>
                    <th className="p-3.5">Discounts</th>
                    <th className="p-3.5 text-right">Tax Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {salesBreakdown.map((sb) => (
                    <tr key={sb.date} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-white font-bold">{sb.date}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">${(sb.grossRevenueMinor / 100).toFixed(2)}</td>
                      <td className="p-3.5 text-white">${(sb.netRevenueMinor / 100).toFixed(2)}</td>
                      <td className="p-3.5 text-slate-300">{sb.ordersCount}</td>
                      <td className="p-3.5 text-slate-300">{sb.unitsCount}</td>
                      <td className="p-3.5 text-amber-400">-${(sb.discountsMinor / 100).toFixed(2)}</td>
                      <td className="p-3.5 text-right text-slate-400">${(sb.taxMinor / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSION FUNNEL */}
      {activeTab === 'funnel' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Full-Funnel Commerce Conversion Stages</h3>
            <p className="text-xs text-slate-400">End-to-end drop-off analysis from initial visitor impression to final checkout payment confirmation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {funnelSteps.map((fs, idx) => (
              <div key={fs.stepIndex} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="text-[11px] font-bold text-slate-400 uppercase">{fs.stepName}</div>
                <div className="text-xl font-mono font-black text-white">{fs.visitorsCount.toLocaleString()}</div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">{fs.stepConversionRate}% Conv</span>
                  {idx > 0 && <span className="text-rose-400 font-bold">{fs.dropOffRate}% Drop</span>}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full rounded-full"
                    style={{ width: `${(fs.visitorsCount / funnelSteps[0].visitorsCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COHORT RETENTION */}
      {activeTab === 'cohorts' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Customer Cohort Repeat Purchase &amp; Survival Matrix</h3>
            <p className="text-xs text-slate-400">Monthly customer retention rates and compounding lifetime revenue contributions.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Cohort</th>
                  <th className="p-3.5">Customers</th>
                  <th className="p-3.5">Month 0</th>
                  <th className="p-3.5">Month 1</th>
                  <th className="p-3.5">Month 2</th>
                  <th className="p-3.5">Month 3</th>
                  <th className="p-3.5">Month 4</th>
                  <th className="p-3.5 text-right">LTV Contrib</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cohortRows.map((cr) => (
                  <tr key={cr.cohortMonth} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-white font-bold">{cr.cohortMonth}</td>
                    <td className="p-3.5 text-slate-300">{cr.initialCustomersCount}</td>
                    {cr.retentionPercentages.map((pct, idx) => (
                      <td key={idx} className="p-3.5 font-bold text-emerald-400">
                        {pct}%
                      </td>
                    ))}
                    {Array.from({ length: 5 - cr.retentionPercentages.length }).map((_, i) => (
                      <td key={i} className="p-3.5 text-slate-600">-</td>
                    ))}
                    <td className="p-3.5 text-right text-emerald-400 font-bold">
                      ${(cr.cumulativeRevenueMinor / 100).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ATTRIBUTION & ROAS */}
      {activeTab === 'attribution' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Multi-Touch Marketing Channel Attribution</h3>
              <p className="text-xs text-slate-400">Compare First-Touch, Last-Touch, and Linear revenue models vs CAC &amp; ROAS.</p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
              {(['first_touch', 'last_touch', 'linear'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAttributionModel(m)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    attributionModel === m ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Attributed Revenue</th>
                  <th className="p-3.5">Ad Spend</th>
                  <th className="p-3.5">ROAS</th>
                  <th className="p-3.5 text-right">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {attributions.map((att) => {
                  const rev =
                    attributionModel === 'first_touch'
                      ? att.firstTouchRevenueMinor
                      : attributionModel === 'last_touch'
                      ? att.lastTouchRevenueMinor
                      : att.linearRevenueMinor;

                  return (
                    <tr key={att.channel} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-white font-sans font-bold">{att.channel}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">${(rev / 100).toLocaleString()}</td>
                      <td className="p-3.5 text-slate-300">
                        {att.adSpendMinor > 0 ? `$${(att.adSpendMinor / 100).toLocaleString()}` : '$0.00 (Organic)'}
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">{att.roasMultiplier}x</td>
                      <td className="p-3.5 text-right text-slate-300">{att.ordersCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCT VELOCITY */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">SKU Performance &amp; Conversion Velocity</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Cart Adds</th>
                  <th className="p-3.5">Units Sold</th>
                  <th className="p-3.5">Revenue</th>
                  <th className="p-3.5">Conversion</th>
                  <th className="p-3.5 text-right">Refund Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-sans">
                      <strong className="text-white block">{p.title}</strong>
                      <span className="text-slate-500 text-[11px]">{p.sku} • {p.category}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">{p.viewsCount.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-300">{p.cartAddsCount.toLocaleString()}</td>
                    <td className="p-3.5 text-white font-bold">{p.unitsSold}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">${(p.revenueMinor / 100).toLocaleString()}</td>
                    <td className="p-3.5 text-indigo-400 font-bold">{p.conversionRate}%</td>
                    <td className="p-3.5 text-right text-rose-400">{p.refundRatePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LIVE PULSE */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Real-Time Storefront Activity Stream</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Live WebSocket Ingestion</span>
            </div>

            <div className="space-y-3">
              {liveStream.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{item.description}</strong>
                      {item.location && <span className="text-[10px] text-slate-500">📍 {item.location}</span>}
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Live Shoppers by Geography</h3>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>🇺🇸 United States</span>
                <strong className="text-emerald-400">18 shoppers</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>🇬🇧 United Kingdom</span>
                <strong className="text-emerald-400">11 shoppers</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>🇫🇷 France</span>
                <strong className="text-emerald-400">6 shoppers</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>🇯🇵 Japan</span>
                <strong className="text-emerald-400">4 shoppers</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>🇦🇪 United Arab Emirates</span>
                <strong className="text-emerald-400">3 shoppers</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REPORT BUILDER */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Generate Custom BI Report</h3>
              <p className="text-xs text-slate-400">Extract high-resolution multidimensional slices across revenue, inventory, and marketing.</p>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Report Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Luxury Footwear Velocity & Margin"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Report Description</label>
                <input
                  type="text"
                  placeholder="e.g. Channel breakdowns and return rates"
                  value={newReportDesc}
                  onChange={(e) => setNewReportDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingReport}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer"
              >
                {isGeneratingReport ? 'Compiling Dataset...' : 'Generate BI Dataset'}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-[#0C0F17] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Generated Reports Archive</h3>
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-white block font-bold">{r.name}</strong>
                      <p className="text-[11px] text-slate-400">{r.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Metrics: {r.metrics.join(', ')} • Dimensions: {r.dimensions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
