export interface MiniCartConfig {
  enabled: boolean;
  autoOpenOnAddToCart: boolean;
  drawerPosition: 'right' | 'left';
  widthPx: number;
  showFreeShippingBar: boolean;
  freeShippingThreshold: number;
  freeShippingMessage: string;
  showCouponInput: boolean;
  showCrossSellRecommendations: boolean;
  crossSellSource: 'trending' | 'related' | 'recent';
  viewCartButtonText: string;
  checkoutButtonText: string;
}

export interface CartPageConfig {
  layout: '2-column' | 'single-column';
  stickyMobileSummary: boolean;
  showShippingEstimator: boolean;
  showCouponInput: boolean;
  showTrustBadges: boolean;
  showRecommendations: boolean;
  recommendationsTitle: string;
}

export interface StoreCartSettings {
  id: string;
  tenantSlug: string;
  miniCart: MiniCartConfig;
  cartPage: CartPageConfig;
  updatedAt: string;
}

export const DEFAULT_CART_BUILDER_SETTINGS: StoreCartSettings = {
  id: 'cart_settings_default',
  tenantSlug: 'default',
  miniCart: {
    enabled: true,
    autoOpenOnAddToCart: true,
    drawerPosition: 'right',
    widthPx: 420,
    showFreeShippingBar: true,
    freeShippingThreshold: 999,
    freeShippingMessage: "You're {{amount}} away from free express shipping!",
    showCouponInput: true,
    showCrossSellRecommendations: true,
    crossSellSource: 'trending',
    viewCartButtonText: 'View Shopping Bag',
    checkoutButtonText: 'Proceed to Checkout',
  },
  cartPage: {
    layout: '2-column',
    stickyMobileSummary: true,
    showShippingEstimator: true,
    showCouponInput: true,
    showTrustBadges: true,
    showRecommendations: true,
    recommendationsTitle: 'Pairs Well With Your Bag',
  },
  updatedAt: new Date().toISOString(),
};
