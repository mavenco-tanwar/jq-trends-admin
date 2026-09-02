import { BuilderPreset, BuilderDocument } from '../types/builder.types';

export function getDefaultFooterDocument(tenantSlug: string = 'jqtrends', storeName: string = 'JQ TRENDS'): BuilderDocument {
  return {
    id: `doc_footer_${tenantSlug}`,
    tenantId: `tenant_${tenantSlug}`,
    tenantSlug,
    type: 'footer',
    name: 'Main Storefront Footer',
    status: 'published',
    version: 1,
    theme: {
      primaryColor: '#07090E',
      secondaryColor: '#1E293B',
      accentColor: '#E11D48',
      backgroundColor: '#07090E',
      surfaceColor: '#0F131D',
      textColor: '#F8FAFC',
      headingColor: '#FFFFFF',
      mutedTextColor: '#94A3B8',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      headingFontFamily: 'Playfair Display, serif',
      fontSize: '13px',
      letterSpacing: '0.02em',
    },
    sections: [
      // Section 1: Main Multi-Column Links & Newsletter
      {
        id: 'sec_footer_main',
        name: 'Navigation & Newsletter Row',
        enabled: true,
        order: 1,
        layout: {
          containerWidth: 'contained',
          columns: { desktop: 4, tablet: 2, mobile: 1 },
        },
        styles: {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderBottomWidth: '1px',
        },
        responsive: {
          desktop: { visible: true },
          tablet: { visible: true },
          mobile: { visible: true, accordion: true },
        },
        blocks: [
          // Column 1: Brand & Atelier Bio
          {
            id: 'blk_footer_logo',
            type: 'logo',
            name: 'Brand Logo',
            enabled: true,
            order: 1,
            columnSpan: 1,
            content: {
              logoType: 'text',
              text: storeName.toUpperCase(),
              linkUrl: '/',
              width: 180,
            },
            styles: {
              fontSize: '20px',
              fontWeight: '800',
              letterSpacing: '0.15em',
              textColor: '#FFFFFF',
            },
          },
          // Column 2: Shop Menu
          {
            id: 'blk_footer_menu_shop',
            type: 'menu',
            name: 'Shop Collections',
            enabled: true,
            order: 2,
            columnSpan: 1,
            content: {
              heading: 'SHOP',
              menuCode: 'footer-menu-shop',
              items: [
                { label: 'Women', href: '/women' },
                { label: 'Men', href: '/men' },
                { label: 'Kids', href: '/kids' },
                { label: 'New Arrivals', href: '/new-arrivals' },
                { label: 'Private Sale', href: '/sale' },
              ],
            },
          },
          // Column 3: Customer Care & Concierge
          {
            id: 'blk_footer_menu_care',
            type: 'menu',
            name: 'Customer Concierge',
            enabled: true,
            order: 3,
            columnSpan: 1,
            content: {
              heading: 'CUSTOMER CARE',
              menuCode: 'footer-menu-care',
              items: [
                { label: 'Contact & Concierge', href: '/contact' },
                { label: 'Worldwide Shipping', href: '/shipping' },
                { label: 'Returns & Exchanges', href: '/returns' },
                { label: 'Atelier FAQ', href: '/faq' },
                { label: 'Privacy & Terms', href: '/privacy' },
              ],
            },
          },
          // Column 4: Newsletter Subscription
          {
            id: 'blk_footer_newsletter',
            type: 'newsletter',
            name: 'VIP Newsletter',
            enabled: true,
            order: 4,
            columnSpan: 1,
            content: {
              heading: 'NEWSLETTER',
              description: 'Subscribe for private drops, seasonal previews, and exclusive offers.',
              placeholder: 'Enter your email address...',
              buttonText: 'SUBSCRIBE',
              privacyText: 'Instant unsubscription available at any time.',
              successMessage: 'Welcome to our private circle.',
            },
            styles: {
              buttonBgColor: '#E11D48',
              buttonTextColor: '#FFFFFF',
            },
          },
        ],
      },

      // Section 2: Social & Concierge Contact Row
      {
        id: 'sec_footer_social',
        name: 'Social & Payment Badges',
        enabled: true,
        order: 2,
        layout: {
          containerWidth: 'contained',
          columns: { desktop: 2, tablet: 2, mobile: 1 },
        },
        styles: {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderBottomWidth: '1px',
        },
        blocks: [
          {
            id: 'blk_footer_social',
            type: 'social_icons',
            name: 'Social Profiles',
            enabled: true,
            order: 1,
            columnSpan: 1,
            content: {
              heading: 'CONNECT WITH US',
              platforms: [
                { name: 'Instagram', url: 'https://instagram.com', enabled: true },
                { name: 'Facebook', url: 'https://facebook.com', enabled: true },
                { name: 'WhatsApp', url: 'https://whatsapp.com', enabled: true },
                { name: 'Pinterest', url: 'https://pinterest.com', enabled: true },
              ],
            },
          },
          {
            id: 'blk_footer_payments',
            type: 'payment_icons',
            name: 'Payment Methods',
            enabled: true,
            order: 2,
            columnSpan: 1,
            content: {
              methods: [
                { name: 'Visa', enabled: true },
                { name: 'Mastercard', enabled: true },
                { name: 'Amex', enabled: true },
                { name: 'Apple Pay', enabled: true },
                { name: 'Google Pay', enabled: true },
                { name: 'UPI', enabled: true },
              ],
            },
          },
        ],
      },

      // Section 3: Copyright Bottom Bar
      {
        id: 'sec_footer_bottom',
        name: 'Copyright & Legal Notice',
        enabled: true,
        order: 3,
        layout: {
          containerWidth: 'contained',
          columns: { desktop: 1, tablet: 1, mobile: 1 },
        },
        styles: {
          backgroundColor: 'transparent',
        },
        blocks: [
          {
            id: 'blk_footer_copyright',
            type: 'copyright',
            name: 'Copyright Line',
            enabled: true,
            order: 1,
            columnSpan: 1,
            content: {
              template: '© {{year}} {{store.name}}. All rights reserved. Powered by Mavenco Commerce.',
              storeName: storeName,
            },
            styles: {
              textColor: '#64748B',
              fontSize: '11px',
              textAlign: 'center',
            },
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}

export const FOOTER_PRESETS: BuilderPreset[] = [
  {
    id: 'classic_ecommerce',
    name: 'Classic Ecommerce',
    description: 'Logo, 4 dynamic menu columns, newsletter box, social channels, and payment badges.',
    badge: 'Popular',
    document: {
      theme: {
        primaryColor: '#07090E',
        secondaryColor: '#1E293B',
        accentColor: '#E11D48',
        backgroundColor: '#07090E',
        surfaceColor: '#0F131D',
        textColor: '#F8FAFC',
        headingColor: '#FFFFFF',
        mutedTextColor: '#94A3B8',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        headingFontFamily: 'Playfair Display, serif',
        fontSize: '13px',
        letterSpacing: '0.02em',
      },
    },
  },
  {
    id: 'minimal_clean',
    name: 'Minimalist Clean',
    description: 'Minimal branding with inline navigation links, social channel icons, and subtle copyright.',
    badge: 'Minimal',
    document: {
      theme: {
        primaryColor: '#000000',
        secondaryColor: '#111111',
        accentColor: '#FFFFFF',
        backgroundColor: '#000000',
        surfaceColor: '#0A0A0A',
        textColor: '#D4D4D4',
        headingColor: '#FFFFFF',
        mutedTextColor: '#737373',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        fontFamily: 'Inter, sans-serif',
        headingFontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        letterSpacing: '0.05em',
      },
    },
  },
  {
    id: 'luxury_flagship',
    name: 'Luxury Flagship',
    description: 'Prominent haute couture typography, atelier narrative, concierge contact cards, and VIP newsletter.',
    badge: 'Luxury',
    document: {
      theme: {
        primaryColor: '#0B090A',
        secondaryColor: '#161A1D',
        accentColor: '#D4AF37', // Luxury Gold
        backgroundColor: '#0B090A',
        surfaceColor: '#161A1D',
        textColor: '#E5E5E5',
        headingColor: '#FFFFFF',
        mutedTextColor: '#A3A3A3',
        borderColor: 'rgba(212, 175, 55, 0.2)',
        fontFamily: 'Outfit, sans-serif',
        headingFontFamily: 'Playfair Display, serif',
        fontSize: '13px',
        letterSpacing: '0.06em',
      },
    },
  },
  {
    id: 'fashion_editorial',
    name: 'Fashion Editorial',
    description: 'Magazine aesthetic, high-contrast headings, category columns, and live concierge support links.',
    badge: 'Editorial',
    document: {
      theme: {
        primaryColor: '#0F172A',
        secondaryColor: '#1E293B',
        accentColor: '#38BDF8',
        backgroundColor: '#0F172A',
        surfaceColor: '#1E293B',
        textColor: '#F1F5F9',
        headingColor: '#FFFFFF',
        mutedTextColor: '#94A3B8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        headingFontFamily: 'Cinzel, serif',
        fontSize: '13px',
        letterSpacing: '0.04em',
      },
    },
  },
];
