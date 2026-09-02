export interface SearchFacetOption {
  label: string;
  value: string;
  count: number;
}

export interface SearchFacet {
  id: string;
  name: string;
  type: 'category' | 'price' | 'color' | 'size' | 'availability';
  options: SearchFacetOption[];
}

export interface SearchProductHit {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  sku: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  score?: number;
  isPinned?: boolean;
  matchReason?: string;
}

export interface SearchAutocompleteSuggestion {
  type: 'product' | 'category' | 'query' | 'brand';
  id?: string;
  label: string;
  url: string;
  image?: string;
  category?: string;
  price?: number;
}

export interface SearchSynonym {
  id: string;
  tenantId: string;
  primaryTerm: string;
  synonyms: string[];
  direction: 'two_way' | 'one_way';
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface SearchMerchandisingRule {
  id: string;
  tenantId: string;
  query: string;
  matchType: 'exact' | 'contains';
  action: 'pin' | 'boost' | 'bury' | 'hide' | 'redirect';
  targetProductId?: string;
  targetProductName?: string;
  targetUrl?: string;
  boostFactor?: number;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface SearchEngineSettings {
  defaultSort: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  enableTypoTolerance: boolean;
  enableAutocomplete: boolean;
  minQueryLength: number;
  outOfStockBehavior: 'bottom' | 'hide' | 'normal';
  resultsPerPage: number;
}

export interface SearchAnalyticsData {
  topSearches: { query: string; count: number; clicks: number; conversion: number }[];
  zeroResultSearches: { query: string; count: number; lastSearched: string }[];
  trendingSearches: string[];
  totalSearches: number;
  zeroResultRate: number;
  averageConversionRate: number;
}
