import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscountService } from '@/services/discounts';
import { ApiClient } from '@/services/api';

vi.mock('@/services/api');

describe('DiscountService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Coupon & Promotions Management', () => {
    it('should retrieve existing discounts', async () => {
      const discounts = await DiscountService.getAll();
      expect(Array.isArray(discounts)).toBe(true);
      expect(discounts.length).toBeGreaterThan(0);
    });

    it('should create a percentage discount with code uppercase normalization', async () => {
      const newDiscount = await DiscountService.create({
        code: 'festive25',
        type: 'percentage',
        value: 25,
        minOrderAmount: 2000,
        startAt: '2026-10-01T00:00:00Z',
        endAt: '2026-10-31T23:59:59Z',
      });

      expect(newDiscount.id).toBeDefined();
      expect(newDiscount.code).toBe('FESTIVE25');
      expect(newDiscount.type).toBe('percentage');
      expect(newDiscount.value).toBe(25);
      expect(newDiscount.isActive).toBe(true);
    });

    it('should toggle discount active state', async () => {
      const created = await DiscountService.create({
        code: 'TOGGLETEST',
        type: 'fixed_amount',
        value: 500,
      });

      const initialStatus = created.isActive;
      const toggled = await DiscountService.toggleActive(created.id);
      expect(toggled.isActive).toBe(!initialStatus);
    });

    it('should delete a discount', async () => {
      const created = await DiscountService.create({
        code: 'TODELETE',
        type: 'fixed_amount',
        value: 100,
      });

      await DiscountService.delete(created.id);
      const all = await DiscountService.getAll();
      expect(all.find((d) => d.id === created.id)).toBeUndefined();
    });
  });
});
