import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, OPTIONS } from '@/app/api/v1/platform/activity/route';
import { mockDbInstance } from '../mocks/mongodb.mock';

vi.mock('@/lib/mongodb', () => ({
  getDatabase: vi.fn(() => Promise.resolve(mockDbInstance)),
}));

describe('Platform Activity API Route Integration Tests (/api/v1/platform/activity)', () => {
  beforeEach(() => {
    mockDbInstance.reset();
    vi.clearAllMocks();
  });

  describe('CORS and Preflight', () => {
    it('should return CORS headers on preflight OPTIONS', async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('POST Activity Record', () => {
    it('should validate required event parameter', async () => {
      const req = new NextRequest('http://localhost:3002/api/v1/platform/activity', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('event description is required');
    });

    it('should insert activity log into MongoDB collection', async () => {
      const req = new NextRequest('http://localhost:3002/api/v1/platform/activity', {
        method: 'POST',
        body: JSON.stringify({
          event: 'Tenant database backup completed',
          actor: 'admin@mavenco.com',
          tenantId: 'store_jqtrends',
          tenantName: 'JQ Trends',
          severity: 'info',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.activity.event).toBe('Tenant database backup completed');

      // Verify in DB
      const dbDoc = await mockDbInstance.collection('platform_activities').findOne({
        event: 'Tenant database backup completed',
      });
      expect(dbDoc).not.toBeNull();
      expect(dbDoc.actor).toBe('admin@mavenco.com');
    });
  });

  describe('GET Activity Feed', () => {
    it('should retrieve activity logs list', async () => {
      mockDbInstance.seed('platform_activities', [
        {
          _id: 'act_101',
          event: 'Store owner updated theme tokens',
          actor: 'owner@jqtrends.com',
          tenantId: 'store_jqtrends',
          severity: 'info',
          createdAt: new Date().toISOString(),
        },
      ]);

      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.activities.length).toBe(1);
      expect(json.activities[0].event).toBe('Store owner updated theme tokens');
    });
  });
});
