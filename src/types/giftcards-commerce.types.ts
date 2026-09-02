export interface GiftCard {
  id: string;
  tenantId: string;
  giftCardNumber: string;
  codeHash?: string;
  codeLast4: string;
  type: 'digital' | 'physical';
  status: 'draft' | 'scheduled' | 'active' | 'partially_redeemed' | 'fully_redeemed' | 'expired' | 'disabled' | 'cancelled';
  initialAmountMinor: number; // Integer minor currency units (paise/cents)
  currentBalanceMinor: number;
  currency: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  expiresAt?: string;
  activatedAt?: string;
  redeemedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardLedgerEntry {
  id: string;
  tenantId: string;
  giftCardId: string;
  type:
    | 'ISSUE'
    | 'ACTIVATE'
    | 'RELOAD'
    | 'REDEEM'
    | 'REDEEM_REVERSAL'
    | 'REFUND'
    | 'REFUND_REVERSAL'
    | 'ADJUSTMENT_CREDIT'
    | 'ADJUSTMENT_DEBIT'
    | 'EXPIRATION'
    | 'CANCELLATION';
  amountMinor: number;
  currency: string;
  balanceBeforeMinor: number;
  balanceAfterMinor: number;
  orderId?: string;
  refundId?: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  code: string;
  type: 'single_use' | 'multi_use' | 'customer_specific' | 'promotional';
  valueType: 'fixed_amount' | 'percentage' | 'free_shipping';
  valueMinor: number;
  percentage?: number;
  currency: string;
  minimumOrderValueMinor: number;
  maximumDiscountMinor?: number;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
