export type MarketingChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'completed'
  | 'paused'
  | 'cancelled';

export type AutomationTrigger =
  | 'abandoned_cart'
  | 'welcome_series'
  | 'post_purchase_review'
  | 'win_back_60d'
  | 'vip_tier_unlocked';

export interface CustomerSegmentConditions {
  minSpent?: number;
  minOrders?: number;
  maxDaysSinceLastOrder?: number;
  rfmStage?: 'champions' | 'loyal_customers' | 'potential_loyalists' | 'at_risk' | 'lost' | 'all';
}

export interface CustomerSegment {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: 'dynamic' | 'static';
  conditions: CustomerSegmentConditions;
  estimatedAudienceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingCampaign {
  id: string;
  tenantId: string;
  name: string;
  channel: MarketingChannel;
  status: CampaignStatus;
  audienceSegmentId: string;
  audienceName: string;
  subject?: string;
  content: string;
  discountCode?: string;
  scheduleTime?: string;
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    orders: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleAutomation {
  id: string;
  tenantId: string;
  name: string;
  triggerType: AutomationTrigger;
  status: 'active' | 'paused';
  delayMinutes: number;
  channel: MarketingChannel;
  templateSubject: string;
  templateBody: string;
  discountCode?: string;
  stats: {
    triggers: number;
    sent: number;
    recoveredOrders: number;
    recoveredRevenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerConsent {
  emailMarketing: boolean;
  smsMarketing: boolean;
  whatsappMarketing: boolean;
  lastUpdated: string;
}
