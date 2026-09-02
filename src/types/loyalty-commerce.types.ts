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

export interface LoyaltyLedgerEntry {
  id: string;
  tenantId: string;
  customerId: string;
  type:
    | 'EARN'
    | 'REDEEM'
    | 'EXPIRE'
    | 'REVERSAL'
    | 'REFUND'
    | 'ADJUSTMENT'
    | 'BONUS'
    | 'REFERRAL'
    | 'REVIEW'
    | 'SIGNUP'
    | 'BIRTHDAY'
    | 'CAMPAIGN'
    | 'TIER_BONUS';
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  source?: string;
  sourceId?: string;
  description: string;
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

export interface WalletLedgerEntry {
  id: string;
  tenantId: string;
  customerId: string;
  type:
    | 'CREDIT'
    | 'DEBIT'
    | 'REFUND'
    | 'REVERSAL'
    | 'EXPIRATION'
    | 'ADJUSTMENT'
    | 'PROMOTION'
    | 'LOYALTY_CONVERSION';
  amountMinor: number; // Integer minor currency units (paise/cents)
  currency: string;
  balanceBeforeMinor: number;
  balanceAfterMinor: number;
  source?: string;
  sourceId?: string;
  description: string;
  createdAt: string;
}

export interface CustomerWalletAccount {
  tenantId: string;
  customerId: string;
  currency: string;
  balanceMinor: number;
  lifetimeCreditMinor: number;
  lifetimeDebitMinor: number;
  updatedAt: string;
}

export interface ReferralRecord {
  id: string;
  tenantId: string;
  referrerCustomerId: string;
  referredEmail: string;
  referralCode: string;
  status: 'invited' | 'registered' | 'order_completed' | 'rewarded';
  rewardPoints: number;
  rewardWalletCreditMinor: number;
  createdAt: string;
}
