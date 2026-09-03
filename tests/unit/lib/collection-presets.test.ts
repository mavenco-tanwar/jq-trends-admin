import { describe, it, expect } from 'vitest';
import { getDefaultCollectionPageConfig, COLLECTION_PAGE_PRESETS } from '@/lib/collection-page-presets';

describe('Collection Page Presets Unit Tests', () => {
  describe('getDefaultCollectionPageConfig', () => {
    it('should generate collection page configuration for tenant', () => {
      const config = getDefaultCollectionPageConfig('store_jqtrends');
      expect(config).toBeDefined();
      expect(config.tenantId).toBe('store_jqtrends');
      expect(config.grid).toBeDefined();
      expect(config.grid.desktopColumns).toBeGreaterThanOrEqual(2);
      expect(config.filters).toBeDefined();
      expect(config.pagination).toBeDefined();
    });
  });

  describe('COLLECTION_PAGE_PRESETS', () => {
    it('should provide preset options with getConfig methods', () => {
      expect(COLLECTION_PAGE_PRESETS).toBeDefined();
      const keys = Object.keys(COLLECTION_PAGE_PRESETS);
      expect(keys.length).toBeGreaterThan(0);

      keys.forEach((key) => {
        const preset = (COLLECTION_PAGE_PRESETS as any)[key];
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(typeof preset.getConfig).toBe('function');

        const cfg = preset.getConfig('store_jqtrends');
        expect(cfg).toBeDefined();
        expect(cfg.tenantId).toBe('store_jqtrends');
      });
    });
  });
});
