import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE, OPTIONS } from '@/app/api/v1/reviews/route';
import { mockDbInstance } from '../mocks/mongodb.mock';

vi.mock('@/lib/mongodb', () => ({
  getDatabase: vi.fn(() => Promise.resolve(mockDbInstance)),
}));

describe('Reviews API Route Integration Tests (/api/v1/reviews)', () => {
  beforeEach(() => {
    mockDbInstance.reset();
    vi.clearAllMocks();
  });

  describe('CORS and Preflight', () => {
    it('should return CORS preflight headers', async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('GET Reviews', () => {
    it('should retrieve reviews and fallback to seeds if collection empty', async () => {
      const req = new NextRequest('http://localhost:3002/api/v1/reviews');
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].rating).toBeDefined();
    });
  });

  describe('POST New Review', () => {
    it('should create and persist a new customer product review', async () => {
      const req = new NextRequest('http://localhost:3002/api/v1/reviews', {
        method: 'POST',
        body: JSON.stringify({
          author: 'Kavita Chawla',
          rating: 5,
          comment: 'Exceptional craftsmanship and swift packaging.',
          store: 'jqtrends',
          product: 'prod_001',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.author).toBe('Kavita Chawla');
      expect(json.data.status).toBe('published');
    });
  });

  describe('PUT Update Review Status', () => {
    it('should update review moderation status', async () => {
      mockDbInstance.seed('saas_reviews', [
        {
          id: 'rev_saas_mod',
          author: 'Vikram Seth',
          rating: 4,
          status: 'pending',
        },
      ]);

      const req = new NextRequest('http://localhost:3002/api/v1/reviews', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'rev_saas_mod',
          status: 'approved',
          isFeatured: true,
        }),
      });

      const res = await PUT(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const updated = await mockDbInstance.collection('saas_reviews').findOne({ id: 'rev_saas_mod' });
      expect(updated.status).toBe('approved');
      expect(updated.isFeatured).toBe(true);
    });
  });

  describe('DELETE Review', () => {
    it('should delete a review by ID parameter', async () => {
      mockDbInstance.seed('saas_reviews', [
        {
          id: 'rev_saas_to_del',
          author: 'Spam Author',
          rating: 1,
        },
      ]);

      const req = new NextRequest('http://localhost:3002/api/v1/reviews?id=rev_saas_to_del', {
        method: 'DELETE',
      });

      const res = await DELETE(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const check = await mockDbInstance.collection('saas_reviews').findOne({ id: 'rev_saas_to_del' });
      expect(check).toBeNull();
    });
  });
});
