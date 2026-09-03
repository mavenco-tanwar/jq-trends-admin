import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InventoryService } from '@/services/inventory';
import { ProductService } from '@/services/products';
import { mockProductsFixture } from '../../fixtures/products.fixture';

vi.mock('@/services/products');

describe('InventoryService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Inventory Generation & Stock Levels', () => {
    it('should generate inventory items from products and variants', async () => {
      vi.mocked(ProductService.getAll).mockResolvedValueOnce(mockProductsFixture);

      const items = await InventoryService.getAll();
      expect(items.length).toBeGreaterThan(0);

      const silkVariant = items.find((i) => i.sku === 'JQT-GLAM-001-S-EMR');
      expect(silkVariant).toBeDefined();
      expect(silkVariant?.availableStock).toBe(8);
      expect(silkVariant?.status).toBe('low_stock'); // stock <= 10
      expect(silkVariant?.totalOnHand).toBe(10); // available (8) + reserved (2)
    });

    it('should correctly flag out-of-stock items', async () => {
      vi.mocked(ProductService.getAll).mockResolvedValueOnce(mockProductsFixture);

      const items = await InventoryService.getAll();
      const outOfStockItem = items.find((i) => i.sku === 'JQT-TAILOR-002-40R');
      expect(outOfStockItem).toBeDefined();
      expect(outOfStockItem?.availableStock).toBe(0);
      expect(outOfStockItem?.status).toBe('out_of_stock');
    });

    it('should adjust stock by delta increment or decrement', async () => {
      vi.mocked(ProductService.getAll).mockResolvedValueOnce(mockProductsFixture);
      const items = await InventoryService.getAll();
      const firstItem = items[0];
      const initialStock = firstItem.availableStock;

      const updated = await InventoryService.adjustStock(firstItem.variantId, 5, 'Restock delivery');
      expect(updated).not.toBeNull();
      expect(updated.availableStock).toBe(initialStock + 5);
    });
  });
});
