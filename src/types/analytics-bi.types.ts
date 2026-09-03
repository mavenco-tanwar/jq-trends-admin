export interface AnalyticsOverviewMetrics {
  totalRevenueMinor: number;
  ordersCount: number;
  averageOrderValueMinor: number;
  conversionRatePercentage: number;
  repeatCustomerRatePercentage: number;
  projected30DayRevenueMinor: number;
  liveActiveVisitorsCount: number;
  unitsSoldCount: number;
  grossMarginPercentage: number;
  currency: string;
}

export interface SalesBreakdownPoint {
  date: string;
  grossRevenueMinor: number;
  netRevenueMinor: number;
  ordersCount: number;
  unitsCount: number;
  discountsMinor: number;
  taxMinor: number;
}

export interface ConversionFunnelStep {
  stepIndex: number;
  stepName: string;
  visitorsCount: number;
  stepConversionRate: number;
  dropOffRate: number;
}

export interface CohortRetentionRow {
  cohortMonth: string;
  initialCustomersCount: number;
  retentionPercentages: number[]; // Month 0, Month 1, Month 2, Month 3, Month 4
  cumulativeRevenueMinor: number;
}

export interface ChannelAttribution {
  channel: string;
  firstTouchRevenueMinor: number;
  lastTouchRevenueMinor: number;
  linearRevenueMinor: number;
  adSpendMinor: number;
  roasMultiplier: number;
  ordersCount: number;
}

export interface ProductVelocityRecord {
  id: string;
  title: string;
  sku: string;
  category: string;
  viewsCount: number;
  cartAddsCount: number;
  unitsSold: number;
  revenueMinor: number;
  conversionRate: number;
  wishlistAdds: number;
  refundRatePercentage: number;
}

export interface LiveActivityItem {
  id: string;
  eventType: 'order_placed' | 'cart_added' | 'customer_registered' | 'checkout_started';
  description: string;
  valueMinor?: number;
  currency?: string;
  location?: string;
  timestamp: string;
}

export interface AnalyticsCustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  dimensions: string[];
  dateRange: string;
  format: 'csv' | 'json' | 'pdf';
  lastGeneratedAt?: string;
}

export interface ScheduledReportTask {
  id: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipientEmails: string[];
  format: 'csv' | 'pdf';
  status: 'active' | 'paused';
  nextRunAt: string;
}
