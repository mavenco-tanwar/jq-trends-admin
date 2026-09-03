export interface Store {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  status: 'draft' | 'provisioning' | 'active' | 'suspended' | 'maintenance' | 'archived';
  defaultLocale: string;
  defaultCurrency: string;
  timezone: string;
  country: string;
  language: string;
  themeId: string;
  primaryDomainId?: string;
  primaryDomainName?: string;
  settings: StoreSettings;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  currency: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  measurementSystem: 'metric' | 'imperial';
  customerAccountMode: 'optional' | 'required' | 'disabled';
  guestCheckout: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  inventoryVisibility: 'exact' | 'low_stock_only' | 'hidden';
  priceVisibility: 'public' | 'members_only';
  taxDisplayMode: 'inclusive' | 'exclusive';
  shippingDisplayMode: 'calculated_at_checkout' | 'flat_rate';
}

export interface SalesChannel {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  code: string;
  type: 'web' | 'mobile' | 'headless' | 'api' | 'marketplace' | 'social' | 'pos' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'disabled' | 'archived';
  configuration: {
    currency?: string;
    locale?: string;
    catalogVisibility?: 'all' | 'curated';
    customerAuth?: 'shared' | 'isolated';
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreDomain {
  id: string;
  tenantId: string;
  storeId: string;
  hostname: string;
  normalizedHostname: string;
  type: 'platform_subdomain' | 'custom_domain' | 'custom_subdomain' | 'alias';
  status: 'active' | 'pending_verification' | 'misconfigured' | 'suspended';
  isPrimary: boolean;
  verificationStatus: 'verified' | 'pending' | 'failed';
  verificationToken?: string;
  sslStatus: 'active' | 'provisioning' | 'pending' | 'expired' | 'failed';
  dnsStatus: 'verified' | 'pending' | 'failed';
  redirectToPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DomainCertificate {
  id: string;
  tenantId: string;
  domainId: string;
  provider: 'letsencrypt' | 'cloudflare_managed' | 'aws_acm';
  status: 'pending' | 'provisioning' | 'active' | 'expiring' | 'expired' | 'failed' | 'revoked';
  issuedAt?: string;
  expiresAt?: string;
  renewalStatus?: string;
  lastCheckedAt: string;
}

export interface StoreEnvironment {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  type: 'production' | 'staging' | 'preview';
  status: 'active' | 'paused' | 'deploying';
  activeVersion: string;
  createdAt: string;
}

export interface StoreConfigurationVersion {
  id: string;
  tenantId: string;
  storeId: string;
  version: string;
  environment: 'production' | 'staging' | 'preview';
  snapshot: Record<string, any>;
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}

export interface StoreProvisioningPayload {
  name: string;
  slug: string;
  country: string;
  currency: string;
  language: string;
  timezone: string;
  templatePreset: 'fashion_luxury' | 'electronics' | 'beauty_cosmetics' | 'general_retail';
  platformSubdomain: string;
}
