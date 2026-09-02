'use client';

import React from 'react';
import { BlockRegistry, BlockDefinition } from './BlockRegistry';
import {
  Type,
  AlignLeft,
  Menu as MenuIcon,
  Columns,
  Mail,
  Share2,
  Phone,
  CreditCard,
  Copyright as CopyrightIcon,
  Image as ImageIcon,
  MousePointerClick,
  Minus,
  Maximize2,
  Code,
  MapPin,
  MessageCircle,
} from 'lucide-react';

export const footerBlockDefinitions: BlockDefinition[] = [
  // 1. Brand Logo Block
  {
    type: 'logo',
    name: 'Brand Logo',
    category: 'content',
    description: 'Displays your store or atelier brand logo or luxury typography mark',
    icon: ImageIcon,
    defaultContent: {
      logoType: 'text', // 'text' | 'image'
      text: '', // dynamically filled from tenant
      imageUrl: '',
      linkUrl: '/',
      altText: 'Storefront Logo',
      width: 180,
      height: 48,
    },
    defaultStyles: {
      fontSize: '18px',
      fontFamily: 'Playfair Display, serif',
      fontWeight: '800',
      letterSpacing: '0.12em',
      textColor: '#FFFFFF',
      textAlign: 'left',
    },
    render: ({ block, tenantSlug }) => {
      const { text, imageUrl, logoType, width } = block.content;
      const displayText = text || (tenantSlug ? tenantSlug.toUpperCase() : 'STOREFRONT');

      if (logoType === 'image' && imageUrl) {
        return (
          <div className="min-w-0 max-w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={block.content.altText || 'Logo'}
              style={{ maxWidth: width ? `${width}px` : '160px', height: 'auto' }}
              className="inline-block max-w-full"
            />
          </div>
        );
      }
      return (
        <div
          style={{
            fontSize: block.styles?.fontSize || '18px',
            fontFamily: block.styles?.fontFamily || 'inherit',
            fontWeight: block.styles?.fontWeight || '800',
            letterSpacing: block.styles?.letterSpacing || '0.12em',
            color: block.styles?.textColor || 'inherit',
            textAlign: block.styles?.textAlign || 'left',
          }}
          className="uppercase tracking-widest font-serif font-black break-words leading-tight min-w-0 max-w-full"
        >
          {displayText}
        </div>
      );
    },
  },

  // 2. Plain Text Block
  {
    type: 'text',
    name: 'Text & Description',
    category: 'content',
    description: 'Atelier story, bio, or description paragraphs',
    icon: Type,
    defaultContent: {
      text: 'Bespoke essentials and curated collections, engineered for elegance and worldwide fast dispatch.',
    },
    defaultStyles: {
      fontSize: '13px',
      textColor: '#94A3B8',
      lineHeight: '1.6',
      textAlign: 'left',
    },
    render: ({ block }) => (
      <p
        style={{
          fontSize: block.styles?.fontSize || '13px',
          color: block.styles?.textColor || '#94A3B8',
          lineHeight: block.styles?.lineHeight || '1.6',
          textAlign: block.styles?.textAlign || 'left',
        }}
        className="font-sans break-words"
      >
        {block.content.text || ''}
      </p>
    ),
  },

  // 3. Navigation Menu Block
  {
    type: 'menu',
    name: 'Navigation Menu',
    category: 'navigation',
    description: 'Displays a curated link menu from Navigation Manager',
    icon: MenuIcon,
    defaultContent: {
      heading: 'SHOP',
      menuCode: 'footer-menu-shop',
      items: [
        { label: 'New Arrivals', href: '/new-arrivals' },
        { label: 'Women', href: '/women' },
        { label: 'Men', href: '/men' },
        { label: 'Collections', href: '/collections' },
        { label: 'Sale', href: '/sale' },
      ],
    },
    defaultStyles: {
      headingColor: '#FFFFFF',
      linkColor: '#94A3B8',
      linkHoverColor: '#E11D48',
      fontSize: '13px',
      spacingY: '8px',
    },
    render: ({ block, device }) => {
      const [isOpen, setIsOpen] = React.useState(true);
      const isMobile = device === 'mobile';
      const items = block.content.items || [];

      return (
        <div className="space-y-3 min-w-0 max-w-full">
          {block.content.heading && (
            <div
              onClick={() => isMobile && setIsOpen(!isOpen)}
              className={`flex items-center justify-between cursor-pointer ${
                isMobile ? 'py-1 border-b border-white/5' : ''
              }`}
            >
              <h4
                style={{ color: block.styles?.headingColor || '#FFFFFF' }}
                className="text-xs font-bold uppercase tracking-wider truncate"
              >
                {block.content.heading}
              </h4>
              {isMobile && (
                <span className="text-xs text-slate-400">{isOpen ? '−' : '+'}</span>
              )}
            </div>
          )}
          {(!isMobile || isOpen) && (
            <ul className="space-y-2 text-xs">
              {items.map((it: any, i: number) => (
                <li key={i} className="truncate">
                  <a
                    href={it.href || '#'}
                    style={{ color: block.styles?.linkColor || '#94A3B8' }}
                    className="hover:text-white transition-colors duration-200 block py-0.5 truncate"
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    },
  },

  // 4. Newsletter Subscription Block
  {
    type: 'newsletter',
    name: 'Newsletter Subscription',
    category: 'commerce',
    description: 'Email newsletter box with instant subscription feedback',
    icon: Mail,
    defaultContent: {
      heading: 'NEWSLETTER',
      description: 'Subscribe for private drops, seasonal previews, and exclusive offers.',
      placeholder: 'Enter your email...',
      buttonText: 'SUBSCRIBE',
      privacyText: 'Instant unsubscription available at any time.',
      successMessage: 'Welcome to our private circle.',
    },
    defaultStyles: {
      buttonBgColor: '#E11D48',
      buttonTextColor: '#FFFFFF',
      inputBgColor: 'rgba(255,255,255,0.05)',
      inputBorderColor: 'rgba(255,255,255,0.15)',
    },
    render: ({ block }) => {
      const [email, setEmail] = React.useState('');
      const [done, setDone] = React.useState(false);

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setDone(true);
      };

      return (
        <div className="space-y-3 min-w-0 max-w-full">
          {block.content.heading && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">
              {block.content.heading}
            </h4>
          )}
          {block.content.description && (
            <p className="text-xs text-slate-400 break-words">{block.content.description}</p>
          )}
          {done ? (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              ✦ {block.content.successMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={block.content.placeholder || 'Enter your email...'}
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: block.styles?.buttonBgColor || '#E11D48',
                    color: block.styles?.buttonTextColor || '#FFFFFF',
                  }}
                  className="w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
                >
                  {block.content.buttonText || 'Subscribe'}
                </button>
              </div>
              {block.content.privacyText && (
                <p className="text-[10px] text-slate-500 break-words">{block.content.privacyText}</p>
              )}
            </form>
          )}
        </div>
      );
    },
  },

  // 5. Social Icons Block
  {
    type: 'social_icons',
    name: 'Social Channels',
    category: 'social',
    description: 'Interactive social media profile icons (Instagram, WhatsApp, X, Facebook, etc.)',
    icon: Share2,
    defaultContent: {
      heading: 'CONNECT WITH US',
      platforms: [
        { name: 'Instagram', url: 'https://instagram.com', enabled: true },
        { name: 'Facebook', url: 'https://facebook.com', enabled: true },
        { name: 'WhatsApp', url: 'https://whatsapp.com', enabled: true },
        { name: 'Pinterest', url: 'https://pinterest.com', enabled: true },
      ],
      iconSize: '20px',
    },
    defaultStyles: {
      iconColor: '#94A3B8',
      iconHoverColor: '#FFFFFF',
      iconBgColor: 'rgba(255,255,255,0.06)',
    },
    render: ({ block }) => {
      const activePlatforms = (block.content.platforms || []).filter((p: any) => p.enabled && p.url);

      return (
        <div className="space-y-3 min-w-0 max-w-full">
          {block.content.heading && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">
              {block.content.heading}
            </h4>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {activePlatforms.map((p: any, i: number) => (
              <a
                key={i}
                href={p.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-rose-500 hover:bg-rose-500/10 transition-all text-xs font-bold"
                title={p.name}
              >
                {p.name.charAt(0)}
              </a>
            ))}
          </div>
        </div>
      );
    },
  },

  // 6. Contact Information Block
  {
    type: 'contact',
    name: 'Client Concierge & Support',
    category: 'contact',
    description: 'Displays phone, email, WhatsApp, and physical boutique address',
    icon: Phone,
    defaultContent: {
      heading: 'CLIENT CONCIERGE',
      phone: '+1 (800) 456-7890',
      email: 'concierge@example.com',
      address: 'Flagship Boutique, Atelier Suite 400',
      whatsapp: '+1 (800) 456-7890',
    },
    defaultStyles: {
      textColor: '#94A3B8',
      iconColor: '#E11D48',
    },
    render: ({ block }) => {
      const { phone, email, address, whatsapp, heading } = block.content;
      return (
        <div className="space-y-3 min-w-0 max-w-full">
          {heading && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-white truncate">
              {heading}
            </h4>
          )}
          <ul className="space-y-2 text-xs text-slate-400">
            {phone && (
              <li className="flex items-center gap-2.5 truncate">
                <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{phone}</span>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2.5 truncate">
                <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors truncate">
                  {email}
                </a>
              </li>
            )}
            {whatsapp && (
              <li className="flex items-center gap-2.5 truncate">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">WhatsApp: {whatsapp}</span>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2.5 break-words">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="break-words">{address}</span>
              </li>
            )}
          </ul>
        </div>
      );
    },
  },

  // 7. Payment Icons Block
  {
    type: 'payment_icons',
    name: 'Payment Methods & Security Badges',
    category: 'commerce',
    description: 'Renders verified checkout and credit card method badges',
    icon: CreditCard,
    defaultContent: {
      methods: [
        { name: 'Visa', enabled: true },
        { name: 'Mastercard', enabled: true },
        { name: 'Amex', enabled: true },
        { name: 'Apple Pay', enabled: true },
        { name: 'Google Pay', enabled: true },
        { name: 'UPI', enabled: true },
      ],
      alignment: 'left',
    },
    render: ({ block }) => {
      const active = (block.content.methods || []).filter((m: any) => m.enabled !== false);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {active.map((m: any, i: number) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-[10px] font-bold text-slate-300 uppercase tracking-wider"
            >
              {m.name}
            </span>
          ))}
        </div>
      );
    },
  },

  // 8. Copyright Block
  {
    type: 'copyright',
    name: 'Copyright & Legal Notice',
    category: 'content',
    description: 'Dynamic year and store name copyright statement',
    icon: CopyrightIcon,
    defaultContent: {
      template: '© {{year}} {{store.name}}. All rights reserved.',
      storeName: '',
    },
    defaultStyles: {
      textColor: '#64748B',
      fontSize: '11px',
      textAlign: 'center',
    },
    render: ({ block, tenantSlug }) => {
      const year = new Date().getFullYear();
      const sName = block.content.storeName || (tenantSlug ? tenantSlug.toUpperCase() : 'STOREFRONT');
      const text = (block.content.template || '© {{year}} {{store.name}}. All rights reserved.')
        .replace('{{year}}', String(year))
        .replace('{{store.name}}', sName);

      return (
        <div
          style={{
            color: block.styles?.textColor || '#64748B',
            fontSize: block.styles?.fontSize || '11px',
            textAlign: block.styles?.textAlign || 'center',
          }}
          className="font-sans break-words"
        >
          {text}
        </div>
      );
    },
  },

  // 9. Divider Block
  {
    type: 'divider',
    name: 'Divider Line',
    category: 'layout',
    description: 'Horizontal divider between footer rows or sections',
    icon: Minus,
    defaultContent: {},
    defaultStyles: {
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: '1px',
      borderStyle: 'solid',
      marginY: '20px',
    },
    render: ({ block }) => (
      <hr
        style={{
          borderColor: block.styles?.borderColor || 'rgba(255,255,255,0.08)',
          borderTopWidth: block.styles?.borderWidth || '1px',
          borderStyle: block.styles?.borderStyle || 'solid',
          margin: `${block.styles?.marginY || '20px'} 0`,
        }}
      />
    ),
  },

  // 10. Spacer Block
  {
    type: 'spacer',
    name: 'Spacer',
    category: 'layout',
    description: 'Adjustable vertical whitespace spacer',
    icon: Maximize2,
    defaultContent: {
      height: '24px',
    },
    render: ({ block }) => (
      <div style={{ height: block.content.height || '24px' }} className="w-full" />
    ),
  },

  // 11. Custom HTML Block
  {
    type: 'custom_html',
    name: 'Custom HTML / Embed',
    category: 'layout',
    description: 'Raw embed code or trust seals (e.g. Norton, McAfee, SSL seals)',
    icon: Code,
    defaultContent: {
      html: '<div style="font-size: 11px; opacity: 0.7;">🔒 256-Bit Bank-Grade SSL Encryption Verified</div>',
    },
    render: ({ block }) => (
      <div
        className="break-words max-w-full overflow-hidden"
        dangerouslySetInnerHTML={{
          __html: block.content.html || '',
        }}
      />
    ),
  },
];

// Automatically register all standard footer blocks into the global BlockRegistry
footerBlockDefinitions.forEach((b) => BlockRegistry.register(b));
