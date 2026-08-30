import { ApiClient } from './api';
import { INITIAL_DISCOUNTS } from '@/lib/mock-data';
import type { Discount } from '@/types';

function normalizeDiscount(raw: any): Discount {
  return {
    id: raw.id || `disc_${Date.now()}`,
    code: (raw.code || 'PROMO10').toUpperCase(),
    type: raw.type || raw.discountType || 'percentage',
    value: raw.value ?? raw.discountValue ?? 10,
    minOrderAmount: raw.minOrderAmount ?? raw.min_order_amount ?? 999,
    maxDiscountAmount: raw.maxDiscountAmount ?? raw.max_discount_amount,
    usageLimit: raw.usageLimit ?? raw.usage_limit ?? 500,
    usageCount: raw.usageCount ?? raw.usage_count ?? 0,
    perCustomerLimit: raw.perCustomerLimit || 1,
    startAt: raw.startAt || raw.createdAt || new Date().toISOString(),
    endAt: raw.endAt,
    isActive: raw.isActive !== false && raw.is_active !== 0,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export class DiscountService {
  private static localDiscounts: Discount[] = INITIAL_DISCOUNTS.map(normalizeDiscount);

  static async getAll(): Promise<Discount[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/marketing/coupons');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeDiscount);
        this.localDiscounts = normalized;
        return normalized;
      }
    } catch {
      // Mock Fallback
    }
    return this.localDiscounts;
  }

  static async create(discount: Partial<Discount>): Promise<Discount> {
    const newDisc = normalizeDiscount({
      id: `disc_${Date.now()}`,
      code: (discount.code || `PROMO${Date.now()}`).toUpperCase(),
      type: discount.type || 'percentage',
      value: discount.value || 10,
      minOrderAmount: discount.minOrderAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      usageLimit: discount.usageLimit,
      usageCount: 0,
      perCustomerLimit: discount.perCustomerLimit || 1,
      startAt: discount.startAt || new Date().toISOString(),
      endAt: discount.endAt,
      isActive: discount.isActive ?? true,
      createdAt: new Date().toISOString(),
    });

    try {
      const res = await ApiClient.post<any>('/api/v1/marketing/coupons', {
        code: newDisc.code,
        description: `Promo Code ${newDisc.code}`,
        discountType: newDisc.type,
        discountValue: newDisc.value,
        minOrderAmount: newDisc.minOrderAmount,
        usageLimit: newDisc.usageLimit,
      });
      if (res.data) {
        const persisted = normalizeDiscount(res.data);
        this.localDiscounts.push(persisted);
        return persisted;
      }
    } catch {
      // Mock Fallback
    }

    this.localDiscounts.push(newDisc);
    return newDisc;
  }

  static async toggleActive(id: string): Promise<Discount> {
    this.localDiscounts = this.localDiscounts.map((d) =>
      d.id === id ? { ...d, isActive: !d.isActive } : d
    );
    const updated = this.localDiscounts.find((d) => d.id === id);
    if (!updated) throw new Error('Discount not found');
    return updated;
  }

  static async delete(id: string): Promise<void> {
    this.localDiscounts = this.localDiscounts.filter((d) => d.id !== id);
  }
}
