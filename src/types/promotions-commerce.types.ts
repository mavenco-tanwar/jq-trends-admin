export type PromotionType =
  | 'percentage_discount'
  | 'fixed_amount_discount'
  | 'buy_x_get_y'
  | 'free_shipping'
  | 'tiered_discount'
  | 'bundle_discount';

export type PromotionStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'expired'
  | 'archived';

export type PromotionTriggerType = 'coupon_code' | 'automatic';

export interface PromotionConditions {
  minOrderValue: number;
  minQuantity?: number;
  customerEligibility: 'all' | 'new_customers' | 'vip_only';
  eligibleCategoryIds?: string[];
  eligibleCollectionIds?: string[];
  eligibleProductIds?: string[];
  excludedProductIds?: string[];
}

export interface PromotionActions {
  discountType: 'percentage' | 'fixed_amount' | 'fixed_price';
  discountValue: number;
  maxDiscountAmount?: number;
  bogoConfig?: {
    buyQty: number;
    getQty: number;
    discountPercent: number;
  };
  tierSteps?: {
    minSpend: number;
    discountPercent: number;
  }[];
}

export interface CouponConfig {
  code: string;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit: number;
}

export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  internalName?: string;
  description?: string;
  status: PromotionStatus;
  promotionType: PromotionType;
  triggerType: PromotionTriggerType;
  priority: number;
  isStackable: boolean;
  isExclusive: boolean;
  startsAt: string;
  endsAt?: string;
  conditions: PromotionConditions;
  actions: PromotionActions;
  coupon?: CouponConfig;
  analytics?: {
    totalRedemptions: number;
    totalDiscountGiven: number;
    attributedRevenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PromotionUsage {
  id: string;
  tenantId: string;
  promotionId: string;
  couponCode?: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  discountAmount: number;
  orderGrandTotal: number;
  createdAt: string;
}

export interface PromotionSimulationResult {
  isEligible: boolean;
  reasonCode?: string;
  message: string;
  originalSubtotal: number;
  discountAmount: number;
  shippingDiscount: number;
  finalSubtotal: number;
  auditTrace: {
    rule: string;
    passed: boolean;
    details: string;
  }[];
}
