import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, OPTIONS } from '@/app/api/v1/platform/tenants/route';
import { mockDbInstance } from '../mocks/mongodb.mock';
import { mockTenantsFixture } from '../fixtures/tenants.fixture';

vi.mock('@/lib/mongodb', () => ({
  getDatabase: vi.fn(() => Promise.resolve(mockDbInstance)),
}));

describe('Platform Tenants API Route Integration Tests (/api/v1/platform/tenants)', () => {
  beforeEach(() => {
    mockDbInstance.reset();
    vi.clearAllMocks();
  });

  describe('CORS and Preflight', () => {
    it('should return CORS headers for preflight request', async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('GET Tenants List', () => {
    it('should retrieve tenants from MongoDB collection', async () => {
      mockDbInstance.seed('tenants', mockTenantsFixture);

      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.length).toBe(3);
      expect(json.source).toBe('mongodb');
    });

    it('should return empty list when no tenants found in MongoDB', async () => {
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual([]);
    });
  });

  describe('POST Provision Store & Merchant Admin', () => {
    it('should provision tenant, create merchant admin user, and record activity in MongoDB', async () => {
      const provisionPayload = {
        name: 'Vogue Luxe Jewels',
        slug: 'vogueluxe',
        ownerName: 'Sunita Rao',
        ownerEmail: 'sunita@vogueluxe.com',
        planId: 'plan_pro',
        currency: 'INR',
      };

      const req = new NextRequest('http://localhost:3002/api/v1/platform/tenants', {
        method: 'POST',
        body: JSON.stringify(provisionPayload),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify tenant record in mock DB
      const tenantDoc = await mockDbInstance.collection('tenants').findOne({ slug: 'vogueluxe' });
      expect(tenantDoc).not.toBeNull();
      expect(tenantDoc.name).toBe('Vogue Luxe Jewels');

      // Verify merchant admin account in 'users' collection
      const userDoc = await mockDbInstance.collection('users').findOne({ email: 'sunita@vogueluxe.com' });
      expect(userDoc).not.toBeNull();
      expect(userDoc.roleId).toBe('role_owner');
      expect(userDoc.tenantSlug).toBe('vogueluxe');

      // Verify audit activity in 'platform_activities'
      const activityDoc = await mockDbInstance.collection('platform_activities').findOne({
        tenantId: 'store_vogueluxe',
      });
      expect(activityDoc).not.toBeNull();
      expect(activityDoc.event).toContain('Superadmin provisioned new store: Vogue Luxe Jewels');
    });
  });
});
