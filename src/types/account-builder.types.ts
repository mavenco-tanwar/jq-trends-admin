export interface AccountBuilderSettings {
  id: string;
  tenantSlug: string;
  dashboard: {
    sidebarPosition: 'left' | 'right';
    showGreetingAvatar: boolean;
    showQuickMetrics: boolean;
    showWishlistQuickLink: boolean;
  };
  orders: {
    showTimelineOnModal: boolean;
    allowCustomerCancellation: boolean;
    cancellationWindowHours: number;
    allowReorder: boolean;
    allowDownloadInvoice: boolean;
  };
  addresses: {
    maxSavedAddresses: number;
    requirePhone: boolean;
    allowSeparateBilling: boolean;
  };
  updatedAt: string;
}

export const DEFAULT_ACCOUNT_BUILDER_SETTINGS: AccountBuilderSettings = {
  id: 'account_settings_default',
  tenantSlug: 'default',
  dashboard: {
    sidebarPosition: 'left',
    showGreetingAvatar: true,
    showQuickMetrics: true,
    showWishlistQuickLink: true,
  },
  orders: {
    showTimelineOnModal: true,
    allowCustomerCancellation: true,
    cancellationWindowHours: 24,
    allowReorder: true,
    allowDownloadInvoice: true,
  },
  addresses: {
    maxSavedAddresses: 10,
    requirePhone: true,
    allowSeparateBilling: true,
  },
  updatedAt: new Date().toISOString(),
};
