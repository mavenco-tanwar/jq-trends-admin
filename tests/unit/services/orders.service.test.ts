import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '@/services/orders';
import { ApiClient } from '@/services/api';
import { mockOrdersFixture } from '../../fixtures/orders.fixture';

vi.mock('@/services/api');

describe('OrderService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Order Retrieval & Normalization', () => {
    it('should retrieve and normalize orders from API', async () => {
      vi.mocked(ApiClient.get).mockResolvedValueOnce({
        data: [
          {
            id: 'ord_api_01',
            orderNumber: 'JQT-100200',
            customer: { fullName: 'Mira Kapoor', email: 'mira@example.com' },
            grandTotal: 15499,
            items: [
              {
                title: 'Designer Saree',
                price: 15499,
                quantity: 1,
              },
            ],
            status: 'processing',
          },
        ],
      });

      const orders = await OrderService.getAll();
      expect(orders.length).toBeGreaterThan(0);
      const order = orders[0];
      expect(order.orderNumber).toBe('JQT-100200');
      expect(order.customer.firstName).toBe('Mira');
      expect(order.customer.lastName).toBe('Kapoor');
      expect(order.grandTotal).toBe(15499);
      expect(order.shippingAddress).toBeDefined();
    });

    it('should retrieve a single order by ID', async () => {
      vi.mocked(ApiClient.get).mockResolvedValueOnce({
        data: mockOrdersFixture[0],
      });

      const order = await OrderService.getById('ord_901');
      expect(order).not.toBeNull();
      expect(order?.id).toBe('ord_901');
      expect(order?.paymentStatus).toBe('paid');
      expect(order?.customer.email).toBe('ananya.sharma@example.com');
    });

    it('should fallback to local mock orders if API fails', async () => {
      vi.mocked(ApiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const orders = await OrderService.getAll();
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[0].currency).toBe('INR');
    });
  });

  describe('Order Status Mutations', () => {
    it('should update order lifecycle status', async () => {
      vi.mocked(ApiClient.patch).mockResolvedValueOnce({
        data: {
          ...mockOrdersFixture[0],
          status: 'shipped',
        },
      });

      const updated = await OrderService.updateStatus('ord_901', 'shipped');
      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('shipped');
    });

    it('should update fulfillment status with tracking and carrier metadata', async () => {
      vi.mocked(ApiClient.patch).mockResolvedValueOnce({
        data: {
          ...mockOrdersFixture[0],
          status: 'shipped',
          carrier: 'BlueDart Air Express',
          trackingNumber: 'TRACK-889911',
        },
      });

      const updated = await OrderService.updateStatus(
        'ord_901',
        'shipped',
        'BlueDart Air Express',
        'TRACK-889911'
      );

      expect(updated).not.toBeNull();
      expect(updated.status).toBe('shipped');
      expect(updated.carrier).toBe('BlueDart Air Express');
      expect(updated.trackingNumber).toBe('TRACK-889911');
    });

    it('should add admin note to order timeline', async () => {
      const orders = await OrderService.getAll();
      const targetOrder = orders[0];

      const updated = await OrderService.addAdminNote(
        targetOrder.id,
        'Customer confirmed phone number for express delivery.'
      );

      expect(updated).not.toBeNull();
      expect(updated.notes?.length).toBeGreaterThan(0);
      const lastNote = updated.notes?.[(updated.notes?.length || 1) - 1];
      expect(lastNote?.content).toBe(
        'Customer confirmed phone number for express delivery.'
      );
    });
  });
});
