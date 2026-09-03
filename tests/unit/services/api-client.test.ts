import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ApiClient,
  getApiBaseUrl,
  getStorefrontBaseUrl,
  getTenantStorefrontUrl,
} from '@/services/api';

describe('ApiClient & URL Utilities Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('URL Resolvers', () => {
    it('should generate valid storefront URLs for tenants', () => {
      const url = getTenantStorefrontUrl('jqtrends', '/products/silk-gown');
      expect(url).toContain('/stores/jqtrends/products/silk-gown');
    });

    it('should return default fallback URLs when env is not set', () => {
      const apiBase = getApiBaseUrl();
      const storefrontBase = getStorefrontBaseUrl();
      expect(apiBase).toBeDefined();
      expect(storefrontBase).toBeDefined();
    });
  });

  describe('HTTP Request Interception & Headers', () => {
    it('should inject headers including x-tenant-slug and Bearer token', async () => {
      localStorage.setItem('jq_admin_token', 'test_auth_token_xyz');
      localStorage.setItem('jq_saas_active_tenant_id', 'store_auraliving');

      let capturedUrl = '';
      let capturedOptions: any = null;

      global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
        capturedUrl = url;
        capturedOptions = opts;
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { status: 'ok' } }),
        } as Response);
      });

      const response = await ApiClient.get('/api/v1/test-endpoint');

      expect(response.success).toBe(true);
      expect(capturedOptions.headers['Authorization']).toBe('Bearer test_auth_token_xyz');
      expect(capturedOptions.headers['x-tenant-slug']).toBe('auraliving');
      expect(capturedOptions.headers['X-Store-ID']).toBeDefined();
    });

    it('should handle POST request with JSON body payload', async () => {
      let capturedBody = '';

      global.fetch = vi.fn().mockImplementation((url: string, opts: any) => {
        capturedBody = opts.body;
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { id: 'created_01' } }),
        } as Response);
      });

      const res = await ApiClient.post('/api/v1/items', { name: 'Item A', price: 99 });
      expect(res.data.id).toBe('created_01');
      expect(JSON.parse(capturedBody)).toEqual({ name: 'Item A', price: 99 });
    });

    it('should throw Error with message when API response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: { message: 'Permission Denied for Tenant' } }),
      } as Response);

      await expect(ApiClient.get('/api/v1/forbidden')).rejects.toThrow(
        'Permission Denied for Tenant'
      );
    });
  });
});
