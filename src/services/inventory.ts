import { ApiClient } from './api';
import { ProductService } from './products';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import type { InventoryItem } from '@/types';

export class InventoryService {
  private static localInventory: InventoryItem[] = [];

  static async getAll(): Promise<InventoryItem[]> {
    try {
      const products = await ProductService.getAll();
      if (products && products.length > 0) {
        const generated: InventoryItem[] = [];
        for (const prod of products) {
          if (prod.variants && prod.variants.length > 0) {
            for (const v of prod.variants) {
              generated.push({
                id: `inv_${v.id || Math.random().toString(36).substring(2, 7)}`,
                productId: prod.id,
                productTitle: prod.title,
                variantId: v.id,
                variantTitle: v.title || `${v.options?.Color || ''} ${v.options?.Size || ''}`.trim() || 'Standard',
                sku: v.sku || prod.sku || 'JQT-SKU',
                availableStock: v.stock ?? prod.stock ?? 25,
                reservedStock: 2,
                totalOnHand: (v.stock ?? prod.stock ?? 25) + 2,
                lowStockThreshold: 10,
                locationName: 'Bengaluru Flagship Studio',
                status: ((v.stock ?? prod.stock ?? 25) > 10 ? 'in_stock' : (v.stock ?? prod.stock ?? 25) > 0 ? 'low_stock' : 'out_of_stock') as any,
                updatedAt: prod.updatedAt || new Date().toISOString(),
              });
            }
          } else {
            generated.push({
              id: `inv_${prod.id}`,
              productId: prod.id,
              productTitle: prod.title,
              variantId: prod.id,
              variantTitle: 'Standard',
              sku: prod.sku || 'JQT-SKU',
              availableStock: prod.stock ?? 25,
              reservedStock: 2,
              totalOnHand: (prod.stock ?? 25) + 2,
              lowStockThreshold: 10,
              locationName: 'Bengaluru Flagship Studio',
              status: ((prod.stock ?? 25) > 10 ? 'in_stock' : (prod.stock ?? 25) > 0 ? 'low_stock' : 'out_of_stock') as any,
              updatedAt: prod.updatedAt || new Date().toISOString(),
            });
          }
        }
        this.localInventory = generated;
        return generated;
      }
    } catch {
      // Fallback
    }

    if (this.localInventory.length === 0) {
      this.localInventory = INITIAL_PRODUCTS.flatMap((prod) =>
        prod.variants.map((v) => ({
          id: `inv_${v.id}`,
          productId: prod.id,
          productTitle: prod.title,
          variantId: v.id,
          variantTitle: v.title,
          sku: v.sku,
          availableStock: v.stock,
          reservedStock: 2,
          totalOnHand: v.stock + 2,
          lowStockThreshold: 10,
          locationName: 'Bengaluru Flagship Studio',
          status: (v.stock > 10 ? 'in_stock' : v.stock > 0 ? 'low_stock' : 'out_of_stock') as any,
          updatedAt: new Date().toISOString(),
        }))
      );
    }
    return this.localInventory;
  }

  static async adjustStock(variantId: string, amount: number, reason: string): Promise<InventoryItem> {
    try {
      await ApiClient.post('/api/v1/inventory/adjust', {
        variantId,
        changeAmount: amount,
        reason,
      });
    } catch {
      // Fallback
    }

    this.localInventory = this.localInventory.map((item) => {
      if (item.variantId === variantId) {
        const newAvailable = Math.max(0, item.availableStock + amount);
        return {
          ...item,
          availableStock: newAvailable,
          totalOnHand: newAvailable + item.reservedStock,
          status: (newAvailable > 10 ? 'in_stock' : newAvailable > 0 ? 'low_stock' : 'out_of_stock') as any,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const updated = this.localInventory.find((i) => i.variantId === variantId);
    if (!updated) throw new Error('Inventory item not found');
    return updated;
  }
}
