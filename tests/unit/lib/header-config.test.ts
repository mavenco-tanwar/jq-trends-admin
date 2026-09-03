import { describe, it, expect } from 'vitest';
import { getDefaultHeaderConfig, LUXURY_PRESET_TEMPLATES } from '@/lib/header-config';

describe('Header Configuration & Presets Unit Tests', () => {
  describe('getDefaultHeaderConfig', () => {
    it('should generate default header config for tenant slug', () => {
      const config = getDefaultHeaderConfig('jqtrends');
      expect(config.id).toBe('header_jqtrends');
      expect(config.tenantSlug).toBe('jqtrends');
      expect(config.announcementBar.enabled).toBe(true);
      expect(config.mainHeader.enabled).toBe(true);
      expect(config.mainHeader.maxWidth).toBe(1400);
    });

    it('should support fallback default slug', () => {
      const config = getDefaultHeaderConfig();
      expect(config.tenantSlug).toBe('lumina');
    });
  });

  describe('LUXURY_PRESET_TEMPLATES', () => {
    it('should provide pre-configured header presets with getConfig generators', () => {
      expect(LUXURY_PRESET_TEMPLATES).toBeDefined();
      const keys = Object.keys(LUXURY_PRESET_TEMPLATES);
      expect(keys.length).toBeGreaterThan(0);

      keys.forEach((key) => {
        const preset = LUXURY_PRESET_TEMPLATES[key];
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(typeof preset.getConfig).toBe('function');

        const generated = preset.getConfig('jqtrends', 'JQ Trends');
        expect(generated).toBeDefined();
      });
    });
  });
});
