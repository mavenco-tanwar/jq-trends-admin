import { ApiClient } from './api';
import { INITIAL_COLLECTIONS } from '@/lib/mock-data';
import type { Collection } from '@/types';

function normalizeCollection(raw: any): Collection {
  return {
    id: raw.id || `col_${Date.now()}`,
    title: raw.title || raw.name || 'Collection',
    slug: raw.slug || `collection-${Date.now()}`,
    description: raw.description || '',
    imageUrl: raw.imageUrl || raw.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
    type: raw.type || 'manual',
    rules: Array.isArray(raw.rules) ? raw.rules : [],
    productIds: Array.isArray(raw.productIds) ? raw.productIds : [],
    productCount: Array.isArray(raw.productIds) ? raw.productIds.length : (typeof raw.productCount === 'number' ? raw.productCount : 0),
    isVisible: raw.isVisible !== false,
    displayOrder: raw.displayOrder || 1,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export class CollectionService {
  private static localCollections: Collection[] = INITIAL_COLLECTIONS.map(normalizeCollection);

  static async getAll(): Promise<Collection[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/collections');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeCollection);
        this.localCollections = normalized;
        return normalized;
      }
    } catch {
      // Mock Fallback
    }
    return this.localCollections;
  }

  static async create(collection: Partial<Collection>): Promise<Collection> {
    const newCol = normalizeCollection({
      id: `col_${Date.now()}`,
      title: collection.title || 'New Collection',
      slug: collection.slug || `collection-${Date.now()}`,
      description: collection.description || '',
      imageUrl: collection.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
      type: collection.type || 'manual',
      rules: collection.rules || [],
      productIds: collection.productIds || [],
      productCount: collection.productIds?.length || 0,
      isVisible: collection.isVisible ?? true,
      displayOrder: this.localCollections.length + 1,
      createdAt: new Date().toISOString(),
    });

    try {
      const res = await ApiClient.post<any>('/api/v1/collections', newCol);
      if (res.data) {
        const persisted = normalizeCollection(res.data);
        this.localCollections.push(persisted);
        return persisted;
      }
    } catch {
      // Mock Fallback
    }

    this.localCollections.push(newCol);
    return newCol;
  }

  static async update(id: string, updates: Partial<Collection>): Promise<Collection> {
    try {
      await ApiClient.patch(`/api/v1/collections/${id}`, updates);
    } catch {
      // Mock Fallback
    }

    this.localCollections = this.localCollections.map((c) =>
      c.id === id ? normalizeCollection({ ...c, ...updates }) : c
    );
    const updated = this.localCollections.find((c) => c.id === id);
    if (!updated) throw new Error('Collection not found');
    return updated;
  }

  static async delete(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/v1/collections/${id}`);
    } catch {
      // Mock Fallback
    }
    this.localCollections = this.localCollections.filter((c) => c.id !== id);
  }
}
