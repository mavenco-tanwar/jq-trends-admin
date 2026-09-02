export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  priority: number;
  capabilities: ('storage' | 'fulfillment' | 'pickup' | 'returns')[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string;
  barcode?: string;
  warehouseId: string;
  warehouseName: string;
  onHand: number;
  reserved: number;
  available: number;
  incoming: number;
  damaged: number;
  safetyStock: number;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
  updatedAt: string;
}

export type StockMovementType =
  | 'IN'
  | 'OUT'
  | 'RESERVATION'
  | 'RELEASE'
  | 'COMMIT'
  | 'ADJUSTMENT'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'DAMAGE'
  | 'RETURN';

export interface StockMovementLedger {
  id: string;
  sku: string;
  productId: string;
  variantId: string;
  warehouseId: string;
  warehouseName?: string;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  actorName: string;
  createdAt: string;
}

export interface StockTransferItem {
  sku: string;
  title: string;
  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destWarehouseId: string;
  destWarehouseName: string;
  items: StockTransferItem[];
  status: 'draft' | 'pending' | 'in_transit' | 'received' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockReservation {
  id: string;
  inventoryItemId: string;
  sku: string;
  productTitle: string;
  warehouseId: string;
  quantity: number;
  sourceType: 'cart' | 'checkout' | 'order' | 'manual';
  sourceId: string;
  status: 'active' | 'released' | 'committed' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface FulfillmentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  items: {
    sku: string;
    title: string;
    quantity: number;
  }[];
  status: 'pending' | 'allocated' | 'picking' | 'picked' | 'packing' | 'packed' | 'shipped' | 'delivered';
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}
