export type ReturnType = 'refund' | 'exchange' | 'store_credit';

export type ReturnStatus =
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'pickup_scheduled'
  | 'in_transit'
  | 'received'
  | 'inspecting'
  | 'approved_for_refund'
  | 'refunded'
  | 'exchange_processing'
  | 'exchange_completed'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface ReturnItem {
  orderItemId: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  image?: string;
  unitPrice: number;
  quantityOrdered: number;
  quantityRequested: number;
  quantityApproved?: number;
  quantityReceived?: number;
  quantityRestocked?: number;
  quantityDamaged?: number;
  reason: string;
  customerNotes?: string;
  condition?: 'new' | 'opened' | 'used' | 'damaged' | 'defective' | 'wrong_item';
  disposition?: 'restock' | 'damaged' | 'quarantine' | 'discard';
  refundAmount: number;
  exchangeVariantTitle?: string;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: ReturnType;
  status: ReturnStatus;
  items: ReturnItem[];
  reason: string;
  customerNote?: string;
  adminNote?: string;
  pickupCarrier?: string;
  pickupTrackingNumber?: string;
  pickupScheduledDate?: string;
  inspectionNotes?: string;
  inspectedBy?: string;
  totalRefundAmount: number;
  exchangeOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRecord {
  id: string;
  refundNumber: string;
  returnId?: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: 'original_payment' | 'store_credit' | 'bank_transfer' | 'manual';
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  provider: string;
  providerRefundId?: string;
  reason: string;
  createdAt: string;
}

export interface ReturnPolicySettings {
  enabled: boolean;
  returnWindowDays: number;
  allowPartialReturns: boolean;
  requireDeliveredOrder: boolean;
  allowExchanges: boolean;
  allowStoreCredit: boolean;
  autoRestockOnPassInspection: boolean;
  returnShippingFee: number;
  restockingFeePercent: number;
}
