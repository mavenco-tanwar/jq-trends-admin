import { ApiClient } from './api';
import { PlatformService } from './platform';
import type { Category } from '@/types';

function getActiveTenantSlug(): string {
  try {
    const active = PlatformService.getActiveTenant();
    if (active?.slug && active.slug !== 'all' && active.slug !== 'lumina') {
      return active.slug.toLowerCase().trim();
    }
  } catch {}

  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qTenant = urlParams.get('tenant');
      if (qTenant && qTenant !== 'all' && qTenant !== 'lumina') {
        return qTenant.replace(/^store_/, '').trim().toLowerCase();
      }
      const storedId = localStorage.getItem('jq_saas_active_tenant_id');
      if (storedId && storedId !== 'all' && storedId !== 'lumina') {
        return storedId.replace(/^store_/, '').trim().toLowerCase();
      }
      const storedSlug = localStorage.getItem('jq_saas_active_tenant_slug');
      if (storedSlug && storedSlug !== 'all' && storedSlug !== 'lumina') {
        return storedSlug.replace(/^store_/, '').trim().toLowerCase();
      }
      const userRaw = localStorage.getItem('jq_admin_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.tenantSlug && u.tenantSlug !== 'all') {
          return u.tenantSlug.replace(/^store_/, '').trim().toLowerCase();
        }
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

/**
 * Builds a hierarchical tree from a flat list of category documents.
 * Correctly nests subcategories (where parentId !== null) inside their matching parent's children array.
 * If a parent was deleted or is missing, promotes orphaned subcategory to root so it is never hidden.
 */
export function buildCategoryTree(flatList: Category[]): Category[] {
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  // Initialize all nodes with an empty children array
  flatList.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  // Attach children to matching parents, or mark as root
  flatList.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children!.push(node);
    } else {
      // If parent does not exist, reset parentId so it renders cleanly as a top-level category
      node.parentId = null;
      roots.push(node);
    }
  });

  return roots;
}

export class CategoryService {
  /**
   * Returns the flat list of all categories strictly for the active tenant.
   */
  static async getFlatList(): Promise<Category[]> {
    const tenantSlug = getActiveTenantSlug();
    try {
      const res = await ApiClient.get<any[]>(`/api/v1/categories?tenant=${encodeURIComponent(tenantSlug)}`, { bypassCache: true });
      if (res && Array.isArray(res.data)) {
        // Enforce strict client-side tenant isolation defense-in-depth
        const filtered = res.data.filter((raw: any) => {
          const rawSlug = (raw.tenantSlug || raw.storeSlug || raw.tenantId || '').replace(/^store_/, '').toLowerCase();
          return !rawSlug || rawSlug === tenantSlug.toLowerCase();
        });
        return filtered.map(normalizeCategory);
      }
    } catch (err) {
      console.warn(`[CategoryService] Could not fetch categories for tenant '${tenantSlug}':`, err);
    }
    return [];
  }

  /**
   * Returns categories structured as a nested hierarchy tree strictly for the active tenant.
   */
  static async getAll(): Promise<Category[]> {
    const flat = await this.getFlatList();
    const tree = buildCategoryTree(flat);
    return tree;
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
        displayOrder: 1,
        isVisible: category.isVisible ?? true,
        productCount: 0,
        seo: category.seo || { title: cleanName },
      }),
      tenantSlug,
      storeSlug: tenantSlug,
      tenantId: `store_${tenantSlug}`,
    };

    try {
      ApiClient.clearCache('/api/v1/categories');
    const res = await ApiClient.post<any>(`/api/v1/categories?tenant=${encodeURIComponent(tenantSlug)}`, newCat);
    ApiClient.clearCache('/api/v1/categories');
      if (res && res.data) {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('categories_updated'));
        return normalizeCategory(res.data);
      }
    } catch (err) {
      console.error('[CategoryService] Failed to persist category to database:', err);
    }

    return newCat;
  }

  static async update(id: string, updates: Partial<Category>): Promise<Category> {
    const tenantSlug = getActiveTenantSlug();
    try {
      ApiClient.clearCache('/api/v1/categories');
      await ApiClient.patch(`/api/v1/categories/${encodeURIComponent(id)}?tenant=${encodeURIComponent(tenantSlug)}`, {
        ...updates,
        tenantSlug,
        storeSlug: tenantSlug,
        tenantId: `store_${tenantSlug}`,
      });
    } catch (err) {
      console.warn('[CategoryService] Failed to update category via API:', err);
    }

    return normalizeCategory({ id, ...updates });
  }

  static async delete(id: string): Promise<void> {
    if (!id || id === 'undefined' || id === 'null') return;
    const tenantSlug = getActiveTenantSlug();
    try {
      ApiClient.clearCache('/api/v1/categories');
      await ApiClient.delete(`/api/v1/categories/${encodeURIComponent(id)}?tenant=${encodeURIComponent(tenantSlug)}`);
      ApiClient.clearCache('/api/v1/categories');
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('categories_updated'));
    } catch (err) {
      console.warn('[CategoryService] Failed to delete category via API:', err);
    }
  }
}
