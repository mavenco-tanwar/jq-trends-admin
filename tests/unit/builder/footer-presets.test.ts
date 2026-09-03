import { describe, it, expect } from 'vitest';
import { getDefaultFooterDocument, FOOTER_PRESETS } from '@/components/builder/presets/footerPresets';

describe('Footer Presets & Builder Documents Unit Tests', () => {
  describe('getDefaultFooterDocument', () => {
    it('should generate default footer builder document with sections and blocks', () => {
      const doc = getDefaultFooterDocument('jqtrends', 'JQ Trends Atelier');

      expect(doc.id).toBe('doc_footer_jqtrends');
      expect(doc.tenantSlug).toBe('jqtrends');
      expect(doc.type).toBe('footer');
      expect(doc.sections.length).toBeGreaterThan(0);
      expect(doc.theme).toBeDefined();

      const mainSection = doc.sections.find((s) => s.id === 'sec_footer_main');
      expect(mainSection).toBeDefined();
      expect(mainSection?.blocks.length).toBeGreaterThan(0);
    });
  });

  describe('FOOTER_PRESETS', () => {
    it('should include curated presets with theme styling and layout metadata', () => {
      expect(FOOTER_PRESETS).toBeDefined();
      expect(FOOTER_PRESETS.length).toBeGreaterThan(0);

      FOOTER_PRESETS.forEach((preset) => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(preset.badge).toBeDefined();
      });
    });
  });
});
