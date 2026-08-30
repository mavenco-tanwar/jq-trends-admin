import { ApiClient } from './api';
import type { NavigationMenu, NavigationItem } from '@/types';

function normalizeMenu(raw: any): NavigationMenu {
  return {
    id: raw.id || `menu_${Date.now()}`,
    title: raw.title || raw.name || 'Navigation Menu',
    slug: raw.slug || raw.code || 'main-menu',
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any) => ({
          id: it.id || `nav_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          label: it.label || it.title || 'Link',
          type: it.type || 'custom',
          url: it.url || it.href || '/',
          isVisible: it.isVisible !== false,
          children: Array.isArray(it.children) ? it.children : undefined,
        }))
      : [],
  };
}

export class NavigationService {
  private static localMenus: NavigationMenu[] = [
    {
      id: 'menu_header',
      title: 'Storefront Header Main Navigation',
      slug: 'header-menu',
      items: [
        { id: 'nav_1', label: 'Women', type: 'category', url: '/women', isVisible: true },
        { id: 'nav_2', label: 'Kids', type: 'category', url: '/kids', isVisible: true },
        { id: 'nav_3', label: 'New Arrivals', type: 'collection', url: '/new-arrivals', isVisible: true },
        { id: 'nav_4', label: 'Collections', type: 'collection', url: '/collections/festive-elegance', isVisible: true },
        { id: 'nav_5', label: 'Sale', type: 'collection', url: '/sale', isVisible: true },
      ],
    },
    {
      id: 'menu_footer_shop',
      title: 'Footer Shop Links',
      slug: 'footer-menu-shop',
      items: [
        { id: 'nav_f1', label: "Women's Dresses", type: 'category', url: '/women', isVisible: true },
        { id: 'nav_f2', label: 'Chanderi Kurtis', type: 'category', url: '/women', isVisible: true },
        { id: 'nav_f3', label: 'Girls Party Wear', type: 'category', url: '/kids', isVisible: true },
        { id: 'nav_f4', label: 'Boys Kurtas', type: 'category', url: '/kids', isVisible: true },
      ],
    },
    {
      id: 'menu_footer_care',
      title: 'Footer Customer Care',
      slug: 'footer-menu-care',
      items: [
        { id: 'nav_f5', label: 'Track Order', type: 'page', url: '/account', isVisible: true },
        { id: 'nav_f6', label: 'Shipping Policy', type: 'page', url: '/shipping-policy', isVisible: true },
        { id: 'nav_f7', label: 'Returns & Exchange', type: 'page', url: '/return-policy', isVisible: true },
        { id: 'nav_f8', label: 'FAQ & Contact', type: 'page', url: '/contact', isVisible: true },
      ],
    },
  ];

  static async getAll(): Promise<NavigationMenu[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/content/menus');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        this.localMenus = res.data.map(normalizeMenu);
        return this.localMenus;
      }
    } catch {
      // Fallback
    }
    return this.localMenus;
  }

  static async updateMenu(id: string, items: NavigationItem[]): Promise<NavigationMenu> {
    const targetMenu = this.localMenus.find((m) => m.id === id || m.slug === id);
    const code = targetMenu?.slug || id;

    try {
      await ApiClient.put(`/api/v1/content/menus/code/${code}`, { items });
    } catch {
      // Fallback
    }

    this.localMenus = this.localMenus.map((m) =>
      m.id === id || m.slug === id ? { ...m, items } : m
    );
    const updated = this.localMenus.find((m) => m.id === id || m.slug === id);
    if (!updated) throw new Error('Menu not found');
    return updated;
  }
}
