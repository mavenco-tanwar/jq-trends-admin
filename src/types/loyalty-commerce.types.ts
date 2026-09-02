export interface LoyaltyTier {
  id: string;
  name: string;
  minSpend: number;
  pointsMultiplier: number;
  benefits: string[];
  badgeColor: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountType: 'fixed_amount' | 'percentage' | 'free_shipping';
  discountValue: number;
  couponCodePrefix: string;
  status: 'active' | 'paused';
}

export interface LoyaltyPointLedgerEntry {
  id: string;
  tenantId: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'referral' | 'refund_reversal' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface LoyaltyProgram {
  id: string;
  tenantId: string;
  name: string;
  pointsLabel: string;
  pointsPerCurrency: number;
  redemptionRate: number;
  minimumRedeemablePoints: number;
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
  createdAt: string;
  updatedAt: string;
}

export interface GiftCard {
  id: string;
  tenantId: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'partially_redeemed' | 'fully_redeemed' | 'disabled';
  recipientEmail?: string;
  senderName?: string;
  message?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCreditLedgerEntry {
  id: string;
  tenantId: string;
  customerId: string;
  type: 'refund_credit' | 'goodwill_credit' | 'redeemed' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  orderId?: string;
  createdAt: string;
}
