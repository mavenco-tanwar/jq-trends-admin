import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '@/app/api/v1/auth/login/route';
import { mockDbInstance } from '../mocks/mongodb.mock';

vi.mock('@/lib/mongodb', () => ({
  getDatabase: vi.fn(() => Promise.resolve(mockDbInstance)),
}));

describe('Auth Login API Route Integration Tests (/api/v1/auth/login)', () => {
  beforeEach(() => {
    mockDbInstance.reset();
    vi.clearAllMocks();
  });

  describe('CORS Preflight', () => {
    it('should return CORS headers on OPTIONS', async () => {
      const res = await OPTIONS();
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('Validation & Credentials', () => {
    it('should return 400 Bad Request when email or password is missing', async () => {
      const req = new NextRequest('http://localhost:3002/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Email and password are required');
    });

    it('should authenticate Platform Superadmin via Primary Fast-Path', async () => {
      const req = new NextRequest('http://localhost:3002/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@mavenco.com',
          password: 'admin123',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.token).toContain('session_superadmin_');
      expect(json.user.role).toBe('superadmin');
      expect(json.user.tenantSlug).toBe('all');
    });

    it('should authenticate Tenant Store Owner from MongoDB', async () => {
      mockDbInstance.seed('tenants', [
        {
          name: 'JQ Trends Atelier',
          slug: 'jqtrends',
          ownerEmail: 'owner@jqtrends.com',
          password: 'StorePassword2026!',
          status: 'active',
        },
      ]);

      const req = new NextRequest('http://localhost:3002/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'owner@jqtrends.com',
          password: 'StorePassword2026!',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.token).toContain('merchant_jwt_jqtrends_');
      expect(json.user.tenantSlug).toBe('jqtrends');
      expect(json.user.roleId).toBe('role_owner');
    });

    it('should reject login if account is suspended with 403 Forbidden', async () => {
      mockDbInstance.seed('users', [
        {
          email: 'suspended_staff@jqtrends.com',
          password: 'pass',
          status: 'suspended',
        },
      ]);

      const req = new NextRequest('http://localhost:3002/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'suspended_staff@jqtrends.com',
          password: 'pass',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('suspended');
    });

    it('should return 401 Unauthorized for incorrect password', async () => {
      mockDbInstance.seed('tenants', [
        {
          name: 'Aura Living',
          slug: 'auraliving',
          ownerEmail: 'contact@auraliving.com',
          password: 'CorrectPassword!',
          status: 'active',
        },
      ]);

      const req = new NextRequest('http://localhost:3002/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'contact@auraliving.com',
          password: 'WrongPassword!',
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toContain('Incorrect password');
    });
  });
});
