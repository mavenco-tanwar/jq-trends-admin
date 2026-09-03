/**
 * Global Commerce & Localization Domain Types (Module 32)
 * Production-grade, decoupled models for multi-market, multi-country, multi-currency, and localization.
 */

export type MarketStatus = 'draft' | 'active' | 'paused' | 'disabled' | 'archived';
export type TextDirection = 'ltr' | 'rtl';
export type UnitSystem = 'metric' | 'imperial';
export type TaxDisplayMode = 'inclusive' | 'exclusive';

export interface Market {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  code: string; // e.g. 'US', 'EU', 'IN', 'UK', 'GCC', 'APAC'
  status: MarketStatus;
  description?: string;
  countries: string[]; // ISO 3166-1 alpha-2 codes: ['US', 'CA'], ['DE', 'FR', 'IT'], etc.
  regions: string[]; // e.g. ['North America'], ['Western Europe']
  defaultLocale: string; // e.g. 'en-US'
  supportedLocales: string[]; // e.g. ['en-US', 'es-US', 'fr-CA']
  defaultCurrency: string; // e.g. 'USD'
  supportedCurrencies: string[]; // e.g. ['USD', 'CAD']
  catalogId?: string; // Curated or full catalog
  priceListId?: string; // Market specific price list
  taxConfigurationId?: string;
  shippingConfigurationId?: string;
  paymentConfigurationId?: string;
  domainConfiguration?: {
    domainType: 'custom_domain' | 'subdomain' | 'subdirectory' | 'shared';
    hostname?: string; // e.g. 'eu.store.com' or 'store.co.uk'
    pathPrefix?: string; // e.g. '/fr' or '/de'
    sslStatus?: 'active' | 'pending' | 'none';
  };
  seoConfiguration?: {
    hreflangCode: string; // e.g. 'en-us', 'fr-ca', 'de-de'
    canonicalBaseUrl?: string;
    localizedTitleSuffix?: string;
    sitemapIndexEnabled: boolean;
  };
  customerEligibility?: {
    requiresAccount: boolean;
    allowedCustomerGroups?: string[];
  };
  metrics?: {
    activeCustomers: number;
    monthlyGmvMinorUnits: number;
    orderCount: number;
    conversionRate: number;
  };
  healthScore?: number; // 0-100
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CountryConfiguration {
  countryCode: string; // ISO 3166-1 alpha-2 (e.g. 'US', 'DE', 'IN', 'GB', 'AE', 'JP')
  name: string;
  region: string; // 'North America', 'Europe', 'Middle East', 'Asia Pacific'
  subregion?: string;
  defaultCurrency: string;
  supportedLocales: string[];
  taxZone: string;
  shippingZone: string;
  supported: boolean;
  phoneCode: string; // e.g. '+1', '+44', '+91', '+971'
  postalCodeRules: PostalCodeRule;
  addressFormat: AddressSchema;
  unitSystem: UnitSystem;
  flagEmoji: string;
  status: 'active' | 'restricted' | 'disabled';
}

export interface RegionConfiguration {
  id: string;
  name: string; // 'North America', 'Europe', 'Middle East', 'Asia Pacific', 'Latin America'
  code: string;
  subregions: string[];
  countries: string[];
  defaultCurrency: string;
  status: 'active' | 'disabled';
}

export interface LocaleConfiguration {
  code: string; // 'en-US', 'fr-FR', 'de-DE', 'ar-SA', 'hi-IN', 'ja-JP'
  language: string; // 'English', 'Français', 'Deutsch', 'العربية', 'हिन्दी', '日本語'
  region: string; // 'United States', 'France', 'Germany', 'Saudi Arabia', 'India', 'Japan'
  displayName: string;
  nativeName: string;
  direction: TextDirection;
  status: 'active' | 'beta' | 'draft';
  fallbackLocale?: string;
}

export interface CurrencyConfiguration {
  code: string; // ISO 4217 (e.g. 'USD', 'EUR', 'GBP', 'INR', 'AED', 'JPY')
  name: string;
  symbol: string;
  minorUnit: number; // 100 for cents, 1 for JPY, 1000 for KWD
  decimalPlaces: number;
  symbolPosition: 'prefix' | 'suffix';
  spaceBetweenSymbolAndNumber: boolean;
  status: 'active' | 'supported_display_only' | 'disabled';
  exchangeRateToBase: number; // e.g. 1.0 for USD, 0.92 for EUR, 83.5 for INR
  rateSource: string; // 'ecb', 'open_exchange', 'fixer', 'manual'
  lastRateUpdate: string;
}

export interface Money {
  minorUnits: number; // Stored as integer (e.g. 2999 = $29.99)
  currency: string; // ISO 4217
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  effectiveAt: string;
  expiresAt: string;
  status: 'active' | 'stale' | 'override';
}

export interface PriceList {
  id: string;
  tenantId: string;
  storeId: string;
  marketId?: string;
  name: string;
  code: string;
  currency: string;
  priority: number; // Higher number = higher precedence
  status: 'active' | 'draft' | 'archived';
  validFrom?: string;
  validTo?: string;
  roundingRule: 'none' | 'round_99' | 'round_95' | 'round_00' | 'ceil';
  entries: PriceListEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceListEntry {
  productId: string;
  variantId?: string;
  priceMinorUnits: number;
  compareAtPriceMinorUnits?: number;
  minQuantity?: number;
}

export interface TaxJurisdiction {
  id: string;
  country: string;
  region?: string;
  postalCodePattern?: string;
  taxZone: string;
  taxType: 'vat' | 'gst' | 'sales_tax' | 'customs';
  standardRatePercent: number;
  displayMode: TaxDisplayMode;
  taxLabel: string; // 'VAT', 'GST', 'Sales Tax', 'MWST'
  status: 'active' | 'exempt' | 'disabled';
}

export interface HolidayCalendar {
  id: string;
  country: string;
  region?: string;
  marketId?: string;
  year: number;
  holidays: {
    date: string; // 'YYYY-MM-DD'
    name: string;
    isBankingHoliday: boolean;
    isDeliveryBlackout: boolean;
  }[];
}

export interface AddressSchema {
  fields: {
    name: string;
    label: string;
    required: boolean;
    order: number;
    placeholder?: string;
  }[];
  stateProvinceLabel: 'State' | 'Province' | 'Prefecture' | 'County' | 'Region' | 'Emirate';
  postalCodeLabel: 'ZIP Code' | 'Postal Code' | 'PIN Code' | 'Postcode';
}

export interface PostalCodeRule {
  pattern: string; // regex pattern
  normalization?: string;
  required: boolean;
  example: string;
}

export interface MarketCatalog {
  id: string;
  marketId: string;
  mode: 'all_products' | 'whitelist' | 'blacklist';
  includedProductIds?: string[];
  excludedProductIds?: string[];
  includedCollectionIds?: string[];
  excludedCollectionIds?: string[];
}

export interface MarketProductRestriction {
  id: string;
  marketId: string;
  productId: string;
  reason: 'regulation' | 'logistics' | 'inventory' | 'licensing' | 'merchant_policy';
  countryRestrictions?: string[];
}

export interface MarketContext {
  tenantId: string;
  storeId: string;
  channelId?: string;
  marketId: string;
  marketCode: string;
  countryCode: string;
  regionCode: string;
  locale: string;
  currency: string;
  timezone: string;
  direction: TextDirection;
  taxZoneId?: string;
  shippingZoneId?: string;
  catalogId?: string;
  priceListId?: string;
  taxDisplayMode: TaxDisplayMode;
}

export interface TranslationResource {
  id: string;
  tenantId: string;
  storeId: string;
  locale: string;
  namespace: TranslationNamespace;
  key: string;
  value: string;
  status: 'published' | 'draft' | 'missing' | 'outdated' | 'ai_suggested';
  version: number;
  updatedAt: string;
}

export type TranslationNamespace =
  | 'common'
  | 'navigation'
  | 'product'
  | 'checkout'
  | 'account'
  | 'orders'
  | 'cart'
  | 'errors'
  | 'marketing'
  | 'footer'
  | 'forms';

export interface LocalizedSlug {
  id: string;
  entityType: 'product' | 'category' | 'collection' | 'page';
  entityId: string;
  locale: string;
  slug: string;
  canonicalUrl: string;
  status: 'active' | 'redirect';
}

export interface MarketHealthDiagnostic {
  category: 'catalog' | 'pricing' | 'tax' | 'shipping' | 'payment' | 'domain' | 'localization' | 'seo';
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface MarketReadinessReport {
  marketId: string;
  marketCode: string;
  marketName: string;
  overallStatus: 'ready' | 'warning' | 'blocked';
  readinessPercentage: number;
  diagnostics: MarketHealthDiagnostic[];
  updatedAt: string;
}

export interface MarketVersion {
  id: string;
  marketId: string;
  versionNumber: number;
  snapshot: Market;
  changelog: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'archived';
}
