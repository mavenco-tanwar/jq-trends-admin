'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  CreditCard,
  Ticket,
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
  Clock,
  Send,
  Lock,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { GiftCard, Voucher, GiftCardLedgerEntry } from '@/types/giftcards-commerce.types';

export default function GiftCardsPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'cards' | 'vouchers' | 'ledger' | 'issue'>('cards');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Issue Gift Card Form
  const [issueRecipientEmail, setIssueRecipientEmail] = useState('aanya.kapoor@example.com');
  const [issueRecipientName, setIssueRecipientName] = useState('Aanya Kapoor');
  const [issueAmount, setIssueAmount] = useState(250);
  const [issueMessage, setIssueMessage] = useState('With warmest compliments from Lumina Haute Couture.');
  const [issueExpiryDays, setIssueExpiryDays] = useState(365);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const gcRes = await ApiClient.get<any>(`/api/v1/gift-cards?tenant=${tenantSlug}`);
      if (gcRes.data) setGiftCards(gcRes.data);

      const vcRes = await ApiClient.get<any>(`/api/v1/vouchers?tenant=${tenantSlug}`);
      if (vcRes.data) setVouchers(vcRes.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const handleIssueGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.post('/api/v1/gift-cards', {
        tenantId: tenantSlug,
        recipientEmail: issueRecipientEmail,
        recipientName: issueRecipientName,
        amountMinor: Math.round(Number(issueAmount) * 100),
        message: issueMessage,
        expiryDays: Number(issueExpiryDays),
      });

      showToast(`Issued $${issueAmount}.00 Gift Card to ${issueRecipientEmail}!`, 'success');
      setActiveTab('cards');
      fetchData();
    } catch {
      showToast('Failed to issue gift card', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Financial Store Instruments
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-rose-400" />
            Gift Cards, Vouchers &amp; Store Credit
          </h1>
          <p className="text-xs text-slate-400">
            Issue digital and physical gift vouchers, manage promotional discount vouchers, and inspect financial ledger liabilities.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('issue')}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue New Gift Card</span>
        </button>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Issued Value</span>
          <span className="text-xl font-mono font-black text-white">$42,500.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Outstanding Liability</span>
          <span className="text-xl font-mono font-black text-amber-400">$14,200.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Redeemed</span>
          <span className="text-xl font-mono font-black text-emerald-400">$28,300.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Gift Cards</span>
          <span className="text-xl font-mono font-black text-white">{giftCards.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Vouchers</span>
          <span className="text-xl font-mono font-black text-rose-400">{vouchers.length}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Gift Cards Issued ({giftCards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'vouchers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Digital Vouchers ({vouchers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Financial Audit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('issue')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'issue'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue New Gift Card</span>
        </button>
      </div>

      {/* TAB 1: GIFT CARDS ISSUED */}
      {activeTab === 'cards' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Issued Gift Cards</h3>
              <p className="text-xs text-slate-400">All digital and physical gift cards currently in circulation.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Card Number</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Sender</th>
                  <th className="p-3.5 text-right">Initial</th>
                  <th className="p-3.5 text-right">Balance</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {giftCards.map((gc) => (
                  <tr key={gc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-amber-400 font-bold flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>{gc.giftCardNumber}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{gc.recipientEmail || 'Unassigned'}</td>
                    <td className="p-3.5 text-slate-400">{gc.senderName || 'Merchant'}</td>
                    <td className="p-3.5 text-right font-mono text-slate-400">
                      ${(gc.initialAmountMinor / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      ${(gc.currentBalanceMinor / 100).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {gc.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {gc.expiresAt ? new Date(gc.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Digital Vouchers &amp; Campaign Codes</h3>
              <p className="text-xs text-slate-400">Promotional discount vouchers evaluated via PromotionEngine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-bold text-sm">{v.name}</strong>
                    <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {v.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{v.description}</p>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                    <div>
                      Benefit:{' '}
                      <strong className="text-emerald-400">
                        {v.valueType === 'fixed_amount' ? `$${(v.valueMinor / 100).toFixed(2)} OFF` : `${v.percentage}% OFF`}
                      </strong>
                    </div>
                    <div>
                      Min Order:{' '}
                      <strong className="text-white">
                        ${(v.minimumOrderValueMinor / 100).toFixed(2)} USD
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Usage: {v.usedCount} / {v.usageLimit}</span>
                  <span className="text-emerald-400 font-bold uppercase">{v.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Immutable Financial Ledger</h3>
              <p className="text-xs text-slate-400">Audit trail of gift card issuance, redemption, and refund restorations.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-white block font-bold">ISSUE • $500.00 Digital Gift Card</strong>
                <span className="text-slate-400 text-[10px]">Issued to aanya.kapoor@example.com • Reference GC-9821-4402-9182</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">+$500.00 USD</span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <strong className="text-white block font-bold">REDEEM • Order #LUM-100234 Tender</strong>
                <span className="text-slate-400 text-[10px]">Redeemed at checkout • Reference GC-1029-8831-5520</span>
              </div>
              <span className="font-mono font-bold text-rose-400">-$150.00 USD</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ISSUE NEW GIFT CARD */}
      {activeTab === 'issue' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Issue Bespoke Gift Voucher</h3>
              <p className="text-xs text-slate-400">Generate a secure digital voucher card with custom greeting message.</p>
            </div>
          </div>

          <form onSubmit={handleIssueGiftCard} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={issueRecipientEmail}
                  onChange={(e) => setIssueRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Recipient Full Name</label>
                <input
                  type="text"
                  value={issueRecipientName}
                  onChange={(e) => setIssueRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Denomination ($ USD)</label>
                <input
                  type="number"
                  value={issueAmount}
                  onChange={(e) => setIssueAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={issueExpiryDays}
                  onChange={(e) => setIssueExpiryDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Personal Greeting</label>
              <textarea
                rows={3}
                value={issueMessage}
                onChange={(e) => setIssueMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue &amp; Send Gift Voucher</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
