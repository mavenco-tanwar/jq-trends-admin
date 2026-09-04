import { ApiClient } from './api';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import type { Product } from '@/types';

function normalizeProduct(raw: any): Product {
  const images = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images.map((img: any, idx: number) =>
        typeof img === 'string'
          ? { id: `img_${idx}`, url: img, isPrimary: idx === 0 }
          : { id: img.id || `img_${idx}`, url: img.url, altText: img.altText, isPrimary: idx === 0 }
      )
    : [
        {
          id: `img_def`,
          url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop',
          isPrimary: true,
        },
      ];

  const categoryIds = Array.isArray(raw.categoryIds) && raw.categoryIds.length > 0
    ? raw.categoryIds
    : raw.categoryId
    ? [raw.categoryId]
    : raw.category?.name
    ? [raw.category.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')]
    : ['cat_women'];

  return {
    id: raw.id || `prod_${Date.now()}`,
    title: raw.title || raw.name || 'Untitled Garment',
    slug: raw.slug || `product-${Date.now()}`,
    description: raw.descriptionHtml || raw.description || '',
    shortDescription: raw.shortDescription || '',
    sku: raw.sku || `JQT-SKU-${Date.now()}`,
    brand: raw.brand || raw.brandName || 'JQ Trends',
    categoryIds,
    collectionIds: Array.isArray(raw.collectionIds) ? raw.collectionIds : [],
    price: typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 1499,
    compareAtPrice: raw.compareAtPrice ? (typeof raw.compareAtPrice === 'number' ? raw.compareAtPrice : parseFloat(raw.compareAtPrice)) : undefined,
    costPrice: raw.costPrice ? (typeof raw.costPrice === 'number' ? raw.costPrice : parseFloat(raw.costPrice)) : undefined,
    images,
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    status: raw.status === 'draft' || raw.status === 'archived' ? raw.status : 'published',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    trackInventory: raw.trackInventory ?? true,
    stock: typeof raw.stock === 'number' ? raw.stock : raw.inventoryQuantity ?? 50,
    lowStockThreshold: raw.lowStockThreshold || 10,
    allowBackorders: raw.allowBackorders || false,
    seo: raw.seo || { title: raw.title || raw.name, description: raw.shortDescription },
    shipping: raw.shipping || { weightKg: raw.weight || 0.4, isExpressAvailable: true },
    badges: raw.badges || { isFeatured: false, isNewArrival: true, isBestSeller: false },
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export class ProductService {
  private static localProducts: Product[] = [...INITIAL_PRODUCTS];

  static async getAll(): Promise<Product[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/products');
      if (res.data && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeProduct);
        this.localProducts = normalized;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('products_updated', { detail: normalized.length }));
        }
        return normalized;
      }
    } catch {
      // Mock Fallback
    }
    return this.localProducts.map(normalizeProduct);
  }

  static async getById(id: string): Promise<Product | null> {
    try {
      const res = await ApiClient.get<any>(`/api/v1/products/${id}`);
      if (res.data) return normalizeProduct(res.data);
    } catch {
      // Mock Fallback
    }
    const found = this.localProducts.find((p) => p.id === id || p.slug === id);
    return found ? normalizeProduct(found) : null;
  }

  static async create(product: Partial<Product>): Promise<Product> {
    const newProd: Product = normalizeProduct({
      id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...product,
    });

    try {
      const res = await ApiClient.post<Product>('/api/v1/products', newProd);
      if (res.data && !Array.isArray(res.data) && (res.data.id || res.data.title)) {
        const norm = normalizeProduct(res.data);
        this.localProducts = [norm, ...this.localProducts];
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('products_updated', { detail: this.localProducts.length }));
        }
        return norm;
      }
    } catch {
      // Mock Fallback
    }
    this.localProducts = [newProd, ...this.localProducts];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('products_updated', { detail: this.localProducts.length }));
    }
    return newProd;
  }

  static async update(id: string, updates: Partial<Product>): Promise<Product> {
    this.localProducts = this.localProducts.map((p) => (p.id === id ? normalizeProduct({ ...p, ...updates }) : p));
    try {
      await ApiClient.patch(`/api/v1/products/${id}`, updates);
    } catch {
      // Mock Fallback
    }
    const updated = this.localProducts.find((p) => p.id === id);
    if (!updated) throw new Error('Product not found');
    return updated;
  }

  static async delete(id: string): Promise<void> {
    this.localProducts = this.localProducts.filter((p) => p.id !== id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('products_updated', { detail: this.localProducts.length }));
    }
    try {
      await ApiClient.delete(`/api/v1/products/${id}`);
    } catch {
      // Mock Fallback
    }
  }

  static async bulkDelete(ids: string[]): Promise<void> {
    this.localProducts = this.localProducts.filter((p) => !ids.includes(p.id));
  }

  static async bulkUpdateStatus(ids: string[], status: 'draft' | 'published' | 'archived'): Promise<void> {
    this.localProducts = this.localProducts.map((p) => (ids.includes(p.id) ? { ...p, status } : p));
  }
}
