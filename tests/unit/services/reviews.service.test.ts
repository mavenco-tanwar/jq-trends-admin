import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReviewService } from '@/services/reviews';

describe('ReviewService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Reviews Moderation & Retrieval', () => {
    it('should retrieve reviews for a tenant store', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 'rev_01',
              author: 'Meera Rajput',
              rating: 5,
              store: 'jqtrends',
              product: 'prod_001',
              comment: 'The drape and quality of this silk gown is breathtaking.',
              status: 'published',
            },
          ],
        }),
      } as Response);

      const reviews = await ReviewService.getAll('jqtrends');
      expect(reviews.length).toBe(1);
      expect(reviews[0].author).toBe('Meera Rajput');
      expect(reviews[0].rating).toBe(5);
    });

    it('should create a new customer review', async () => {
      const reviewPayload = {
        author: 'Siddharth Rao',
        rating: 4,
        store: 'jqtrends',
        product: 'prod_002',
        comment: 'Great craftsmanship, fast delivery.',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'rev_new_99', ...reviewPayload, status: 'pending' },
        }),
      } as Response);

      const created = await ReviewService.create(reviewPayload);
      expect(created).not.toBeNull();
      expect(created?.id).toBe('rev_new_99');
      expect(created?.status).toBe('pending');
    });

    it('should update review moderation status', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const success = await ReviewService.updateStatus('rev_01', 'approved');
      expect(success).toBe(true);
    });

    it('should toggle featured status of a review', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const success = await ReviewService.toggleFeatured('rev_01', true);
      expect(success).toBe(true);
    });

    it('should delete a review', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const success = await ReviewService.delete('rev_01');
      expect(success).toBe(true);
    });
  });
});
