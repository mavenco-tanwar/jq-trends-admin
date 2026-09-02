import { CollectionPageConfig } from '../types/collection-page.types';

export function getDefaultCollectionPageConfig(tenantId: string = 'lumina'): CollectionPageConfig {
  return {
    id: `col_page_${tenantId}`,
    tenantId,
    templateId: 'default_fashion',
    name: 'Default Fashion Collection',
    status: 'published',
    version: 1,

    hero: {
      enabled: true,
      title: 'Atelier Spring / Summer Lookbook',
      description: 'Handcrafted silhouettes engineered from organic silks, heritage linens, and bespoke embroidery.',
      bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      mobileImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      overlayOpacity: 45,
      alignment: 'center',
      height: 'medium',
      ctaText: 'Explore Lookbook',
      ctaLink: '#products',
    },

    breadcrumbs: {
      enabled: true,
      showHome: true,
      separator: '/',
    },

    header: {
      enabled: true,
      showCount: true,
      showDescription: true,
      alignment: 'left',
    },

    toolbar: {
      showCount: true,
      showFilterBtn: true,
      showSort: true,
      showViewToggle: true,
      defaultView: 'grid',
    },

    filters: {
      position: 'left',
      sticky: true,
      items: [
        { id: 'f_cat', key: 'category', label: 'Category', type: 'checkbox', enabled: true, collapsed: false, position: 1 },
        { id: 'f_color', key: 'color', label: 'Color Palette', type: 'color', enabled: true, collapsed: false, position: 2 },
        { id: 'f_size', key: 'size', label: 'Size', type: 'swatch', enabled: true, collapsed: false, position: 3 },
        { id: 'f_price', key: 'price', label: 'Price Range', type: 'range', enabled: true, collapsed: false, position: 4 },
        { id: 'f_instock', key: 'in_stock', label: 'In Stock Only', type: 'boolean', enabled: true, collapsed: false, position: 5 },
      ],
    },

    sorting: {
      defaultSort: 'featured',
      items: [
        { key: 'featured', label: 'Featured & Best Selling', enabled: true, position: 1 },
        { key: 'newest', label: 'Newest Arrivals', enabled: true, position: 2 },
        { key: 'price_asc', label: 'Price: Low to High', enabled: true, position: 3 },
        { key: 'price_desc', label: 'Price: High to Low', enabled: true, position: 4 },
        { key: 'rating', label: 'Highest Customer Rating', enabled: true, position: 5 },
      ],
    },

    grid: {
      desktopColumns: 4,
      tabletColumns: 3,
      mobileColumns: 2,
      gap: '24px',
    },

    pagination: {
      type: 'pagination',
      productsPerPage: 24,
    },

    promo: {
      enabled: true,
      insertAfterIndex: 4,
      title: 'Private Client Concierge',
      subtitle: 'Schedule a virtual styling session with our senior master atelier.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
      ctaText: 'Book Private Appointment',
      ctaLink: '/about',
      colSpan: '2',
    },

    seo: {
      metaTitle: 'Curated Designer Collections | Lumina Atelier',
      metaDescription: 'Discover our complete collection of bespoke women wear, handcrafted co-ords, and luxury accessories.',
      canonicalUrl: 'https://lumina-atelier.com/collections',
      ogImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    },
  };
}

export const COLLECTION_PAGE_PRESETS: {
  id: string;
  name: string;
  description: string;
  getConfig: (tenantId: string) => CollectionPageConfig;
}[] = [
  {
    id: 'default_fashion',
    name: 'Default Fashion Lookbook (JQ Trends / Lumina)',
    description: 'Hero background banner, sticky left filter sidebar, 4-column desktop grid, and promotional insert.',
    getConfig: (tId) => getDefaultCollectionPageConfig(tId),
  },
  {
    id: 'minimal_studio',
    name: 'Minimalist Scandinavian Studio',
    description: 'Header-only top layout without large hero, drawer filters, and high-contrast 4-column square cards.',
    getConfig: (tId) => {
      const c = getDefaultCollectionPageConfig(tId);
      c.name = 'Minimalist Studio Template';
      c.hero.enabled = false;
      c.filters.position = 'none';
      c.grid.desktopColumns = 4;
      c.promo.enabled = false;
      return c;
    },
  },
  {
    id: 'luxury_atelier',
    name: 'Luxury Haute Couture & Atelier',
    description: 'Centered dramatic hero, 3-column spacious luxury grid, gold accents, and private concierge promo.',
    getConfig: (tId) => {
      const c = getDefaultCollectionPageConfig(tId);
      c.name = 'Luxury Haute Couture Template';
      c.hero.height = 'large';
      c.hero.alignment = 'center';
      c.grid.desktopColumns = 3;
      c.promo.colSpan = 'full';
      return c;
    },
  },
  {
    id: 'editorial_magazine',
    name: 'Editorial Storytelling Lookbook',
    description: 'Split layout hero, large editorial descriptions, 3-column cards, and embedded lookbook notes.',
    getConfig: (tId) => {
      const c = getDefaultCollectionPageConfig(tId);
      c.name = 'Editorial Storytelling Template';
      c.hero.alignment = 'left';
      c.grid.desktopColumns = 3;
      c.pagination.type = 'load_more';
      return c;
    },
  },
  {
    id: 'sale_clearance',
    name: 'Flash Sale & Vault Clearance',
    description: 'High-contrast countdown header, infinite scroll, dense 5-column product grid with instant discounts.',
    getConfig: (tId) => {
      const c = getDefaultCollectionPageConfig(tId);
      c.name = 'Sale & Clearance Template';
      c.hero.title = 'Vault Archive Sale — Up to 50% Off';
      c.hero.description = 'Exclusive seasonal archival releases at limited-time privileged rates.';
      c.grid.desktopColumns = 4;
      c.pagination.type = 'infinite_scroll';
      return c;
    },
  },
];
