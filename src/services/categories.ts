import { ApiClient } from './api';
import type { Category } from '@/types';

function getActiveTenantSlug(): string {
  if (typeof window === 'undefined') return 'jq-trends';
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const qTenant = urlParams.get('tenant');
    if (qTenant && qTenant !== 'all' && qTenant !== 'lumina') {
      return qTenant.replace(/^store_/, '').trim().toLowerCase();
    }
    const storedSlug = localStorage.getItem('jq_saas_active_tenant_slug');
    if (storedSlug && storedSlug !== 'all' && storedSlug !== 'lumina') {
      return storedSlug.replace(/^store_/, '').trim().toLowerCase();
    }
    const storedId = localStorage.getItem('jq_saas_active_tenant_id');
    if (storedId && storedId !== 'all' && storedId !== 'lumina') {
      return storedId.replace(/^store_/, '').trim().toLowerCase();
    }
    const userRaw = localStorage.getItem('jq_admin_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u.tenantSlug && u.tenantSlug !== 'all') {
        return u.tenantSlug.replace(/^store_/, '').trim().toLowerCase();
      }
    }
  } catch {}
  return 'jq-trends';
}

function normalizeCategory(raw: any): Category {
  return {
    id: raw.id || `cat_${Date.now()}`,
    name: raw.name || raw.title || 'Category',
    slug: raw.slug || (raw.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: raw.description || '',
    imageUrl: raw.imageUrl || raw.image || '',
    parentId: raw.parentId || null,
    displayOrder: raw.displayOrder || 1,
    isVisible: raw.isVisible !== false,
    productCount: raw.productCount || 0,
    seo: raw.seo || { title: raw.name },
    children: Array.isArray(raw.children) ? raw.children.map(normalizeCategory) : [],
  };
}

export class CategoryService {
  private static localCategories: Category[] = [];

  static async getAll(): Promise<Category[]> {
    const tenantSlug = getActiveTenantSlug();
    try {
      const res = await ApiClient.get<any[]>(`/api/v1/categories?tenant=${encodeURIComponent(tenantSlug)}`);
      if (res && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeCategory);
        this.localCategories = normalized;
        return normalized;
      }
    } catch (err) {
      console.warn(`[CategoryService] Could not fetch categories for tenant '${tenantSlug}':`, err);
    }
    // Strict zero-fallback rule: Return empty array when no categories are created yet
    this.localCategories = [];
    return [];
  }

  static async create(category: Partial<Category>): Promise<Category> {
    const tenantSlug = getActiveTenantSlug();
    const cleanName = category.name || 'New Category';
    const cleanSlug = category.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catId = `cat_${cleanSlug}_${tenantSlug}`;

    const newCat = {
      ...normalizeCategory({
        id: catId,
        name: cleanName,
        slug: cleanSlug,
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        parentId: category.parentId || null,
        displayOrder: this.localCategories.length + 1,
        isVisible: category.isVisible ?? true,
        productCount: 0,
        seo: category.seo || { title: cleanName },
      }),
      tenantSlug,
      storeSlug: tenantSlug,
      tenantId: `store_${tenantSlug}`,
    };

    try {
      const res = await ApiClient.post<any>('/api/v1/categories', newCat);
      if (res && res.data) {
        const persisted = normalizeCategory(res.data);
        this.localCategories.push(persisted);
        return persisted;
      }
    } catch (err) {
      console.error('[CategoryService] Failed to persist category to database:', err);
    }

    this.localCategories.push(newCat);
    return newCat;
  }

  static async update(id: string, updates: Partial<Category>): Promise<Category> {
    const tenantSlug = getActiveTenantSlug();
    try {
      await ApiClient.patch(`/api/v1/categories/${encodeURIComponent(id)}?tenant=${encodeURIComponent(tenantSlug)}`, {
        ...updates,
        tenantSlug,
        storeSlug: tenantSlug,
      });
    } catch (err) {
      console.warn('[CategoryService] Failed to update category via API:', err);
    }

    this.localCategories = this.localCategories.map((c) => {
      if (c.id === id) return { ...c, ...updates };
      if (c.children) {
        return {
          ...c,
          children: c.children.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)),
        };
      }
      return c;
    });

    const updated = this.localCategories.find((c) => c.id === id);
    if (!updated) {
      return normalizeCategory({ id, ...updates });
    }
    return updated;
  }

  static async delete(id: string): Promise<void> {
    const tenantSlug = getActiveTenantSlug();
    try {
      await ApiClient.delete(`/api/v1/categories/${encodeURIComponent(id)}?tenant=${encodeURIComponent(tenantSlug)}`);
    } catch (err) {
      console.warn('[CategoryService] Failed to delete category via API:', err);
    }
    this.localCategories = this.localCategories.filter((c) => c.id !== id);
  }
}
