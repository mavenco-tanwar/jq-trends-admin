'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Gift,
  CreditCard,
  Coins,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Eye,
  DollarSign,
  Users,
  Sliders,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import {
  LoyaltyProgram,
  LoyaltyReward,
  GiftCard,
  StoreCreditLedgerEntry,
} from '@/types/loyalty-commerce.types';

export default function LoyaltyStudioPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'tiers' | 'rewards' | 'giftcards' | 'storecredit' | 'ledger'>('tiers');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [storeCredits, setStoreCredits] = useState<StoreCreditLedgerEntry[]>([]);

  // Modals & Form States
  const [isNewGiftCardOpen, setIsNewGiftCardOpen] = useState(false);
  const [newGC, setNewGC] = useState({
    recipientEmail: 'aanya.kapoor@example.com',
    senderName: 'Lumina VIP Concierge',
    initialBalance: 500,
    message: 'Complimentary Haute Couture Gift Card',
  });

  const [isNewCreditOpen, setIsNewCreditOpen] = useState(false);
  const [newCredit, setNewCredit] = useState({
    customerId: 'cust_1',
    amount: 100,
    type: 'goodwill_credit' as any,
    description: 'VIP Concierge Goodwill Store Credit Adjustment',
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const progRes = await ApiClient.get<any>(`/api/v1/loyalty/program?tenant=${tenantSlug}`);
      if (progRes.data) setProgram(progRes.data);

      const rewRes = await ApiClient.get<any>(`/api/v1/loyalty/rewards?tenant=${tenantSlug}`);
      if (rewRes.data) setRewards(rewRes.data);

      const gcRes = await ApiClient.get<any>(`/api/v1/gift-cards?tenant=${tenantSlug}`);
      if (gcRes.data) setGiftCards(gcRes.data);

      const scRes = await ApiClient.get<any>(`/api/v1/store-credit?tenant=${tenantSlug}`);
      if (scRes.data) setStoreCredits(scRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [tenantSlug]);

  const handleIssueGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/gift-cards', {
        tenantId: tenantSlug,
        recipientEmail: newGC.recipientEmail,
        senderName: newGC.senderName,
        initialBalance: Number(newGC.initialBalance),
        currentBalance: Number(newGC.initialBalance),
        currency: 'USD',
        message: newGC.message,
      });
      showToast(`Issued $${newGC.initialBalance} Digital Gift Card!`, 'success');
      setIsNewGiftCardOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to issue gift card', 'error');
    }
  };

  const handleAdjustCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/store-credit', {
        tenantId: tenantSlug,
        customerId: newCredit.customerId,
        amount: Number(newCredit.amount),
        type: newCredit.type,
        description: newCredit.description,
      });
      showToast(`Adjusted $${newCredit.amount} Store Credit!`, 'success');
      setIsNewCreditOpen(false);
      fetchAllData();
    } catch {
      showToast('Failed to adjust store credit', 'error');
    }
  };

  // Metrics
  const totalGiftCardLiability = giftCards.reduce((sum, g) => sum + (g.currentBalance || 0), 0);
  const totalStoreCredit = storeCredits.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Retention &amp; Tender Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Crown className="w-6 h-6 text-amber-400" />
            Loyalty, Rewards, Gift Cards &amp; Store Credit
          </h1>
          <p className="text-xs text-slate-400">
            Manage multi-tier VIP qualifications, point multiplier rules, digital gift vouchers, and store credit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsNewCreditOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adjust Store Credit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewGiftCardOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Issue Gift Card</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active VIP Members</span>
          <span className="text-xl font-mono font-black text-amber-400">1,240</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Points Outstanding</span>
          <span className="text-xl font-mono font-black text-white">482,000 pts</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Points Liability</span>
          <span className="text-xl font-mono font-black text-rose-400">$24,100</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gift Card Liabilities</span>
          <span className="text-xl font-mono font-black text-emerald-400">${totalGiftCardLiability.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Outstanding Store Credit</span>
          <span className="text-xl font-mono font-black text-white">${totalStoreCredit.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('tiers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tiers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Loyalty Tiers &amp; Multipliers ({program?.tiers.length || 4})</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rewards Catalog ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('giftcards')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'giftcards'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Digital Gift Cards ({giftCards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storecredit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'storecredit'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Store Credit Ledgers ({storeCredits.length})</span>
        </button>
      </div>

      {/* TAB 1: LOYALTY TIERS & RULES */}
      {activeTab === 'tiers' && program && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">VIP Loyalty Tiers &amp; Earning Rules</h3>
              <p className="text-xs text-slate-400">Automatic customer qualification based on rolling spend.</p>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              1 Currency = {program.pointsPerCurrency} {program.pointsLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {program.tiers.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{t.name}</span>
                    <span className="font-mono font-bold text-xs text-emerald-400">{t.pointsMultiplier}x Points</span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Min Spend: <strong>${t.minSpend.toLocaleString()}</strong>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <strong className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tier Privileges:</strong>
                    {t.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REWARDS CATALOG */}
      {activeTab === 'rewards' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Points-to-Voucher Reward Catalog</h3>
              <p className="text-xs text-slate-400">Checkout discount vouchers customers can exchange their coins for.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-sm font-bold">{r.name}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300">
                      {r.pointsCost} Points
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{r.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                  Prefix: <strong>{r.couponCodePrefix}-XXXXX</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL GIFT CARDS */}
      {activeTab === 'giftcards' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Active Digital Gift Cards</h3>
              <p className="text-xs text-slate-400">Electronic gift vouchers usable as internal tender at checkout.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Voucher Code</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Initial Value</th>
                  <th className="p-3.5">Remaining Balance</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {giftCards.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-rose-300">{g.code}</td>
                    <td className="p-3.5 text-slate-300">{g.recipientEmail || 'Unassigned'}</td>
                    <td className="p-3.5 font-mono">${g.initialBalance.toFixed(2)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">${g.currentBalance.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {g.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STORE CREDIT LEDGER */}
      {activeTab === 'storecredit' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Store Credit Audit Ledger</h3>
              <p className="text-xs text-slate-400">Immutable record of returns refunds and customer service adjustments.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Customer ID</th>
                  <th className="p-3.5">Transaction Type</th>
                  <th className="p-3.5">Description &amp; Order</th>
                  <th className="p-3.5 text-right">Amount Credited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {storeCredits.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(sc.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{sc.customerId}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                        {sc.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{sc.description}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      +${sc.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE GIFT CARD MODAL */}
      {isNewGiftCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Issue Digital Gift Card</h3>
                <p className="text-xs text-slate-400">Generate an electronic gift voucher with unique code.</p>
              </div>
              <button onClick={() => setIsNewGiftCardOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueGiftCard} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={newGC.recipientEmail}
                  onChange={(e) => setNewGC({ ...newGC, recipientEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Gift Card Value ($ USD)</label>
                <input
                  type="number"
                  min={10}
                  value={newGC.initialBalance}
                  onChange={(e) => setNewGC({ ...newGC, initialBalance: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Personal Message</label>
                <input
                  type="text"
                  value={newGC.message}
                  onChange={(e) => setNewGC({ ...newGC, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewGiftCardOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Issue Gift Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STORE CREDIT MODAL */}
      {isNewCreditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Adjust Customer Store Credit</h3>
                <p className="text-xs text-slate-400">Append an immutable credit ledger entry.</p>
              </div>
              <button onClick={() => setIsNewCreditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustCredit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Identifier</label>
                <input
                  type="text"
                  value={newCredit.customerId}
                  onChange={(e) => setNewCredit({ ...newCredit, customerId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Adjustment Amount ($ USD)</label>
                <input
                  type="number"
                  min={1}
                  value={newCredit.amount}
                  onChange={(e) => setNewCredit({ ...newCredit, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Reason &amp; Audit Note</label>
                <input
                  type="text"
                  value={newCredit.description}
                  onChange={(e) => setNewCredit({ ...newCredit, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCreditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Commit Credit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
