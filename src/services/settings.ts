import { ApiClient } from './api';
import { INITIAL_STORE_SETTINGS, INITIAL_THEME_SETTINGS } from '@/lib/mock-data';
import type { StoreSettings, ThemeSettings } from '@/types';

export class SettingsService {
  private static localStoreSettings: StoreSettings = { ...INITIAL_STORE_SETTINGS };
  private static localThemeSettings: ThemeSettings = { ...INITIAL_THEME_SETTINGS };

  static async getStoreSettings(): Promise<StoreSettings> {
    try {
      const res = await ApiClient.get<StoreSettings>('/api/v1/settings');
      if (res.data) {
        this.localStoreSettings = { ...this.localStoreSettings, ...res.data };
        return this.localStoreSettings;
      }
    } catch {
      // Mock Fallback
    }
    return this.localStoreSettings;
  }

  static async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    this.localStoreSettings = { ...this.localStoreSettings, ...updates };
    try {
      await ApiClient.patch('/api/v1/settings', updates);
    } catch {
      // Mock Fallback
    }
    return this.localStoreSettings;
  }

  static async getThemeSettings(): Promise<ThemeSettings> {
    return this.localThemeSettings;
  }

  static async updateThemeSettings(updates: Partial<ThemeSettings>): Promise<ThemeSettings> {
    this.localThemeSettings = { ...this.localThemeSettings, ...updates };
    try {
      await ApiClient.patch('/api/v1/settings', { theme: updates });
    } catch {
      // Mock Fallback
    }
    return this.localThemeSettings;
  }
}
