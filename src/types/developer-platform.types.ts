export interface DeveloperOverviewStats {
  totalApiRequests24h: number;
  activeApiKeysCount: number;
  installedAppsCount: number;
  webhookDeliverySuccessRate: number;
  p95LatencyMs: number;
  rateLimitUsagePercent: number;
  errorRatePercent: number;
}

export interface APIKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  keyHashPreview: string;
  scopes: string[];
  environment: 'production' | 'sandbox';
  status: 'active' | 'revoked' | 'expired';
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface OAuthAppRecord {
  id: string;
  name: string;
  clientId: string;
  clientSecretPreview: string;
  redirectUris: string[];
  allowedScopes: string[];
  activeInstallations: number;
  status: 'published' | 'in_review' | 'development' | 'suspended';
  createdAt: string;
}

export interface WebhookSubscriptionRecord {
  id: string;
  endpointUrl: string;
  subscribedEvents: string[];
  secretSignaturePreview: string;
  status: 'active' | 'failing' | 'paused';
  successCount: number;
  failureCount: number;
  lastDeliveredAt: string | null;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  subscriptionId: string;
  eventType: string;
  httpStatus: number;
  latencyMs: number;
  status: 'delivered' | 'failed' | 'retrying';
  payloadSummary: string;
  timestamp: string;
}

export interface AppMarketplaceListing {
  id: string;
  slug: string;
  name: string;
  category: 'marketing' | 'shipping' | 'accounting' | 'analytics' | 'ai_tools' | 'crm';
  description: string;
  developerName: string;
  iconBg: string;
  pricingType: 'free' | 'freemium' | 'subscription';
  monthlyPriceMinor: number;
  rating: number;
  reviewCount: number;
  requiredScopes: string[];
  isInstalled: boolean;
  installedAt?: string;
}

export interface APIAccessLogRecord {
  id: string;
  requestId: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  apiVersion: string;
  httpStatus: number;
  latencyMs: number;
  actorType: 'api_key' | 'oauth_app' | 'admin_session';
  actorIdentifier: string;
  timestamp: string;
}

export interface OpenAPIEndpointSpec {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  tag: string;
  summary: string;
  description: string;
  requiredScopes: string[];
  parameters: Array<{ name: string; in: string; required: boolean; type: string; description: string }>;
  sampleResponseJson: string;
}
