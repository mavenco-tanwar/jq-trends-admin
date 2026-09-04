import { ApiClient } from './api';
import { INITIAL_MEDIA } from '@/lib/mock-data';
import type { MediaAsset } from '@/types';

const STORAGE_KEY = 'jq_trends_admin_custom_media_v1';

export async function optimizeImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({ dataUrl: '', width: 1200, height: 1200, sizeBytes: file.size });
    };
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        resolve({ dataUrl: rawResult, width: 1200, height: 1200, sizeBytes: file.size });
      };
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              dataUrl: rawResult,
              width: img.width,
              height: img.height,
              sizeBytes: file.size,
            });
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mime = file.type.includes('png') ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mime, quality);
          const approxSize = Math.round((dataUrl.length * 3) / 4);
          resolve({ dataUrl, width, height, sizeBytes: approxSize });
        } catch {
          resolve({ dataUrl: rawResult, width: img.width, height: img.height, sizeBytes: file.size });
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

function normalizeMedia(raw: any): MediaAsset {
  return {
    id: raw.id || raw._id || `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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
    const safeList = list.slice(0, 40).map((item) => {
      if (item.url && item.url.startsWith('data:') && item.url.length > 350000) {
        return {
          ...item,
          url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop',
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeList));
  } catch (e) {
    console.warn('Failed to save media to localStorage quota:', e);
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
      id: asset.id || `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

    try {
      const res = await ApiClient.post('/api/v1/media', newMedia);
      if (res.data) {
        return normalizeMedia(res.data);
      }
    } catch (err) {
      console.warn('Media upload to backend failed, using local copy:', err);
    }

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
