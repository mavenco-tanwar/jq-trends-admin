import { ApiClient } from './api';
import { INITIAL_MEDIA } from '@/lib/mock-data';
import type { MediaAsset } from '@/types';

const STORAGE_KEY = 'jq_trends_admin_custom_media_v1';

function normalizeMedia(raw: any): MediaAsset {
  return {
    id: raw.id || `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    filename: raw.filename || raw.originalName || `image-${Date.now()}.jpg`,
    url: raw.url || raw.cdnUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
    altText: raw.altText || '',
    folder: raw.folder || raw.folderId || 'Products',
    mimeType: raw.mimeType || 'image/jpeg',
    sizeBytes: raw.sizeBytes || 320000,
    width: raw.width || 1200,
    height: raw.height || 1200,
    usedInCount: raw.usedInCount || 0,
    usedIn: Array.isArray(raw.usedIn) ? raw.usedIn : [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function getStoredCustomMedia(): MediaAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomMedia(list: MediaAsset[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export class MediaService {
  private static baseMedia: MediaAsset[] = INITIAL_MEDIA.map(normalizeMedia);

  static async getAll(): Promise<MediaAsset[]> {
    const custom = getStoredCustomMedia();
    try {
      const res = await ApiClient.get<any[]>('/api/v1/media');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const backendMedia = res.data.map(normalizeMedia);
        return [...custom, ...backendMedia];
      }
    } catch {
      // Fallback
    }
    return [...custom, ...this.baseMedia];
  }

  static async upload(asset: Partial<MediaAsset>): Promise<MediaAsset> {
    const newMedia = normalizeMedia({
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      filename: asset.filename || `image-${Date.now()}.jpg`,
      url: asset.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
      altText: asset.altText || asset.filename?.replace(/\.[^/.]+$/, '') || '',
      folder: asset.folder || 'Products',
      mimeType: asset.mimeType || 'image/jpeg',
      sizeBytes: asset.sizeBytes || 320000,
      width: asset.width || 1200,
      height: asset.height || 1200,
      usedInCount: 0,
      usedIn: [],
      createdAt: new Date().toISOString(),
    });

    const currentCustom = getStoredCustomMedia();
    const updated = [newMedia, ...currentCustom];
    saveCustomMedia(updated);

    return newMedia;
  }

  static async delete(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/v1/media/${id}`);
    } catch {
      // Fallback
    }
    const currentCustom = getStoredCustomMedia();
    const updated = currentCustom.filter((m) => m.id !== id);
    saveCustomMedia(updated);
    this.baseMedia = this.baseMedia.filter((m) => m.id !== id);
  }
}
