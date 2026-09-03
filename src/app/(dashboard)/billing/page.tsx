'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Sparkles,
  Download,
  Eye,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PieChart,
  Layers,
  Crown,
  Lock,
  Unlock,
  Radio,
  FileText,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  Subscription,
  SubscriptionPlan,
  UsageAggregation,
  BillingInvoice,
  BillingPaymentMethod,
  PlatformMonetizationMetrics,
} from '@/types/billing-saas.types';

export default function BillingStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'plans' | 'invoices' | 'payment_methods' | 'superadmin'>('overview');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usage, setUsage] = useState<UsageAggregation | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<BillingPaymentMethod[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMonetizationMetrics | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const subRes = await ApiClient.get<any>(`/api/v1/billing/subscription?tenant=${tenantSlug}`);
      if (subRes.data) setSubscription(subRes.data);

      const planRes = await ApiClient.get<any>(`/api/v1/billing/plans?tenant=${tenantSlug}`);
      if (planRes.data) setPlans(planRes.data);

      const useRes = await ApiClient.get<any>(`/api/v1/billing/usage?tenant=${tenantSlug}`);
      if (useRes.data) setUsage(useRes.data);

      const invRes = await ApiClient.get<any>(`/api/v1/billing/invoices?tenant=${tenantSlug}`);
      if (invRes.data) setInvoices(invRes.data);

      const pmRes = await ApiClient.get<any>(`/api/v1/billing/payment-methods?tenant=${tenantSlug}`);
      if (pmRes.data) setPaymentMethods(pmRes.data);

      const platRes = await ApiClient.get<any>(`/api/v1/billing/platform?tenant=${tenantSlug}`);
      if (platRes.data) setPlatformMetrics(platRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleUpgradePlan = async (plan: SubscriptionPlan) => {
    try {
      const amountMinor = billingCycle === 'yearly' ? plan.yearlyPriceMinor : plan.monthlyPriceMinor;
      await ApiClient.post<any>('/api/v1/billing/subscription', {
        tenantId: tenantSlug,
        planId: plan.id,
        planName: plan.name,
        billingInterval: billingCycle,
        amountMinor,
      });
      showToast(`Subscription upgraded to ${plan.name} (${billingCycle})!`, 'success');
      await fetchData();
    } catch {
      showToast('Failed to change subscription plan', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SaaS Monetization &amp; Entitlements
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Tenant: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Crown className="w-6 h-6 text-amber-400" />
            Plans, Subscriptions &amp; Platform Billing
          </h1>
          <p className="text-xs text-slate-400">
            Subscription tier entitlements, quota meter tracking, platform invoices, and automated payment tenders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          <span>Change Subscription Plan</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Plan Tier</span>
          <span className="text-xl font-mono font-black text-amber-400">{subscription?.planName || 'Growth Commerce'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Billing Status</span>
          <span className="text-xl font-mono font-black text-emerald-400">Active (Auto-Renew)</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Monthly Rate</span>
          <span className="text-xl font-mono font-black text-white">
            ${((subscription?.amountMinor || 29900) / 100).toFixed(2)} USD
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Product Quota</span>
          <span className="text-xl font-mono font-black text-indigo-400">4,500 / 10,000</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Next Invoice Date</span>
          <span className="text-xl font-mono font-black text-slate-300">Sep 30, 2026</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Subscription &amp; Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'usage'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Resource Usage &amp; Quotas</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Compare Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SaaS Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payment_methods')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'payment_methods'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Tenders</span>
        </button>

        <button
          onClick={() => setActiveTab('superadmin')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'superadmin'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Platform MRR &amp; Analytics</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTION OVERVIEW */}
      {activeTab === 'overview' && subscription && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Current Active Tier</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{subscription.planName}</h2>
                <p className="text-xs text-slate-400 mt-1">Multi-store commerce tier with dedicated API throughput and custom domain SSL.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {subscription.status}
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2.5">
              <div className="flex justify-between text-slate-400">
                <span>Billing Interval:</span>
                <strong className="text-white uppercase">{subscription.billingInterval}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recurring Amount:</span>
                <strong className="text-emerald-400">${(subscription.amountMinor / 100).toFixed(2)} USD</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Billing Cycle:</span>
                <strong className="text-slate-300">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} — {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Auto-Renew:</span>
                <strong className="text-emerald-400">Enabled (Visa ending in 4242)</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
              >
                Upgrade to Scale Enterprise
              </button>

              <button
                type="button"
                onClick={() => showToast('Subscription paused at end of billing cycle.', 'info')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Manage Billing Cycle
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Default Payment Method</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-white font-bold">
                <span>Visa Business Card</span>
                <span className="text-emerald-400">•••• 4242</span>
              </div>
              <div className="text-slate-400 text-[11px]">Expires: 12/2029</div>
              <div className="text-slate-500 text-[10px] pt-1">Charged automatically on cycle renewal date.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCE USAGE & QUOTAS */}
      {activeTab === 'usage' && usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Active Multi-Storefronts</span>
              <span className="font-mono text-indigo-400">{usage.storesCount} / {usage.storesLimit} Stores</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(usage.storesCount / usage.storesLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Connected Custom Domains</span>
              <span className="font-mono text-emerald-400">{usage.domainsCount} / {usage.domainsLimit} Domains</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(usage.domainsCount / usage.domainsLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Catalog Product SKUs</span>
              <span className="font-mono text-amber-400">{usage.productsCount} / {usage.productsLimit} Products</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(usage.productsCount / usage.productsLimit) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Monthly Processed Orders</span>
              <span className="font-mono text-rose-400">{usage.monthlyOrdersCount} / {usage.monthlyOrdersLimit} Orders</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${(usage.monthlyOrdersCount / usage.monthlyOrdersLimit) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPARE & UPGRADE PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950">Save 20%</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const priceMinor = billingCycle === 'yearly' ? p.yearlyPriceMinor / 12 : p.monthlyPriceMinor;
              const isCurrent = subscription?.planId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-2xl bg-[#0F1117] border transition-all flex flex-col justify-between space-y-6 ${
                    p.highlight ? 'border-amber-500/80 shadow-2xl shadow-amber-500/10' : 'border-slate-800 shadow-xl'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">{p.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                      </div>
                      {p.highlight && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="font-mono">
                      <span className="text-3xl font-black text-white">${(priceMinor / 100).toFixed(0)}</span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      {p.features.map((f) => (
                        <div key={f.key} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${f.enabled ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className={f.enabled ? 'text-slate-200' : 'text-slate-500 line-through'}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => handleUpgradePlan(p)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : p.highlight
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SAAS INVOICES */}
      {activeTab === 'invoices' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Platform SaaS Invoices &amp; Receipts</h3>
              <p className="text-xs text-slate-400">Historical tax receipts for software subscription charges.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{inv.invoiceNumber}</td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(inv.periodStart).toLocaleDateString()} — {new Date(inv.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ${(inv.totalMinor / 100).toFixed(2)} {inv.currency}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => showToast(`Downloading ${inv.invoiceNumber}.pdf...`, 'info')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-amber-400" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT TENDERS */}
      {activeTab === 'payment_methods' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <strong className="text-white font-bold text-sm">{pm.brand}</strong>
                {pm.isDefault && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                    Default Auto-Renewal
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs flex justify-between items-center">
                <span className="text-slate-400">Card Number:</span>
                <strong className="text-white">•••• •••• •••• {pm.last4}</strong>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Expires: {pm.expiryMonth}/{pm.expiryYear}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: SUPERADMIN MRR */}
      {activeTab === 'superadmin' && platformMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Recurring Revenue (MRR)</span>
              <div className="text-2xl font-mono font-black text-emerald-400">${(platformMetrics.mrrMinor / 100).toLocaleString()} USD</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Annual Run Rate (ARR)</span>
              <div className="text-2xl font-mono font-black text-white">${(platformMetrics.arrMinor / 100).toLocaleString()} USD</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Tenants</span>
              <div className="text-2xl font-mono font-black text-indigo-400">{platformMetrics.activeTenantsCount} Organizations</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Platform Plan Tier Distribution</h3>
            <div className="space-y-3">
              {platformMetrics.planDistribution.map((dist, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <strong className="text-white font-bold">{dist.planName}</strong>
                    <p className="text-[11px] text-slate-400 font-mono">{dist.subscribersCount} active subscribers</p>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-400">
                    ${(dist.revenueMinor / 100).toLocaleString()} USD / mo
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
