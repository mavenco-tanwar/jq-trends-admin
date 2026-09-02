export interface Payment {
  id: string;
  tenantId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  currency: string;
  amountMinor: number;
  status: 'created' | 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  paymentMethodType: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | 'paypal' | 'apple_pay';
  provider: 'razorpay' | 'stripe' | 'cod' | 'paypal';
  providerPaymentId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: string;
  tenantId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_action' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodTypes: string[];
  provider: string;
  providerIntentId?: string;
  clientSecret?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAttempt {
  id: string;
  tenantId: string;
  paymentIntentId: string;
  orderId: string;
  provider: string;
  paymentMethodType: string;
  amountMinor: number;
  status: 'succeeded' | 'failed' | 'requires_action';
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  paymentId: string;
  orderId: string;
  type: 'authorization' | 'capture' | 'sale' | 'refund' | 'chargeback' | 'adjustment';
  amountMinor: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  provider: string;
  providerTransactionId: string;
  processedAt: string;
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | 'paypal';
  provider: string;
  displayName: string;
  status: 'active' | 'inactive';
  supportedCurrencies: string[];
  sortOrder: number;
  isPopular?: boolean;
}

export interface PaymentProviderAccount {
  id: string;
  tenantId: string;
  name: string;
  provider: 'razorpay' | 'stripe' | 'cod' | 'paypal';
  environment: 'sandbox' | 'production';
  status: 'active' | 'inactive' | 'degraded';
  supportedCurrencies: string[];
  supportedMethods: string[];
  priority: number;
  latencyMs: number;
  successRate: number;
  updatedAt: string;
}

export interface PaymentWebhookEvent {
  id: string;
  tenantId: string;
  provider: string;
  eventId: string;
  eventType: string;
  signatureValid: boolean;
  status: 'processed' | 'failed' | 'ignored';
  receivedAt: string;
  processedAt?: string;
}

export interface PaymentReconciliationEntry {
  id: string;
  tenantId: string;
  provider: string;
  providerTransactionId: string;
  internalPaymentId?: string;
  orderId?: string;
  amountMinor: number;
  currency: string;
  matchStatus: 'matched' | 'missing_internal' | 'missing_provider' | 'amount_mismatch';
  discrepancyMinor?: number;
  reconciledAt: string;
}
