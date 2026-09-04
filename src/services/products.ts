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
    id: raw.id || (raw._id ? (typeof raw._id === "object" ? raw._id.toString() : String(raw._id)) : undefined) || raw.slug || `prod_${Date.now()}`,
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

import { PlatformService } from './platform';

export class ProductService {
  private static localProducts: Product[] = [...INITIAL_PRODUCTS];

  static async getAll(tenantSlug?: string): Promise<Product[]> {
    try {
      const activeTenant = PlatformService.getActiveTenant();
      const slug = tenantSlug || activeTenant?.slug || 'jq-trends';
      const res = await ApiClient.get<any[]>(`/api/v1/products?tenant=${encodeURIComponent(slug)}`);
      if (res.data && Array.isArray(res.data)) {
        // Enforce strict tenant filtering client-side as defense in depth
        const filtered = res.data.filter((raw: any) => {
          const pSlug = (raw.tenantSlug || raw.storeSlug || raw.tenantId || '').replace(/^store_/, '').toLowerCase();
          return !pSlug || pSlug === slug.toLowerCase();
        });
        const normalized = filtered.map(normalizeProduct);
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
      const activeTenant = PlatformService.getActiveTenant();
      const slug = activeTenant?.slug || 'jq-trends';
      const res = await ApiClient.get<any>(`/api/v1/products/${encodeURIComponent(id)}?tenant=${encodeURIComponent(slug)}`);
      if (res.data) return normalizeProduct(res.data);
    } catch {
      // Mock Fallback
    }
    const found = this.localProducts.find((p) => p.id === id || p.slug === id);
    return found ? normalizeProduct(found) : null;
  }

  static async create(product: Partial<Product>): Promise<Product> {
    const activeTenant = PlatformService.getActiveTenant();
    const slug = (product as any).tenantSlug || activeTenant?.slug || 'jq-trends';
    const newProd: Product = normalizeProduct({
      id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...product,
      tenantId: `store_${slug}`,
      tenantSlug: slug,
      storeSlug: slug,
    });

    try {
      const res = await ApiClient.post<Product>(`/api/v1/products?tenant=${encodeURIComponent(slug)}`, newProd);
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
      await ApiClient.patch(`/api/v1/products/${encodeURIComponent(id)}`, updates);
    } catch (err) {
      console.error('Failed to update product in database:', err);
    }
    const updated = this.localProducts.find((p) => p.id === id);
    if (!updated) throw new Error('Product not found');
    return updated;
  }

  static async delete(id: string): Promise<void> {
    const productToDelete = this.localProducts.find((p) => p.id === id || p.slug === id);
    this.localProducts = this.localProducts.filter((p) => p.id !== id && p.slug !== id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('products_updated', { detail: this.localProducts.length }));
    }
    try {
      const activeTenant = PlatformService.getActiveTenant();
      const slug = activeTenant?.slug || 'jq-trends';
      const targetIdentifier = productToDelete?.id || id;
      const extraQuery = productToDelete?.slug ? `&slug=${encodeURIComponent(productToDelete.slug)}` : '';
      await ApiClient.delete(`/api/v1/products/${encodeURIComponent(targetIdentifier)}?tenant=${encodeURIComponent(slug)}${extraQuery}`);
    } catch (err) {
      console.error('Failed to delete product from database:', err);
    }
  }

  static async bulkDelete(ids: string[]): Promise<void> {
    this.localProducts = this.localProducts.filter((p) => !ids.includes(p.id));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('products_updated', { detail: this.localProducts.length }));
    }
    try {
      await ApiClient.delete(`/api/v1/products?ids=${encodeURIComponent(ids.join(','))}`);
    } catch (err) {
      console.error('Failed to bulk delete products from database:', err);
    }
  }

  static async bulkUpdateStatus(ids: string[], status: 'draft' | 'published' | 'archived'): Promise<void> {
    this.localProducts = this.localProducts.map((p) => (ids.includes(p.id) ? { ...p, status } : p));
    try {
      await ApiClient.patch('/api/v1/products', { ids, status });
    } catch (err) {
      console.error('Failed to bulk update status in database:', err);
    }
  }
}
