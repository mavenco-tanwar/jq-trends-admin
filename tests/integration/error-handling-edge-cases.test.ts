import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isMongoConfigured, getDatabase } from '@/lib/mongodb';
import { ProductService } from '@/services/products';
import { PlatformService } from '@/services/platform';
import { ApiClient } from '@/services/api';

describe('Error Handling, Edge Cases & System Resilience Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('MongoDB Connection Resilience', () => {
    it('should return false for isMongoConfigured when env URI is empty or malformed', () => {
      const originalUri = process.env.MONGODB_URI;
      try {
        delete process.env.MONGODB_URI;
        delete process.env.MONGO_URI;
        expect(isMongoConfigured()).toBe(false);
      } finally {
        process.env.MONGODB_URI = originalUri;
      }
    });

    it('should safely return null from getDatabase when URI is invalid without crashing', async () => {
      const originalUri = process.env.MONGODB_URI;
      try {
        process.env.MONGODB_URI = 'invalid_protocol://localhost';
        const db = await getDatabase();
        expect(db).toBeNull();
      } finally {
        process.env.MONGODB_URI = originalUri;
      }
    });
  });

  describe('Corrupt Storage & Resilience', () => {
    it('should safely fallback to defaults when localStorage contains corrupt JSON', () => {
      localStorage.setItem('jq_saas_platform_tenants_v1', '{corrupt-json');
      const tenants = PlatformService.getAllTenants();
      expect(Array.isArray(tenants)).toBe(true);

      localStorage.setItem('jq_admin_user', 'undefined');
      const activeTenantId = PlatformService.getActiveTenantId();
      expect(activeTenantId).toBeDefined();
    });
  });

  describe('Product Normalization Edge Cases', () => {
    it('should handle product with empty images, missing prices, and undefined categories', async () => {
      const p = await ProductService.create({
        title: '',
        price: 0,
        images: [] as any,
      });

      expect(p.title).toBe('Untitled Garment');
      expect(p.price).toBe(0);
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.categoryIds).toBeDefined();
    });
  });

  describe('API Client Network Failures', () => {
    it('should handle fetch rejection and surface meaningful error message', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Connection refused'));

      await expect(ApiClient.get('/api/v1/health')).rejects.toThrow('Connection refused');
    });
  });
});
