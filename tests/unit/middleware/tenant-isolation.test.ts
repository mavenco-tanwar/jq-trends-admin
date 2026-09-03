import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Tenant Isolation Middleware Unit Tests', () => {
  describe('Path-based Tenant Routing (/stores/[slug] or /tenant/[slug])', () => {
    it('should rewrite /stores/auraliving/products to /products with tenant header & cookie', () => {
      const req = new NextRequest('http://localhost:3002/stores/auraliving/products');
      const res = middleware(req);

      expect(res.headers.get('x-tenant-slug')).toBe('auraliving');
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('jq_saas_active_tenant_slug=auraliving');
    });

    it('should rewrite /tenant/apexathletics to / with tenant header', () => {
      const req = new NextRequest('http://localhost:3002/tenant/apexathletics');
      const res = middleware(req);

      expect(res.headers.get('x-tenant-slug')).toBe('apexathletics');
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('jq_saas_active_tenant_slug=apexathletics');
    });
  });

  describe('Query Parameter Resolution (?tenant=slug)', () => {
    it('should resolve tenant from ?tenant=apexathletics', () => {
      const req = new NextRequest('http://localhost:3002/orders?tenant=apexathletics');
      const res = middleware(req);

      expect(res.headers.get('x-tenant-slug')).toBe('apexathletics');
      const cookieHeader = res.headers.get('set-cookie');
      expect(cookieHeader).toContain('jq_saas_active_tenant_slug=apexathletics');
    });
  });

  describe('Hostname / Domain Resolution', () => {
    it('should resolve auraliving from custom admin domain hostname', () => {
      const req = new NextRequest('http://admin.auraliving.com/dashboard', {
        headers: { host: 'admin.auraliving.com' },
      });
      const res = middleware(req);

      expect(res.headers.get('x-tenant-slug')).toBe('auraliving');
    });

    it('should resolve apexathletics from subdomain hostname', () => {
      const req = new NextRequest('http://apexathletics.mavenco.com/products', {
        headers: { host: 'apexathletics.mavenco.com' },
      });
      const res = middleware(req);

      expect(res.headers.get('x-tenant-slug')).toBe('apexathletics');
    });

    it('should fallback to default jqtrends on generic host without parameters', () => {
      const req = new NextRequest('http://localhost:3002/dashboard', {
        headers: { host: 'localhost:3002' },
      });
      const res = middleware(req);

      expect(res.headers.get('x-tenant-slug')).toBe('jqtrends');
    });
  });
});
