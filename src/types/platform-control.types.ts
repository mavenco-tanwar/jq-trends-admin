export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'invited' | 'suspended' | 'disabled';
  role: 'Platform Owner' | 'Platform Admin' | 'Operations Admin' | 'Billing Admin' | 'Support Admin' | 'Security Admin' | 'Read Only Admin';
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface TenantRegistryRecord {
  tenantId: string;
  slug: string;
  name: string;
  status: 'provisioning' | 'active' | 'trialing' | 'past_due' | 'suspended' | 'maintenance' | 'archived';
  databaseIdentifier: string;
  planId: string;
  planName: string;
  storesCount: number;
  customDomainsCount: number;
  mrrMinor: number;
  health: 'healthy' | 'warning' | 'degraded' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface ImpersonationSession {
  id: string;
  platformUserId: string;
  platformUserName: string;
  tenantId: string;
  tenantName: string;
  targetUserId: string;
  targetUserEmail: string;
  reason: string;
  status: 'active' | 'ended' | 'expired';
  startedAt: string;
  expiresAt: string;
  endedAt?: string;
}

export interface SystemHealthComponent {
  id: string;
  name: string;
  category: 'core' | 'database' | 'payments' | 'shipping' | 'tax' | 'infrastructure';
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  uptimePercentage: number;
  lastCheckedAt: string;
  message?: string;
}

export interface PlatformFeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'percentage' | 'targeting';
  status: 'enabled' | 'disabled';
  defaultValue: boolean;
  rolloutPercentage?: number;
  targetPlans?: string[];
  targetTenants?: string[];
  updatedAt: string;
}

export interface PlatformJobRecord {
  id: string;
  jobType: string;
  tenantId?: string;
  tenantName?: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'retrying' | 'dead_letter';
  attempt: number;
  maxAttempts: number;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  errorMessage?: string;
}

export interface PlatformAuditRecord {
  id: string;
  actorId: string;
  actorName: string;
  actorType: 'platform_admin' | 'system_job' | 'support_agent';
  tenantId?: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  ipAddress: string;
  createdAt: string;
}

export interface SupportCase {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityEventRecord {
  id: string;
  eventType: 'login_success' | 'login_failed' | 'mfa_challenged' | 'session_revoked' | 'impersonation_started' | 'secret_rotated' | 'rate_limit_exceeded';
  severity: 'info' | 'warning' | 'critical';
  actorEmail: string;
  ipAddress: string;
  userAgent?: string;
  details: string;
  createdAt: string;
}
