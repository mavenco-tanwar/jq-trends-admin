'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Tag,
} from 'lucide-react';
import { DiscountService } from '@/services/discounts';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { Discount } from '@/types';

export default function DiscountsPage() {
  const { showToast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount' | 'free_shipping'>('percentage');
  const [value, setValue] = useState('10');
  const [minOrder, setMinOrder] = useState('999');
  const [maxDiscount, setMaxDiscount] = useState('500');
  const [usageLimit, setUsageLimit] = useState('1000');

  const fetchDiscounts = async () => {
    const list = await DiscountService.getAll();
    setDiscounts(list);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await DiscountService.create({
      code,
      type,
      value: parseFloat(value) || 0,
      minOrderAmount: minOrder ? parseFloat(minOrder) : undefined,
      maxDiscountAmount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
    });
    showToast(`Created coupon ${code}`, 'success');
    setIsModalOpen(false);
    setCode('');
    fetchDiscounts();
  };

  const handleToggle = async (id: string) => {
    await DiscountService.toggleActive(id);
    showToast('Coupon status updated', 'info');
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    await DiscountService.delete(id);
    showToast('Coupon deleted', 'info');
    fetchDiscounts();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Promotions &amp; Flash Sales
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Discounts &amp; Promo Coupons</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure checkout discount codes, percentage vouchers, and festive cart promotions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {discounts.map((d) => (
          <div
            key={d.id}
            className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                  {d.code}
                </span>
                <button
                  onClick={() => handleToggle(d.id)}
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    d.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {d.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="text-base font-bold text-white">
                {d.type === 'percentage'
                  ? `${d.value}% Off Entire Order`
                  : d.type === 'fixed_amount'
                  ? `₹${d.value} Flat Discount`
                  : 'Free Express Shipping'}
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>Min Order: ₹{d.minOrderAmount || 0}</div>
                <div>Used: {d.usageCount} times</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
              <button
                onClick={() => handleDelete(d.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Promo Coupon"
          maxWidth="md"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed_amount">Fixed Amount (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Value ({type === 'percentage' ? '%' : '₹'})</label>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
