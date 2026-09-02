export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';

export type NotificationCategory =
  | 'ORDER'
  | 'PAYMENT'
  | 'SHIPPING'
  | 'DELIVERY'
  | 'RETURN'
  | 'REFUND'
  | 'ACCOUNT'
  | 'INVENTORY'
  | 'MARKETING'
  | 'REVIEW'
  | 'CART'
  | 'SYSTEM'
  | 'ADMIN';

export interface NotificationTemplate {
  id: string;
  tenantId: string;
  name: string;
  event: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  subject?: string;
  emailHtml?: string;
  smsBody?: string;
  whatsappTemplateName?: string;
  pushTitle?: string;
  pushBody?: string;
  inAppTitle?: string;
  inAppBody?: string;
  variables: string[];
  status: 'published' | 'draft' | 'archived';
  version: number;
  updatedAt: string;
}

export interface NotificationProviderConfig {
  id: string;
  tenantId: string;
  channel: NotificationChannel;
  providerName: 'resend' | 'sendgrid' | 'smtp' | 'twilio' | 'aws_sns' | 'meta_whatsapp' | 'firebase' | 'internal';
  status: 'active' | 'inactive' | 'degraded';
  senderEmail?: string;
  senderName?: string;
  senderPhone?: string;
  isPrimary: boolean;
  successRate: number;
  avgLatencyMs: number;
}

export interface NotificationDeliveryLog {
  id: string;
  tenantId: string;
  notificationId: string;
  recipient: string;
  channel: NotificationChannel;
  event: string;
  status: 'delivered' | 'sent' | 'queued' | 'failed' | 'opened' | 'clicked' | 'bounced';
  provider: string;
  subject?: string;
  contentSnippet: string;
  errorMessage?: string;
  attempts: number;
  sentAt: string;
  deliveredAt?: string;
}

export interface InAppCustomerNotification {
  id: string;
  tenantId: string;
  customerId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}
