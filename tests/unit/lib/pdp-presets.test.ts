import { describe, it, expect } from 'vitest';
import {
  getDefaultPdpConfig,
  PDP_PRESET_TEMPLATES,
  DEFAULT_PURCHASE_ELEMENTS_ORDER,
} from '@/lib/pdp-presets';

describe('PDP Presets & Templates Unit Tests', () => {
  describe('getDefaultPdpConfig', () => {
    it('should generate valid product detail page config', () => {
      const config = getDefaultPdpConfig('jqtrends');
      expect(config).toBeDefined();
      expect(config.gallery).toBeDefined();
      expect(config.purchasePanel).toBeDefined();
      expect(config.purchasePanel.elementsOrder).toEqual(DEFAULT_PURCHASE_ELEMENTS_ORDER);
    });
  });

  describe('PDP_PRESET_TEMPLATES', () => {
    it('should contain preset designs like luxury, editorial, or minimal', () => {
      const keys = Object.keys(PDP_PRESET_TEMPLATES);
      expect(keys.length).toBeGreaterThan(0);

      keys.forEach((key) => {
        const template = PDP_PRESET_TEMPLATES[key];
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.config.gallery).toBeDefined();
        expect(template.config.purchasePanel).toBeDefined();
      });
    });
  });
});
