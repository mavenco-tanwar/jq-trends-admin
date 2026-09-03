export type StorefrontChannelType =
  | 'web'
  | 'mobile'
  | 'pwa'
  | 'pos'
  | 'marketplace'
  | 'social'
  | 'b2b'
  | 'partner';

export type StorefrontChannelStatus = 'draft' | 'active' | 'paused' | 'disabled';

export interface StorefrontRequestContext {
  requestId: string;
  traceId: string;
  tenantId: string;
  storeId: string;
  channelId: string;
  environmentId: string;
  domain: string;
  locale: string;
  currency: string;
  marketId: string;
  customerId?: string | null;
  sessionId: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'pos' | 'bot' | 'unknown';
  userAgent?: string;
  ipAddress?: string;
}

export interface Market {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  countries: string[];
  defaultCurrency: string;
  supportedCurrencies: string[];
  defaultLocale: string;
  supportedLocales: string[];
  taxZoneId: string;
  shippingZoneId: string;
  catalogId?: string;
  priceListId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ChannelConfiguration {
  locale: string;
  currency: string;
  allowedCurrencies: string[];
  allowedLocales: string[];
  catalogVisibility: 'all' | 'curated' | 'tagged';
  includedCategoryIds?: string[];
  includedCollectionIds?: string[];
  pricingMultiplier: number;
  priceListId?: string;
  allowGuestCheckout: boolean;
  requiresCustomerApproval: boolean;
  inventoryAllocationPolicy: 'shared' | 'channel_reserved' | 'safety_stock';
  reservedWarehouseId?: string;
  paymentMethodIds: string[];
  shippingMethodIds: string[];
  themeOverrideId?: string;
  seo: {
    titleTemplate: string;
    defaultMetaDescription: string;
    robotsRule: string;
    canonicalBaseUrl: string;
  };
  features: {
    wishlist: boolean;
    reviews: boolean;
    loyalty: boolean;
    giftCards: boolean;
    wallet: boolean;
    recommendations: boolean;
    analytics: boolean;
  };
}

export interface StorefrontChannel {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  code: string;
  type: StorefrontChannelType;
  status: StorefrontChannelStatus;
  apiKeyPrefix?: string;
  configuration: ChannelConfiguration;
  activeVersion: number;
  metrics24h: {
    requestCount: number;
    avgLatencyMs: number;
    conversionRate: number;
    ordersCount: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChannelVersion {
  id: string;
  tenantId: string;
  storeId: string;
  channelId: string;
  version: number;
  configurationSnapshot: ChannelConfiguration;
  publishedBy: string;
  publishedAt: string;
  changelog: string;
}

export interface StorefrontProductVariant {
  id: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
  image?: string;
}

export interface StorefrontProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  brand: string;
  images: string[];
  thumbnail: string;
  category: string;
  categories: string[];
  collections: string[];
  options: Array<{
    name: string;
    values: string[];
  }>;
  variants: StorefrontProductVariant[];
  pricing: {
    basePrice: number;
    salePrice: number;
    compareAtPrice?: number;
    discountPercentage?: number;
    currency: string;
    formattedPrice: string;
    formattedCompareAtPrice?: string;
  };
  availability: {
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder';
    displayLabel: string;
    canPurchase: boolean;
  };
  rating: {
    average: number;
    count: number;
  };
  badges: string[];
  shippingInformation: {
    estimatedDeliveryDays: string;
    freeShippingThreshold?: number;
    shipsFromZone: string;
  };
  returnInformation: {
    returnWindowDays: number;
    freeReturns: boolean;
  };
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage?: string;
  };
  tags: string[];
  metadata?: Record<string, any>;
}

export interface StorefrontNavigation {
  headerMenu: Array<{
    id: string;
    label: string;
    href: string;
    badge?: string;
    children?: Array<{ id: string; label: string; href: string; description?: string }>;
  }>;
  footerMenu: Array<{
    id: string;
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  megaMenu?: any;
  mobileMenu?: any;
}

export interface StorefrontCartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions: Record<string, string>;
}

export interface StorefrontCart {
  id: string;
  tenantId: string;
  storeId: string;
  channelId: string;
  currency: string;
  locale: string;
  items: StorefrontCartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  appliedCoupons: Array<{ code: string; discountAmount: number }>;
  appliedGiftCards: Array<{ code: string; balanceApplied: number }>;
  appliedStoreCredit: number;
  itemCount: number;
  currencySnapshot: {
    code: string;
    rateToBase: number;
  };
  updatedAt: string;
}

export type CheckoutState =
  | 'created'
  | 'contact_completed'
  | 'address_completed'
  | 'shipping_selected'
  | 'payment_pending'
  | 'ready'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface StorefrontCheckoutSession {
  id: string;
  cartId: string;
  tenantId: string;
  storeId: string;
  channelId: string;
  customerId?: string | null;
  currency: string;
  locale: string;
  state: CheckoutState;
  contact?: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  shippingAddress?: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  selectedShippingMethod?: {
    id: string;
    name: string;
    rate: number;
    carrier: string;
    estimatedDays: string;
  };
  paymentSession?: {
    sessionId: string;
    provider: string;
    clientSecretPreview: string;
    status: 'requires_payment_method' | 'processing' | 'succeeded' | 'failed';
    amount: number;
    currency: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  idempotencyKey: string;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
}

export interface PublicStoreConfiguration {
  store: {
    id: string;
    name: string;
    slug: string;
    brandLogo?: string;
    favicon?: string;
  };
  channel: {
    id: string;
    name: string;
    type: StorefrontChannelType;
    code: string;
  };
  localization: {
    defaultLocale: string;
    supportedLocales: string[];
    defaultCurrency: string;
    supportedCurrencies: string[];
    currencySymbols: Record<string, string>;
  };
  markets: Market[];
  features: {
    guestCheckout: boolean;
    wishlist: boolean;
    reviews: boolean;
    loyalty: boolean;
    giftCards: boolean;
    wallet: boolean;
    searchAutocomplete: boolean;
    aiRecommendations: boolean;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    canonicalBaseUrl: string;
  };
}
