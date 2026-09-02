export type GalleryLayoutType =
  | 'left-thumbs'
  | 'bottom-thumbs'
  | 'grid-2'
  | 'stacked'
  | 'carousel'
  | 'masonry';

export type AspectRatioType = '1:1' | '4:5' | '3:4' | '16:9' | 'auto';
export type ZoomModeType = 'hover' | 'click' | 'fullscreen' | 'disabled';
export type VariantOptionDisplayType = 'swatches' | 'buttons' | 'dropdown' | 'chips';

export interface GalleryConfig {
  layout: GalleryLayoutType;
  aspectRatio: AspectRatioType;
  zoomMode: ZoomModeType;
  thumbnailsPosition: 'left' | 'bottom' | 'hidden';
  enableVideo: boolean;
  enable360: boolean;
  galleryWidthPercent: number; // e.g. 50, 55, 60
  gap: 'small' | 'medium' | 'large';
  mobileCarousel: boolean;
  showImageBadge: boolean;
}

export type PurchaseElementKey =
  | 'badges'
  | 'brand'
  | 'title'
  | 'rating'
  | 'price'
  | 'discount'
  | 'colorSwatches'
  | 'sizeSelector'
  | 'sizeGuide'
  | 'quantity'
  | 'addToCart'
  | 'buyNow'
  | 'wishlist'
  | 'share'
  | 'shipping'
  | 'returns'
  | 'sku'
  | 'stockUrgency';

export interface TrustBadgeItem {
  id: string;
  title: string;
  desc: string;
  icon?: string;
  enabled: boolean;
}

export interface PurchasePanelConfig {
  elementsOrder: PurchaseElementKey[];
  showBrand: boolean;
  showTitle: boolean;
  showRating: boolean;
  showReviewCount: boolean;
  showPrice: boolean;
  showComparePrice: boolean;
  showDiscount: boolean;
  discountFormat: 'percentage' | 'amount';
  showBadges: boolean;
  showSKU: boolean;
  colorDisplayType: VariantOptionDisplayType;
  sizeDisplayType: VariantOptionDisplayType;
  showStockStatus: boolean;
  showLowStockWarning: boolean;
  lowStockThreshold: number;
  lowStockMessage: string;
  outOfStockBehavior: 'disabled' | 'backorder' | 'preorder' | 'notifyMe';
  showQuantitySelector: boolean;
  showAddToCart: boolean;
  showBuyNow: boolean;
  showWishlist: boolean;
  showShare: boolean;
  showShippingInfo: boolean;
  shippingText: string;
  deliveryEstimatorEnabled: boolean;
  defaultEstimatedDays: string;
  showReturnsInfo: boolean;
  returnDays: number;
  returnPolicyText: string;
  trustBadges: TrustBadgeItem[];
  stickyDesktop: boolean;
  stickyOffsetPx: number;
  mobileStickyBar: boolean;
}

export interface PdpSectionItem {
  id: string;
  type:
    | 'description'
    | 'specifications'
    | 'sizeGuide'
    | 'careInstructions'
    | 'accordions'
    | 'tabs'
    | 'reviews'
    | 'qna'
    | 'relatedProducts'
    | 'recommendedProducts'
    | 'recentlyViewed'
    | 'promotionalBanner'
    | 'customContent';
  title: string;
  enabled: boolean;
  position: number;
  data?: Record<string, any>;
}

export interface PdpSeoConfig {
  metaTitleTemplate: string; // e.g. "{{product.title}} | {{tenant.name}}"
  metaDescriptionTemplate: string;
  enableJsonLd: boolean;
  canonicalStrategy: 'base-product' | 'variant-url';
  ogImageFallback?: string;
}

export interface ProductPageConfig {
  id: string;
  name: string;
  isDefault?: boolean;
  gallery: GalleryConfig;
  purchasePanel: PurchasePanelConfig;
  sections: PdpSectionItem[];
  seo: PdpSeoConfig;
  accentColor?: string;
}

export interface ProductTemplate {
  id: string;
  tenantSlug: string;
  name: string;
  description: string;
  isDefault: boolean;
  draft: ProductPageConfig;
  published: ProductPageConfig;
  createdAt: string;
  updatedAt: string;
}

export interface NormalizedProductMedia {
  type: 'image' | 'video' | '360';
  url: string;
  alt?: string;
  thumbnail?: string;
  position?: number;
}

export interface NormalizedProductVariant {
  id: string;
  sku: string;
  options: Record<string, string>; // e.g. { color: "Rose", size: "M" }
  price: number;
  compareAtPrice?: number;
  inventory: number;
  inStock: boolean;
  images?: string[];
}

export interface NormalizedProduct {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  brand?: {
    name: string;
    logo?: string;
    href?: string;
  };
  category?: string;
  categoryName?: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  currency: string;
  sku: string;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  media: NormalizedProductMedia[];
  variants: NormalizedProductVariant[];
  colors?: Array<{ name: string; hex?: string; image?: string }>;
  sizes?: Array<{ size: string; inStock: boolean }>;
  features?: string[];
  specifications?: Array<{ key: string; value: string }>;
  fabric?: string;
  careInstructions?: string[];
  origin?: string;
  inStock: boolean;
  stockCount: number;
}
