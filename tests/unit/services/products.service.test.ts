import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '@/services/products';
import { ApiClient } from '@/services/api';
import { mockProductsFixture } from '../../fixtures/products.fixture';

vi.mock('@/services/api');

describe('ProductService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product Retrieval', () => {
    it('should return normalized products from ApiClient if available', async () => {
      vi.mocked(ApiClient.get).mockResolvedValueOnce({
        data: [
          {
            id: 'prod_api_01',
            name: 'Artisanal Silk Scarf',
            price: '2499',
            stock: 45,
            images: ['https://example.com/scarf.jpg'],
            category: { name: 'Accessories' },
          },
        ],
      });

      const products = await ProductService.getAll();
      expect(products.length).toBeGreaterThan(0);
      const scarf = products[0];
      expect(scarf.title).toBe('Artisanal Silk Scarf');
      expect(scarf.price).toBe(2499);
      expect(scarf.images[0].url).toBe('https://example.com/scarf.jpg');
      expect(scarf.images[0].isPrimary).toBe(true);
      expect(scarf.categoryIds).toContain('accessories');
    });

    it('should fallback to local products if API call fails', async () => {
      vi.mocked(ApiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const products = await ProductService.getAll();
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].id).toBeDefined();
      expect(products[0].title).toBeDefined();
    });

    it('should retrieve a product by ID or slug with normalization', async () => {
      vi.mocked(ApiClient.get).mockResolvedValueOnce({
        data: mockProductsFixture[0],
      });

      const product = await ProductService.getById('prod_001');
      expect(product).not.toBeNull();
      expect(product?.id).toBe('prod_001');
      expect(product?.brand).toBe('JQ Trends Atelier');
      expect(product?.variants.length).toBe(3);
    });
  });

  describe('Product Mutations', () => {
    it('should create a new product and normalize missing attributes', async () => {
      const rawProduct = {
        title: 'Bespoke Linen Shirt',
        price: 3999,
        sku: 'JQT-SHIRT-09',
        stock: 30,
      };

      vi.mocked(ApiClient.post).mockResolvedValueOnce({
        data: {
          ...rawProduct,
          id: 'prod_new_123',
        },
      });

      const created = await ProductService.create(rawProduct);
      expect(created.id).toBeDefined();
      expect(created.title).toBe('Bespoke Linen Shirt');
      expect(created.status).toBe('published');
      expect(created.trackInventory).toBe(true);
      expect(created.stock).toBe(30);
    });

    it('should update an existing product', async () => {
      const created = await ProductService.create({
        title: 'Original Garment',
        price: 999,
      });

      vi.mocked(ApiClient.patch).mockResolvedValueOnce({
        data: {
          id: created.id,
          title: 'Artisanal Silk Evening Gown - Revised',
          price: 19999,
        },
      });

      const updated = await ProductService.update(created.id, {
        title: 'Artisanal Silk Evening Gown - Revised',
        price: 19999,
      });

      expect(updated).not.toBeNull();
      expect(updated.title).toBe('Artisanal Silk Evening Gown - Revised');
      expect(updated.price).toBe(19999);
    });

    it('should delete a product and support bulk operations', async () => {
      const p1 = await ProductService.create({ id: 'prod_bulk_01', title: 'Item to delete 1' });
      const p2 = await ProductService.create({ id: 'prod_bulk_02', title: 'Item to delete 2' });

      await ProductService.delete(p1.id);
      expect(await ProductService.getById(p1.id)).toBeNull();

      await ProductService.bulkUpdateStatus([p2.id], 'archived');
      const updatedP2 = await ProductService.getById(p2.id);
      expect(updatedP2?.status).toBe('archived');

      await ProductService.bulkDelete([p2.id]);
      expect(await ProductService.getById(p2.id)).toBeNull();
    });
  });
});
