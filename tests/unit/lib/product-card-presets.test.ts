import { describe, it, expect } from 'vitest';
import {
  getDefaultProductCardConfig,
  PRODUCT_CARD_PRESETS,
} from '@/lib/product-card-presets';

describe('Product Card Presets Unit Tests', () => {
  describe('getDefaultProductCardConfig', () => {
    it('should generate default product card configuration', () => {
      const config = getDefaultProductCardConfig('store_jqtrends');
      expect(config).toBeDefined();
      expect(config.tenantId).toBe('store_jqtrends');
      expect(config.badges).toBeDefined();
      expect(config.quickView).toBeDefined();
      expect(config.price).toBeDefined();
    });
  });

  describe('PRODUCT_CARD_PRESETS', () => {
    it('should provide presets with getConfig functions', () => {
      const keys = Object.keys(PRODUCT_CARD_PRESETS);
      expect(keys.length).toBeGreaterThan(0);

      keys.forEach((key) => {
        const preset = (PRODUCT_CARD_PRESETS as any)[key];
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
