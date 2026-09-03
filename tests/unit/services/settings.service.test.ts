import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsService } from '@/services/settings';
import { PlatformService } from '@/services/platform';
import { ApiClient } from '@/services/api';

vi.mock('@/services/api');

describe('SettingsService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Store Settings Management', () => {
    it('should retrieve store settings aligned with active tenant', async () => {
      const settings = await SettingsService.getStoreSettings();
      expect(settings).toBeDefined();
      expect(settings.storeName).toBeDefined();
      expect(settings.currency).toBeDefined();
    });

    it('should update store settings and propagate to active tenant', async () => {
      // Seed tenant into platform storage so updateTenant finds it
      const activeTenant = PlatformService.getActiveTenant();
      localStorage.setItem('jq_saas_platform_tenants_v1', JSON.stringify([activeTenant]));

      const updated = await SettingsService.updateStoreSettings({
        storeName: 'JQ Trends Flagship Maison',
        tagline: 'Refined Haute Couture',
        currency: 'INR',
      });

      expect(updated.storeName).toBe('JQ Trends Flagship Maison');
      expect(updated.tagline).toBe('Refined Haute Couture');
      expect(PlatformService.getActiveTenant().name).toBe('JQ Trends Flagship Maison');
    });
  });

  describe('Theme Settings Management', () => {
    it('should retrieve current theme settings', async () => {
      const theme = await SettingsService.getThemeSettings();
      expect(theme.colors).toBeDefined();
      expect(theme.typography).toBeDefined();
    });

    it('should update theme settings colors and typography', async () => {
      const updated = await SettingsService.updateThemeSettings({
        colors: {
          primary: '#222222',
          accent: '#c5a880',
          background: '#ffffff',
        },
        typography: {
          headingFont: 'Playfair Display',
          bodyFont: 'Plus Jakarta Sans',
        },
      });

      expect(updated.colors.primary).toBe('#222222');
      expect(updated.colors.accent).toBe('#c5a880');
    });
  });
});
