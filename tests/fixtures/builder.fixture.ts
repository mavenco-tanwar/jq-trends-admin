import type { BuilderDocument, BuilderSection, BuilderBlock } from '@/components/builder/types/builder.types';

export const mockBuilderBlockFixture: BuilderBlock = {
  id: 'blk_test_01',
  type: 'rich_text',
  category: 'content',
  name: 'Editorial Lead',
  enabled: true,
  order: 1,
  columnSpan: 12,
  content: {
    heading: 'The Sovereign Collection',
    body: 'Handcrafted luxury apparel curated for modern discerning connoisseurs.',
    alignment: 'center',
  },
  styles: {
    padding: '32px 16px',
    margin: '0px 0px 16px 0px',
    color: '#1e293b',
  },
  responsive: {
    desktop: { visible: true },
    tablet: { visible: true },
    mobile: { visible: true },
  },
};

export const mockBuilderSectionFixture: BuilderSection = {
  id: 'sec_test_01',
  name: 'Hero Showcase',
  enabled: true,
  order: 1,
  layout: {
    containerWidth: 'contained',
    maxWidth: 1280,
    columns: { desktop: 12, tablet: 6, mobile: 1 },
    gap: '24px',
  },
  styles: {
    backgroundColor: '#f8fafc',
  },
  blocks: [mockBuilderBlockFixture],
};

export const mockBuilderDocumentFixture: BuilderDocument = {
  id: 'doc_home_page',
  name: 'Homepage V2',
  tenantId: 'store_jqtrends',
  tenantSlug: 'jqtrends',
  type: 'homepage',
  status: 'draft',
  version: 1,
  sections: [mockBuilderSectionFixture],
  theme: {
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#ec4899',
    backgroundColor: '#07090E',
    surfaceColor: '#0F131D',
    textColor: '#F8FAFC',
    headingColor: '#FFFFFF',
    mutedTextColor: '#94A3B8',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    fontFamily: 'Inter, sans-serif',
    headingFontFamily: 'Playfair Display, serif',
    fontSize: '13px',
    letterSpacing: '0.02em',
  },
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
};
