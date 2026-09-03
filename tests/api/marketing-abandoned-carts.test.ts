import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/v1/marketing/abandoned-carts/route';
import { mockDbInstance } from '../mocks/mongodb.mock';

vi.mock('@/lib/mongodb', () => ({
  getDatabase: vi.fn(() => Promise.resolve(mockDbInstance)),
}));

describe('Abandoned Carts API Route Integration Tests (/api/v1/marketing/abandoned-carts)', () => {
  beforeEach(() => {
    mockDbInstance.reset();
    vi.clearAllMocks();
  });

  describe('GET Abandoned Carts', () => {
    it('should retrieve abandoned carts and seed defaults when collection is empty', async () => {
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].customerEmail).toBeDefined();
    });
  });

  describe('PUT Cart Recovery Status', () => {
    it('should update cart recovery status to email_sent', async () => {
      mockDbInstance.seed('abandoned_carts', [
        {
          id: 'cart_test_01',
          customerName: 'Karan Mehra',
          recoveryStatus: 'pending',
        },
      ]);

      const req = new NextRequest('http://localhost:3002/api/v1/marketing/abandoned-carts', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'cart_test_01',
          recoveryStatus: 'email_sent',
        }),
      });

      const res = await PUT(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const cart = await mockDbInstance.collection('abandoned_carts').findOne({ id: 'cart_test_01' });
      expect(cart.recoveryStatus).toBe('email_sent');
    });
  });
});
