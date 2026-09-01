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
  return {
    id: `header_${tenantSlug}`,
    tenantSlug,
    preset: 'luxury',
    theme: 'luxury-light',
    announcementBar: {
      enabled: true,
      height: 38,
      rotationEnabled: false,
      rotationInterval: 5,
      pauseOnHover: true,
      styles: {
        backgroundColor: '#1E1B4B',
        textColor: '#FFFFFF',
        accentColor: '#F59E0B',
        borderColor: 'rgba(255,255,255,0.1)',
        fontSize: '11px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        letterSpacing: '0.05em',
      },
      blocks: [],
    },
    mainHeader: {
      enabled: true,
      height: 80,
      containerWidth: 'contained',
      maxWidth: 1400,
      styles: {
        backgroundColor: '#FFFDFC',
        textColor: '#111111',
        hoverColor: '#F59E0B',
        accentColor: '#F59E0B',
        borderColor: '#E8DED8',
        borderBottomWidth: '1px',
        shadow: 'none',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
      blocks: [
        {
          id: 'main_logo_1',
          type: 'logo',
          zone: 'main.left',
          enabled: true,
          order: 1,
          settings: {
            logoText: tenantSlug ? tenantSlug.toUpperCase() : 'STORE',
            link: `/stores/${tenantSlug}`,
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
      stickyBg: 'rgba(255,253,252,0.95)',
      stickyTextColor: '#111111',
    },
    transparent: {
      enabledOnHomepage: false,
      enabledOnSelectedPages: [],
    },
    mobile: {
      enabled: true,
      height: 64,
      drawer: {
        background: '#FFFDFC',
        textColor: '#111111',
        accentColor: '#F59E0B',
        showSocialIcons: true,
        showCurrency: true,
      },
      blocks: [],
    },
    navigationMenu: [],
    version: 1,
    status: 'published',
    updatedAt: new Date().toISOString(),
  };
}
