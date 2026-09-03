export interface IntegrationProvider {
  id: string;
  name: string;
  slug: string;
  category: 'erp' | 'crm' | 'accounting' | 'pos' | 'shipping' | 'marketplace' | 'wms' | 'marketing';
  description: string;
  iconBg: string;
  authType: 'oauth2' | 'api_key' | 'basic' | 'hmac' | 'jwt';
  capabilities: Array<'products' | 'orders' | 'inventory' | 'customers' | 'payments' | 'refunds' | 'shipments' | 'webhooks' | 'incremental_sync'>;
  status: 'active' | 'beta' | 'deprecated';
  configurationSchema: Array<{
    key: string;
    label: string;
    type: 'string' | 'secret' | 'number' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
    description: string;
  }>;
}

export interface TenantIntegrationInstance {
  id: string;
  tenantId: string;
  providerId: string;
  name: string;
  status: 'connected' | 'syncing' | 'degraded' | 'paused' | 'error' | 'disconnected';
  credentialsRef: string;
  configuration: Record<string, any>;
  lastConnectedAt: string | null;
  lastSyncAt: string | null;
  rateLimitUsagePercent: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  createdAt: string;
}

export interface IntegrationSyncJob {
  id: string;
  tenantId: string;
  integrationId: string;
  integrationName: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  entityType: 'products' | 'orders' | 'inventory' | 'customers' | 'financials';
  mode: 'full' | 'incremental' | 'event_driven';
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed';
  processedCount: number;
  successCount: number;
  failedCount: number;
  cursor: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  errorSummary?: string;
}

export interface FieldMappingRule {
  id: string;
  integrationId: string;
  entityType: 'products' | 'orders' | 'inventory' | 'customers';
  internalField: string;
  externalField: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  transformationType: 'direct' | 'uppercase' | 'lowercase' | 'trim' | 'replace' | 'currency_convert' | 'math_multiply';
  transformationParam?: string;
  defaultValue?: string;
  isRequired: boolean;
}

export interface IntegrationConflictRecord {
  id: string;
  tenantId: string;
  integrationId: string;
  entityType: 'products' | 'orders' | 'inventory' | 'customers';
  internalId: string;
  externalId: string;
  conflictField: string;
  internalValue: string;
  externalValue: string;
  strategy: 'internal_wins' | 'external_wins' | 'newest_wins' | 'manual';
  status: 'pending' | 'resolved' | 'ignored';
  detectedAt: string;
  resolvedAt?: string;
}

export interface ReconciliationReport {
  id: string;
  tenantId: string;
  integrationId: string;
  category: 'inventory' | 'orders' | 'financial_ledger' | 'customers';
  totalChecked: number;
  matchedCount: number;
  discrepancyCount: number;
  missingInternalCount: number;
  missingExternalCount: number;
  status: 'balanced' | 'action_required';
  lastRunAt: string;
}

export interface AutomationWorkflowRecord {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: 'published' | 'draft' | 'paused';
  version: number;
  trigger: {
    event: string;
    label: string;
  };
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
    value: string;
  }>;
  actions: Array<{
    id: string;
    type: 'call_integration' | 'send_notification' | 'update_entity' | 'create_coupon' | 'request_approval' | 'delay';
    target: string;
    payloadSummary: string;
  }>;
  executionsCount24h: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerEvent: string;
  status: 'completed' | 'failed' | 'running' | 'waiting_approval';
  durationMs: number;
  stepsSummary: string;
  timestamp: string;
}
