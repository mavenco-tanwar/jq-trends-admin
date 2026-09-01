export interface HeaderBlockStyles {
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  letterSpacing?: string;
  lineHeight?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  gap?: string;
  border?: string;
  borderColor?: string;
  borderRadius?: string;
  shadow?: string;
  opacity?: number;
}

export interface HeaderBlock {
  id: string;
  type:
    | 'logo'
    | 'brand'
    | 'tagline'
    | 'navigation'
    | 'search'
    | 'account'
    | 'wishlist'
    | 'cart'
    | 'currency'
    | 'language'
    | 'country'
    | 'whatsapp'
    | 'phone'
    | 'announcement'
    | 'cta'
    | 'icon'
    | 'text'
    | 'divider'
    | 'spacer';
  zone:
    | 'announcement.left'
    | 'announcement.center'
    | 'announcement.right'
    | 'main.left'
    | 'main.center'
    | 'main.right';
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
  styles?: HeaderBlockStyles;
  responsive?: {
    desktop?: { visible: boolean; order?: number; size?: string };
    tablet?: { visible: boolean; order?: number; size?: string };
    mobile?: { visible: boolean; order?: number; size?: string };
  };
  visibility?: {
    startDate?: string;
    endDate?: string;
    scheduleEnabled?: boolean;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
  enabled: boolean;
  target?: '_self' | '_blank';
  badge?: {
    text: string;
    type?: 'fresh' | 'hot' | 'new' | 'sale' | 'limited' | 'custom';
    bg?: string;
    color?: string;
  };
  children?: NavigationItem[];
  megaMenu?: {
    enabled: boolean;
    columns: Array<{
      id: string;
      title: string;
      links: Array<{ label: string; url: string; badge?: string }>;
      promoBanner?: {
        image: string;
        heading: string;
        description?: string;
        ctaText: string;
        ctaUrl: string;
      };
    }>;
  };
}

export interface HeaderConfig {
  id: string;
  tenantSlug: string;
  preset: 'luxury' | 'classic' | 'centered' | 'editorial' | 'minimal';
  theme: 'luxury-light' | 'luxury-dark' | 'minimal' | 'editorial' | 'modern' | 'classic';
  announcementBar: {
    enabled: boolean;
    height: number;
    rotationEnabled: boolean;
    rotationInterval: number;
    pauseOnHover: boolean;
    styles: {
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      borderColor: string;
      fontSize: string;
      fontFamily: string;
      letterSpacing: string;
    };
    blocks: HeaderBlock[];
  };
  mainHeader: {
    enabled: boolean;
    height: number;
    containerWidth: 'full' | 'contained' | 'custom';
    maxWidth?: number;
    styles: {
      backgroundColor: string;
      textColor: string;
      hoverColor: string;
      accentColor: string;
      borderColor: string;
      borderBottomWidth: string;
      shadow: string;
      fontFamily: string;
    };
    blocks: HeaderBlock[];
  };
  sticky: {
    enabled: boolean;
    behavior: 'always' | 'on-scroll-up' | 'after-threshold';
    thresholdPx: number;
    shrinkOnScroll: boolean;
    scrolledHeight: number;
    stickyBg?: string;
    stickyTextColor?: string;
  };
  transparent: {
    enabledOnHomepage: boolean;
    enabledOnSelectedPages: string[];
    transparentLogo?: string;
    transparentTextColor?: string;
  };
  mobile: {
    enabled: boolean;
    height: number;
    drawer: {
      background: string;
      textColor: string;
      accentColor: string;
      showSocialIcons: boolean;
      showCurrency: boolean;
    };
    blocks: HeaderBlock[];
  };
  navigationMenu: NavigationItem[];
  version: number;
  status: 'draft' | 'published';
  updatedAt: string;
}

export function getDefaultHeaderConfig(tenantSlug: string = 'lumina'): HeaderConfig {
  const isLumina = tenantSlug === 'lumina';
  const isApex = tenantSlug === 'apexathletics';
  const isAura = tenantSlug === 'auraliving';

  return {
    id: `header_${tenantSlug}`,
    tenantSlug,
    preset: 'luxury',
    theme: isApex ? 'luxury-dark' : isAura ? 'minimal' : 'luxury-light',
    announcementBar: {
      enabled: true,
      height: 38,
      rotationEnabled: false,
      rotationInterval: 5,
      pauseOnHover: true,
      styles: {
        backgroundColor: isApex ? '#0A0A0A' : isAura ? '#1B4332' : '#1E1B4B',
        textColor: '#FFFFFF',
        accentColor: isApex ? '#EF4444' : isAura ? '#74C69D' : '#F59E0B',
        borderColor: 'rgba(255,255,255,0.1)',
        fontSize: '11px',
        fontFamily: isAura ? 'Inter, sans-serif' : 'Plus Jakarta Sans, sans-serif',
        letterSpacing: '0.05em',
      },
      blocks: [
        {
          id: 'ann_left_1',
          type: 'icon',
          zone: 'announcement.left',
          enabled: true,
          order: 1,
          settings: {
            text: isLumina ? 'Artisanal Lighting & Objects' : isAura ? 'Minimalist Scandinavian Sanctuary' : isApex ? 'Championship Athletic Engineering' : 'Curated Luxury Fashion',
            icon: 'Sparkles',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
        {
          id: 'ann_left_2',
          type: 'whatsapp',
          zone: 'announcement.left',
          enabled: true,
          order: 2,
          settings: {
            label: 'WhatsApp Concierge',
            phone: '18004125864',
            url: 'https://wa.me/18004125864',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
        {
          id: 'ann_center_1',
          type: 'announcement',
          zone: 'announcement.center',
          enabled: true,
          order: 1,
          settings: {
            text: isLumina
              ? 'Spring Architectural Capsule Live Now • Complimentary Installation Guide •'
              : isAura
              ? 'Serene Living Drop 2026 • Complimentary Doorstep White-Glove Setup •'
              : isApex
              ? 'Apex Pro Championship Gear • Flat 20% OFF with code APEXPRO20 •'
              : 'Spring / Summer 2026 Capsule Live • Express Delivery Available •',
            ctaText: isLumina ? 'EXPLORE LUMINA' : isAura ? 'EXPLORE AURA' : isApex ? 'CLAIM PASS' : 'EXPLORE NOW',
            ctaUrl: '/sale',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'ann_right_1',
          type: 'currency',
          zone: 'announcement.right',
          enabled: true,
          order: 1,
          settings: {
            showSymbol: true,
            showCode: true,
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: false } },
        },
        {
          id: 'ann_right_2',
          type: 'text',
          zone: 'announcement.right',
          enabled: true,
          order: 2,
          settings: {
            text: isLumina ? 'LUMINA ATELIER' : isAura ? 'AURA LIVING' : isApex ? 'APEX ATHLETICS' : 'DEMO STORE',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
      ],
    },
    mainHeader: {
      enabled: true,
      height: 80,
      containerWidth: 'contained',
      maxWidth: 1400,
      styles: {
        backgroundColor: isApex ? '#0F172A' : '#FFFDFC',
        textColor: isApex ? '#F8FAFC' : '#111111',
        hoverColor: isApex ? '#EF4444' : isAura ? '#1B4332' : '#F59E0B',
        accentColor: isApex ? '#EF4444' : isAura ? '#74C69D' : '#F59E0B',
        borderColor: isApex ? 'rgba(255,255,255,0.1)' : '#E8DED8',
        borderBottomWidth: '1px',
        shadow: 'none',
        fontFamily: isLumina ? 'Playfair Display, serif' : 'Plus Jakarta Sans, sans-serif',
      },
      blocks: [
        {
          id: 'main_logo_1',
          type: 'logo',
          zone: 'main.left',
          enabled: true,
          order: 1,
          settings: {
            logoText: isLumina ? 'LUMINA ATELIER' : isAura ? 'AURA LIVING' : isApex ? 'APEX ATHLETICS' : 'DEMO STORE',
            badgeText: isLumina ? 'CONTEMPORARY ARTISANAL LIGHTING & OBJECTS' : isAura ? 'MINIMALIST SCANDINAVIAN DECOR' : isApex ? 'HIGH-PERFORMANCE ACTIVEWEAR' : 'HAUTE COUTURE & LIFESTYLE',
            logoUrl: '',
            width: '180px',
            height: 'auto',
            link: `/stores/${tenantSlug}`,
            altText: `${tenantSlug} logo`,
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_nav_1',
          type: 'navigation',
          zone: 'main.center',
          enabled: true,
          order: 1,
          settings: {
            menuId: 'main-menu',
            fontFamily: isLumina ? 'Playfair Display, serif' : 'Plus Jakarta Sans, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: '600',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
        {
          id: 'main_search_1',
          type: 'search',
          zone: 'main.right',
          enabled: true,
          order: 1,
          settings: {
            mode: 'icon-label',
            label: 'SEARCH',
            placeholder: 'Search our catalogue...',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_wishlist_1',
          type: 'wishlist',
          zone: 'main.right',
          enabled: true,
          order: 2,
          settings: {
            showLabel: false,
            label: 'WISHLIST',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_cart_1',
          type: 'cart',
          zone: 'main.right',
          enabled: true,
          order: 3,
          settings: {
            showLabel: false,
            label: 'BAG',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: true }, mobile: { visible: true } },
        },
        {
          id: 'main_account_1',
          type: 'account',
          zone: 'main.right',
          enabled: true,
          order: 4,
          settings: {
            showLabel: true,
            label: 'SIGN IN',
            loggedInLabel: 'ACCOUNT',
          },
          responsive: { desktop: { visible: true }, tablet: { visible: false }, mobile: { visible: false } },
        },
      ],
    },
    sticky: {
      enabled: true,
      behavior: 'always',
      thresholdPx: 40,
      shrinkOnScroll: true,
      scrolledHeight: 68,
      stickyBg: isApex ? 'rgba(15,23,42,0.95)' : 'rgba(255,253,252,0.95)',
      stickyTextColor: isApex ? '#F8FAFC' : '#111111',
    },
    transparent: {
      enabledOnHomepage: false,
      enabledOnSelectedPages: [],
    },
    mobile: {
      enabled: true,
      height: 64,
      drawer: {
        background: isApex ? '#0A0C10' : '#FFFDFC',
        textColor: isApex ? '#F8FAFC' : '#111111',
        accentColor: isApex ? '#EF4444' : isAura ? '#74C69D' : '#F59E0B',
        showSocialIcons: true,
        showCurrency: true,
      },
      blocks: [],
    },
    navigationMenu: [
      {
        id: 'nav_new',
        label: 'NEW IN',
        url: '/new-arrivals',
        order: 1,
        enabled: true,
        badge: { text: 'FRESH', type: 'fresh', bg: isApex ? '#EF4444' : '#F59E0B', color: '#FFFFFF' },
      },
      {
        id: 'nav_apparel',
        label: 'APPAREL',
        url: '/women',
        order: 2,
        enabled: true,
        megaMenu: {
          enabled: true,
          columns: [
            {
              id: 'col_1',
              title: 'Curated Categories',
              links: [
                { label: 'Architectural Silhouettes', url: '/women' },
                { label: 'Artisanal Linens & Silks', url: '/women' },
                { label: 'Tailored Sculptural Tops', url: '/women' },
                { label: 'Monochrome Outerwear', url: '/women' },
                { label: 'Evening Editions', url: '/women', badge: 'HOT' },
              ],
            },
            {
              id: 'col_2',
              title: 'Signature Disciplines',
              links: [
                { label: 'Pendant & Chandelier Illumination', url: '/kids' },
                { label: 'Brushed Brass Table Lamps', url: '/kids' },
                { label: 'Tactile Ceramic Vessels', url: '/kids' },
                { label: 'Stone & Alabaster Accents', url: '/kids' },
                { label: 'Studio Exclusives', url: '/kids', badge: 'NEW' },
              ],
            },
            {
              id: 'col_promo',
              title: 'Spotlight Capsule',
              links: [],
              promoBanner: {
                image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
                heading: 'Spring Master Capsule',
                description: 'Crafted with frosted opaline glass and brushed gold brass.',
                ctaText: 'Explore Lookbook',
                ctaUrl: '/women',
              },
            },
          ],
        },
      },
      {
        id: 'nav_lifestyle',
        label: 'LIFESTYLE',
        url: '/kids',
        order: 3,
        enabled: true,
      },
      {
        id: 'nav_collections',
        label: 'COLLECTIONS',
        url: '/collections/festive',
        order: 4,
        enabled: true,
      },
      {
        id: 'nav_sale',
        label: 'SALE',
        url: '/sale',
        order: 5,
        enabled: true,
        badge: { text: '20% OFF', type: 'sale', bg: '#E11D48', color: '#FFFFFF' },
      },
    ],
    version: 1,
    status: 'published',
    updatedAt: new Date().toISOString(),
  };
}
