import { ApiClient } from './api';
import { PlatformService } from './platform';
import { INITIAL_STORE_SETTINGS, INITIAL_THEME_SETTINGS } from '@/lib/mock-data';
import type { StoreSettings, ThemeSettings } from '@/types';

export class SettingsService {
  private static localStoreSettings: StoreSettings = { ...INITIAL_STORE_SETTINGS };
  private static localThemeSettings: ThemeSettings = { ...INITIAL_THEME_SETTINGS };

  static async getStoreSettings(): Promise<StoreSettings> {
    const tenant = PlatformService.getActiveTenant();
    try {
      const res = await ApiClient.get<any>(`/api/v1/tenant-config?tenant=${tenant.slug}`);
      if (res.data) {
        return {
          ...this.localStoreSettings,
          storeName: res.data.name || tenant.name,
          tagline: res.data.tagline || tenant.tagline,
          currency: res.data.currency || tenant.currency,
          contactEmail: res.data.contact?.email || tenant.ownerEmail,
          phone: res.data.contact?.phone || '+1 (555) 000-0000',
        };
      }
    } catch {
      // Fallback
    }
    return {
      ...this.localStoreSettings,
      storeName: tenant.name,
      tagline: tenant.tagline,
      currency: tenant.currency,
      contactEmail: tenant.ownerEmail,
    };
  }

  static async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const tenant = PlatformService.getActiveTenant();
    this.localStoreSettings = { ...this.localStoreSettings, ...updates };

    if (updates.storeName || updates.tagline) {
      PlatformService.updateTenant(tenant.id, {
        name: updates.storeName || tenant.name,
        tagline: updates.tagline || tenant.tagline,
      });
    }

    try {
      await ApiClient.put(`/api/v1/tenant-config?tenant=${tenant.slug}`, {
        name: updates.storeName,
        tagline: updates.tagline,
        currency: updates.currency,
        contact: {
          email: updates.contactEmail,
          phone: updates.phone,
        },
      });
    } catch {
      // Fallback
    }
    return this.localStoreSettings;
  }

  static async getThemeSettings(): Promise<ThemeSettings> {
    const tenant = PlatformService.getActiveTenant();
    try {
      const res = await ApiClient.get<any>(`/api/v1/tenant-config?tenant=${tenant.slug}`);
      if (res.data?.theme) {
        const t = res.data.theme;
        return {
          ...this.localThemeSettings,
          colors: {
            primary: t.primaryColor || tenant.theme?.primaryColor || '#111111',
            accent: t.accentColor || tenant.theme?.accentColor || '#B77A68',
            background: t.secondaryColor || tenant.theme?.secondaryColor || '#FFFDFC',
            surface: '#FFFFFF',
            text: '#111111',
            textMuted: '#6B7280',
          },
          typography: {
            headingFont: t.headingFont || tenant.theme?.headingFont || 'Playfair Display, serif',
            bodyFont: t.bodyFont || tenant.theme?.bodyFont || 'Plus Jakarta Sans, sans-serif',
          },
        };
      }
    } catch {}

    return {
      ...this.localThemeSettings,
      colors: {
        primary: tenant.theme?.primaryColor || '#111111',
        accent: tenant.theme?.accentColor || '#B77A68',
        background: tenant.theme?.secondaryColor || '#FFFDFC',
        surface: '#FFFFFF',
        text: '#111111',
        textMuted: '#6B7280',
      },
    };
  }

  static async updateThemeSettings(updates: any): Promise<ThemeSettings> {
    const tenant = PlatformService.getActiveTenant();
    this.localThemeSettings = { ...this.localThemeSettings, ...updates };

    PlatformService.updateTenant(tenant.id, {
      theme: {
        primaryColor: updates.colors?.primary || tenant.theme?.primaryColor || '#111111',
        secondaryColor: updates.colors?.background || tenant.theme?.secondaryColor || '#FFFDFC',
        accentColor: updates.colors?.accent || tenant.theme?.accentColor || '#B77A68',
        headingFont: updates.typography?.headingFont || tenant.theme?.headingFont || 'Playfair Display, serif',
        bodyFont: updates.typography?.bodyFont || tenant.theme?.bodyFont || 'Plus Jakarta Sans, sans-serif',
        borderRadius: updates.buttonStyle || 'md',
      },
    });

    try {
      await ApiClient.put(`/api/v1/tenant-config?tenant=${tenant.slug}`, {
        name: updates.storeName,
        tagline: updates.storeTagline,
        theme: {
          primaryColor: updates.colors?.primary,
          secondaryColor: updates.colors?.background,
          accentColor: updates.colors?.accent,
          headingFont: updates.typography?.headingFont,
          bodyFont: updates.typography?.bodyFont,
        },
        announcements: updates.announcements,
      });
    } catch {
      // Fallback
    }

    return this.localThemeSettings;
  }
}
