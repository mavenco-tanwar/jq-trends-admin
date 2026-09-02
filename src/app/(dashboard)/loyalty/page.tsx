'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Gift,
  Coins,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Sliders,
  DollarSign,
  Users,
  Search,
  Check,
  X,
  ShieldCheck,
  Percent,
  Layers,
  Clock,
  Send,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  LoyaltyProgram,
  LoyaltyTier,
  LoyaltyReward,
  LoyaltyLedgerEntry,
  WalletLedgerEntry,
  ReferralRecord,
} from '@/types/loyalty-commerce.types';

export default function LoyaltyPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'tiers' | 'rewards' | 'wallet' | 'referrals' | 'ledger' | 'analytics'>('tiers');
  const [pointsLedger, setPointsLedger] = useState<LoyaltyLedgerEntry[]>([]);
  const [walletLedger, setWalletLedger] = useState<WalletLedgerEntry[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Adjustment Modal
  const [adjustmentTarget, setAdjustmentTarget] = useState<'points' | 'wallet'>('points');
  const [adjustmentCustomer, setAdjustmentCustomer] = useState('cust_1');
  const [adjustmentAmount, setAdjustmentAmount] = useState(500);
  const [adjustmentReason, setAdjustmentReason] = useState('VIP Concierge Goodwill');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [tiers, setTiers] = useState<LoyaltyTier[]>([
    {
      id: 'tier_bronze',
      name: 'Bronze Atelier',
      minSpend: 0,
      pointsMultiplier: 1.0,
      benefits: ['Earn 1 pt per $1 spend', 'Standard shipping on orders over $250'],
      badgeColor: 'bg-amber-800/30 text-amber-200 border-amber-700/50',
    },
    {
      id: 'tier_silver',
      name: 'Silver Elite',
      minSpend: 2500,
      pointsMultiplier: 1.25,
      benefits: ['Earn 1.25x pts per $1 spend', 'Free standard shipping', 'Birthday gift box'],
      badgeColor: 'bg-slate-500/30 text-slate-200 border-slate-400/50',
    },
    {
      id: 'tier_gold',
      name: 'Gold Couture',
      minSpend: 7500,
      pointsMultiplier: 1.5,
      benefits: ['Earn 1.5x pts per $1 spend', 'Free express courier', 'Private trunk show invites'],
      badgeColor: 'bg-amber-500/30 text-amber-300 border-amber-500/50',
    },
    {
      id: 'tier_platinum',
      name: 'Platinum Haute',
      minSpend: 15000,
      pointsMultiplier: 2.0,
      benefits: ['Earn 2.0x pts per $1 spend', 'Dedicated personal stylist concierge', 'Bespoke fitting sessions'],
      badgeColor: 'bg-rose-500/30 text-rose-300 border-rose-500/50',
    },
  ]);

  const [rewards, setRewards] = useState<LoyaltyReward[]>([
    {
      id: 'rew_1',
      name: '$25 Boutique Voucher',
      description: 'Exchange 500 Couture Coins for an instant $25 voucher code.',
      pointsCost: 500,
      discountType: 'fixed_amount',
      discountValue: 25,
      couponCodePrefix: 'REW25',
      status: 'active',
    },
    {
      id: 'rew_2',
      name: '$50 Luxury Voucher',
      description: 'Exchange 1,000 Couture Coins for an instant $50 voucher code.',
      pointsCost: 1000,
      discountType: 'fixed_amount',
      discountValue: 50,
      couponCodePrefix: 'REW50',
      status: 'active',
    },
    {
      id: 'rew_3',
      name: 'Free Express Courier Voucher',
      description: 'Complimentary worldwide express shipping voucher.',
      pointsCost: 300,
      discountType: 'free_shipping',
      discountValue: 100,
      couponCodePrefix: 'FREESHIP',
      status: 'active',
    },
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const ptRes = await ApiClient.get<any>(`/api/v1/loyalty/points?tenant=${tenantSlug}`);
      if (ptRes.data) setPointsLedger(ptRes.data);

      const wltRes = await ApiClient.get<any>(`/api/v1/wallet?tenant=${tenantSlug}`);
      if (wltRes.data) setWalletLedger(wltRes.data);

      const refRes = await ApiClient.get<any>(`/api/v1/referrals?tenant=${tenantSlug}`);
      if (refRes.data) setReferrals(refRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (adjustmentTarget === 'points') {
        await ApiClient.post('/api/v1/loyalty/points', {
          tenantId: tenantSlug,
          customerId: adjustmentCustomer,
          points: Number(adjustmentAmount),
          description: `Admin Adjustment: ${adjustmentReason}`,
          source: 'admin.manual_adjustment',
        });
        showToast(`Adjusted ${adjustmentAmount} points for ${adjustmentCustomer}!`, 'success');
      } else {
        await ApiClient.post('/api/v1/wallet', {
          tenantId: tenantSlug,
          customerId: adjustmentCustomer,
          amountMinor: Math.round(Number(adjustmentAmount) * 100),
          description: `Admin Wallet Adjustment: ${adjustmentReason}`,
          source: 'admin.manual_adjustment',
        });
        showToast(`Adjusted $${adjustmentAmount} wallet credit for ${adjustmentCustomer}!`, 'success');
      }
      setIsAdjustModalOpen(false);
      fetchData();
    } catch {
      showToast('Adjustment failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              VIP Loyalty &amp; Financial Wallets
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Crown className="w-6 h-6 text-amber-400" />
            Loyalty, Rewards &amp; Customer Wallet Studio
          </h1>
          <p className="text-xs text-slate-400">
            Configure VIP tier thresholds, points earning rules, voucher catalog, customer store credit ledger, and viral referral rewards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdjustModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-xs font-extrabold shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Manual Adjustment</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Loyalty Members</span>
          <span className="text-xl font-mono font-black text-white">1,280</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Outstanding Points</span>
          <span className="text-xl font-mono font-black text-amber-400">345,800 pts</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Wallet Liability</span>
          <span className="text-xl font-mono font-black text-emerald-400">$18,450.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Referral Conversions</span>
          <span className="text-xl font-mono font-black text-rose-400">214 Orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Redeemed Value</span>
          <span className="text-xl font-mono font-black text-white">$12,900.00</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tiers'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>VIP Tiers &amp; Multipliers ({tiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Rewards Catalog ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Customer Wallet Ledger ({walletLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'referrals'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Referral Program ({referrals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Points Audit Ledger ({pointsLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Liability &amp; Velocity</span>
        </button>
      </div>

      {/* TAB 1: VIP TIERS */}
      {activeTab === 'tiers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${t.badgeColor}`}>
                    {t.name}
                  </span>
                  <span className="font-mono text-sm font-black text-amber-400">{t.pointsMultiplier}x Multiplier</span>
                </div>

                <div className="text-xs text-slate-400">
                  Spend Threshold: <strong className="text-white font-mono">${t.minSpend.toLocaleString()} USD</strong>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Privileges:</span>
                  {t.benefits.map((b, idx) => (
                    <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: REWARDS CATALOG */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{r.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {r.pointsCost} Points
                  </span>
                </div>

                <p className="text-xs text-slate-400">{r.description}</p>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
                  Prefix: <strong>{r.couponCodePrefix}</strong> • Value: <strong>${r.discountValue}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: WALLET LEDGER */}
      {activeTab === 'wallet' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Customer Store Credit Ledger</h3>
              <p className="text-xs text-slate-400">Financial store credit transactions stored in minor currency units (paise/cents).</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Customer ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {walletLedger.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{w.customerId}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        {w.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 truncate max-w-xs">{w.description}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      +${(w.amountMinor / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ${(w.balanceAfterMinor / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REFERRAL PROGRAM */}
      {activeTab === 'referrals' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Referrals &amp; Viral Acquisition</h3>
              <p className="text-xs text-slate-400">Track peer-to-peer customer referral invitations and conversion rewards.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Referrer</th>
                  <th className="p-3.5">Invited Customer</th>
                  <th className="p-3.5">Referral Code</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Awarded Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{r.referrerCustomerId}</td>
                    <td className="p-3.5 font-mono text-slate-300">{r.referredEmail}</td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{r.referralCode}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      +{r.rewardPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: POINTS AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Points Transaction Ledger</h3>
              <p className="text-xs text-slate-400">Every points issuance, redemption, and expiration with audit source.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Points</th>
                  <th className="p-3.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {pointsLedger.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(pt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{pt.customerId}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
                        {pt.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 truncate max-w-xs">{pt.description}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      +{pt.points} pts
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {pt.balanceAfter} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LIABILITY & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial Liability Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Outstanding Store Credit Balance</strong>
                  <span className="text-slate-400 text-[10px]">Unredeemed customer wallet deposits &amp; refund credits</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">$18,450.00</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Estimated Points Valuation (at $0.05/pt)</strong>
                  <span className="text-slate-400 text-[10px]">345,800 points in circulation</span>
                </div>
                <span className="font-mono font-bold text-amber-400">$17,290.00</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Redemption Velocity &amp; ROI</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Average Order Value with Loyalty Redemption</strong>
                  <span className="text-slate-400 text-[10px]">Compared to non-loyalty orders ($1,240.00)</span>
                </div>
                <span className="font-mono font-bold text-rose-400">$2,450.00 (+97%)</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Repeat Purchase Rate for VIP Members</strong>
                  <span className="text-slate-400 text-[10px]">Customers in Gold or Platinum tiers</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">78.4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADJUSTMENT MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Manual Balance Adjustment</h3>
                <p className="text-xs text-slate-400">Audit-logged adjustment for customer goodwill or compensation.</p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Balance</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentTarget('points')}
                    className={`py-2 rounded-xl font-bold ${adjustmentTarget === 'points' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    Loyalty Points
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentTarget('wallet')}
                    className={`py-2 rounded-xl font-bold ${adjustmentTarget === 'wallet' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    Store Credit Wallet ($)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer ID</label>
                <input
                  type="text"
                  value={adjustmentCustomer}
                  onChange={(e) => setAdjustmentCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Amount {adjustmentTarget === 'points' ? '(Points)' : '($ USD)'}
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. VIP Concierge Goodwill compensation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
