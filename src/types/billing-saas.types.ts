export interface BillingAccount {
  id: string;
  tenantId: string;
  status: 'active' | 'past_due' | 'suspended' | 'closed';
  billingEmail: string;
  billingName: string;
  companyName: string;
  taxId?: string;
  currency: string;
  country: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  defaultPaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  visibility: 'public' | 'private' | 'internal';
  billingModel: 'free' | 'flat' | 'per_store' | 'usage_based' | 'hybrid';
  monthlyPriceMinor: number;
  yearlyPriceMinor: number;
  currency: string;
  trialDays: number;
  features: {
    key: string;
    name: string;
    enabled: boolean;
    description?: string;
  }[];
  limits: {
    maxStores: number;
    maxCustomDomains: number;
    maxProducts: number;
    maxMonthlyOrders: number;
    maxStorageGb: number;
    maxApiRequestsPerMonth: number;
  };
  highlight?: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  billingAccountId: string;
  planId: string;
  planName: string;
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'cancelled' | 'expired';
  billingInterval: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  currency: string;
  amountMinor: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsageAggregation {
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  storesCount: number;
  storesLimit: number;
  domainsCount: number;
  domainsLimit: number;
  productsCount: number;
  productsLimit: number;
  monthlyOrdersCount: number;
  monthlyOrdersLimit: number;
  apiRequestsCount: number;
  apiRequestsLimit: number;
  storageGbUsed: number;
  storageGbLimit: number;
}

export interface BillingInvoice {
  id: string;
  tenantId: string;
  billingAccountId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: 'draft' | 'open' | 'paid' | 'past_due' | 'void' | 'refunded';
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  periodStart: string;
  periodEnd: string;
  dueAt: string;
  paidAt?: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface BillingPaymentMethod {
  id: string;
  tenantId: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PlatformMonetizationMetrics {
  mrrMinor: number;
  arrMinor: number;
  activeTenantsCount: number;
  trialingTenantsCount: number;
  churnRatePercentage: number;
  currency: string;
  planDistribution: {
    planName: string;
    subscribersCount: number;
    revenueMinor: number;
  }[];
}
