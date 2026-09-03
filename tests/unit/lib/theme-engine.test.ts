import { describe, it, expect } from 'vitest';
import { generateThemeCssVariables, resolveThemeStyle } from '@/lib/theme-engine';
import { getDefaultTheme } from '@/lib/theme-presets';

describe('Theme Engine & Design Tokens Unit Tests', () => {
  const defaultTheme = getDefaultTheme('jqtrends', 'JQ Trends');

  describe('generateThemeCssVariables', () => {
    it('should generate valid CSS root variables from ThemeDocument', () => {
      const css = generateThemeCssVariables(defaultTheme);

      expect(css).toContain(':root {');
      expect(css).toContain('--theme-color-primary:');
      expect(css).toContain('--theme-color-secondary:');
      expect(css).toContain('--theme-color-background:');
      expect(css).toContain('--theme-font-heading:');
      expect(css).toContain('--theme-font-body:');
      expect(css).toContain('--theme-btn-primary-bg:');
      expect(css).toContain('--theme-card-radius:');
      expect(css).toContain('--theme-radius-full:');
    });

    it('should append customCss if present in theme document', () => {
      const themeWithCustom = {
        ...defaultTheme,
        customCss: '.luxury-badge { backdrop-filter: blur(12px); }',
      };

      const css = generateThemeCssVariables(themeWithCustom);
      expect(css).toContain('.luxury-badge { backdrop-filter: blur(12px); }');
    });
  });

  describe('resolveThemeStyle Cascade Resolution', () => {
    it('should prioritize Component override first', () => {
      const result = resolveThemeStyle('#ff0000', '#00ff00', '#0000ff', '#111111');
      expect(result).toBe('#ff0000');
    });

    it('should fallback to Section override when Component is unset or inherit', () => {
      const result = resolveThemeStyle('inherit', '#00ff00', '#0000ff', '#111111');
      expect(result).toBe('#00ff00');
    });

    it('should fallback to Theme value when Component and Section are empty', () => {
      const result = resolveThemeStyle('', 'inherit', '#0000ff', '#111111');
      expect(result).toBe('#0000ff');
    });

    it('should return Platform Default when all levels are empty', () => {
      const result = resolveThemeStyle('', '', '', '#111111');
      expect(result).toBe('#111111');
    });
  });
});
