import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentService } from '@/services/content';
import { ApiClient } from '@/services/api';

vi.mock('@/services/api');

describe('ContentService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Homepage CMS & Section Drafts', () => {
    it('should retrieve homepage config with sections', async () => {
      const config = await ContentService.getHomepage();
      expect(config).toBeDefined();
      expect(Array.isArray(config.sections)).toBe(true);
    });

    it('should save homepage draft sections', async () => {
      const draftSections = [
        {
          id: 'hero_01',
          type: 'hero',
          name: 'Hero Section',
          data: { headline: 'New Season Unveiled' },
        } as any,
      ];

      const saved = await ContentService.saveDraft(draftSections);
      expect(saved.sections.length).toBe(1);
      expect(saved.sections[0].id).toBe('hero_01');
    });

    it('should publish homepage sections and record history', async () => {
      const publishSections = [
        {
          id: 'hero_published',
          type: 'hero',
          name: 'Published Hero',
          data: { headline: 'Spring Summer Gala' },
        } as any,
      ];

      const published = await ContentService.publishHomepage(publishSections);
      expect(published).toBeDefined();
      expect(published.publishedAt).toBeDefined();

      const history = await ContentService.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('CMS Pages CRUD', () => {
    it('should retrieve CMS pages list', async () => {
      const pages = await ContentService.getPages();
      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);
    });

    it('should create a new custom page', async () => {
      const newPage = await ContentService.createPage({
        title: 'VIP Concierge Service',
        slug: 'vip-concierge',
        status: 'published',
        blocks: [],
        seo: { title: 'VIP Concierge' },
      });

      expect(newPage.id).toBeDefined();
      expect(newPage.title).toBe('VIP Concierge Service');
      expect(newPage.slug).toBe('vip-concierge');
    });

    it('should update an existing page', async () => {
      const pages = await ContentService.getPages();
      const firstPage = pages[0];

      const updated = await ContentService.updatePage(firstPage.id, {
        title: `${firstPage.title} (Updated)`,
      });

      expect(updated.title).toContain('(Updated)');
    });

    it('should delete a page by ID', async () => {
      const newPage = await ContentService.createPage({
        title: 'Temporary Pop-up',
        slug: 'temporary-pop-up',
      });

      await ContentService.deletePage(newPage.id);
      const pages = await ContentService.getPages();
      expect(pages.find((p) => p.id === newPage.id)).toBeUndefined();
    });
  });
});
