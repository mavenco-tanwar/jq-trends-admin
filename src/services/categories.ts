import { ApiClient } from './api';
import { INITIAL_CATEGORIES } from '@/lib/mock-data';
import type { Category } from '@/types';

function normalizeCategory(raw: any): Category {
  return {
    id: raw.id || `cat_${Date.now()}`,
    name: raw.name || raw.title || 'Category',
    slug: raw.slug || `cat-${Date.now()}`,
    description: raw.description || '',
    imageUrl: raw.imageUrl || raw.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop',
    parentId: raw.parentId || null,
    displayOrder: raw.displayOrder || 1,
    isVisible: raw.isVisible !== false,
    productCount: raw.productCount || 0,
    seo: raw.seo || { title: raw.name },
    children: Array.isArray(raw.children) ? raw.children.map(normalizeCategory) : [],
  };
}

export class CategoryService {
  private static localCategories: Category[] = INITIAL_CATEGORIES.map(normalizeCategory);

  static async getAll(): Promise<Category[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/categories');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeCategory);
        this.localCategories = normalized;
        return normalized;
      }
    } catch {
      // Mock Fallback
    }
    return this.localCategories;
  }

  static async create(category: Partial<Category>): Promise<Category> {
    const newCat = normalizeCategory({
      id: `cat_${Date.now()}`,
      name: category.name || 'New Category',
      slug: category.slug || `cat-${Date.now()}`,
      description: category.description || '',
      imageUrl: category.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop',
      parentId: category.parentId || null,
      displayOrder: this.localCategories.length + 1,
      isVisible: category.isVisible ?? true,
      productCount: 0,
      seo: category.seo || { title: category.name },
    });

    try {
      const res = await ApiClient.post<any>('/api/v1/categories', newCat);
      if (res.data) {
        const persisted = normalizeCategory(res.data);
        this.localCategories.push(persisted);
        return persisted;
      }
    } catch {
      // Mock Fallback
    }

    this.localCategories.push(newCat);
    return newCat;
  }

  static async update(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      await ApiClient.patch(`/api/v1/categories/${id}`, updates);
    } catch {
      // Mock Fallback
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
    if (!updated) throw new Error('Category not found');
    return updated;
  }

  static async delete(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/api/v1/categories/${id}`);
    } catch {
      // Mock Fallback
    }
    this.localCategories = this.localCategories.filter((c) => c.id !== id);
  }
}
