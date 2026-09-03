import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformService } from '@/services/platform';
import { ApiClient } from '@/services/api';

vi.mock('@/services/api');

describe('Tenant Store Provisioning End-to-End Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provision a new multi-tenant merchant store with isolated database, theme, and admin account', async () => {
    // 1. Fetch available plans
    const plans = await PlatformService.listPlans();
    const selectedPlan = plans.find((p) => p.code === 'pro')!;
    expect(selectedPlan).toBeDefined();
    expect(selectedPlan.code).toBe('pro');

    // 2. Mock API call to /api/v1/platform/tenants
    vi.mocked(ApiClient.post).mockResolvedValue({
      data: { success: true },
    });

    // 3. Provision new store
    const provisionPayload = {
      name: 'Artisan Home Nordic',
      slug: 'artisannordic',
      planId: selectedPlan.id,
      currency: 'EUR',
      ownerName: 'Freja Larsen',
      ownerEmail: 'freja@artisannordic.com',
      tagline: 'Hand-blown glass and sustainable Nordic furniture',
      primaryColor: '#2b2d42',
      accentColor: '#d90429',
    };

    const provisionedTenant = await PlatformService.provisionStore(provisionPayload);

    // 4. Validate provisioned tenant structure
    expect(provisionedTenant).toBeDefined();
    expect(provisionedTenant.id).toContain('store_');
    expect(provisionedTenant.slug).toBe('artisannordic');
    expect(provisionedTenant.databaseName).toBe('tenant_artisannordic');
    expect(provisionedTenant.status).toBe('active');
    expect(provisionedTenant.theme.primaryColor).toBe('#2b2d42');
    expect(provisionedTenant.primaryDomain).toBe('artisannordic.ourplatform.com');

    // 5. Verify tenant appears in platform list
    const allTenants = await PlatformService.listTenants();
    const found = allTenants.find((t) => t.slug === 'artisannordic');
    expect(found).toBeDefined();

    // 6. Verify tenant switcher activates the new store
    PlatformService.setActiveTenantId(provisionedTenant.id);
    expect(PlatformService.getActiveTenantId()).toBe(provisionedTenant.id);
    const active = PlatformService.getActiveTenant();
    expect(active.slug).toBe('artisannordic');
    expect(active.name).toBe('Artisan Home Nordic');

    // 7. Verify activity log is recorded
    await PlatformService.logActivity({
      event: `Superadmin provisioned store: ${provisionedTenant.name}`,
      actor: 'superadmin@platform.com',
      severity: 'info',
    });

    const logs = await PlatformService.listActivityLogs();
    const provisionLog = logs.find((l) => l.event.includes('Superadmin provisioned store: Artisan Home Nordic'));
    expect(provisionLog).toBeDefined();
    expect(provisionLog?.severity).toBe('info');
  });
});
