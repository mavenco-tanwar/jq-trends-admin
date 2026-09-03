import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformService, INITIAL_PLANS } from '@/services/platform';
import { mockTenantsFixture, mockPlansFixture } from '../../fixtures/tenants.fixture';
import { ApiClient } from '@/services/api';

vi.mock('@/services/api');

describe('PlatformService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Plans Management', () => {
    it('should list all initial SaaS plans when storage is empty', async () => {
      const plans = await PlatformService.listPlans();
      expect(plans.length).toBe(3);
      expect(plans.map((p) => p.code)).toEqual(['starter', 'pro', 'enterprise']);
    });

    it('should retrieve a specific plan and verify pricing & limits', async () => {
      const plans = await PlatformService.listPlans();
      const starter = plans.find((p) => p.code === 'starter');
      const enterprise = plans.find((p) => p.code === 'enterprise');

      expect(starter).toBeDefined();
      expect(starter?.maxProducts).toBe(250);
      expect(starter?.features.advancedAnalytics).toBe(false);

      expect(enterprise).toBeDefined();
      expect(enterprise?.maxProducts).toBe(50000);
      expect(enterprise?.features.advancedAnalytics).toBe(true);
    });

    it('should allow updating plan feature flags', async () => {
      await PlatformService.updatePlanFeatures('plan_starter', {
        aiFeatures: true,
        apiAccess: true,
      });

      const plans = await PlatformService.listPlans();
      const updatedStarter = plans.find((p) => p.id === 'plan_starter');
      expect(updatedStarter?.features.aiFeatures).toBe(true);
      expect(updatedStarter?.features.apiAccess).toBe(true);
    });
  });

  describe('Tenant Lifecycle & Switching', () => {
    it('should return fallback active tenant when no tenant is set', () => {
      const activeTenant = PlatformService.getActiveTenant();
      expect(activeTenant).toBeDefined();
      expect(activeTenant.id).toBeDefined();
    });

    it('should set and get active tenant id from localStorage', () => {
      PlatformService.setActiveTenantId('store_auraliving');
      expect(PlatformService.getActiveTenantId()).toBe('store_auraliving');
    });

    it('should support impersonation flow and restore previous state', () => {
      const targetTenant = mockTenantsFixture[1]; // Aura Living
      expect(PlatformService.getImpersonationState().isImpersonating).toBe(false);

      PlatformService.startImpersonation(targetTenant);
      const state = PlatformService.getImpersonationState();
      expect(state.isImpersonating).toBe(true);
      expect(state.tenant?.slug).toBe('auraliving');

      PlatformService.stopImpersonation();
      expect(PlatformService.getImpersonationState().isImpersonating).toBe(false);
    });

    it('should update tenant details and maintain theme consistency', () => {
      // Seed a tenant first
      localStorage.setItem('jq_saas_platform_tenants_v1', JSON.stringify([mockTenantsFixture[0]]));

      const updated = PlatformService.updateTenant('store_jqtrends', {
        tagline: 'Updated luxury statement tagline',
        theme: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#gold',
          headingFont: 'Playfair',
          bodyFont: 'Inter',
          borderRadius: 'full',
        },
      });

      expect(updated).not.toBeNull();
      expect(updated?.tagline).toBe('Updated luxury statement tagline');
      expect(updated?.theme.primaryColor).toBe('#000000');
    });
  });

  describe('Activity Logging & Telemetry', () => {
    it('should log platform activity and prepend to history', async () => {
      await PlatformService.logActivity({
        event: 'Provisioned test merchant store',
        actor: 'superadmin@platform.com',
        severity: 'info',
        ipAddress: '127.0.0.1',
      });

      const logs = await PlatformService.listActivityLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].event).toBe('Provisioned test merchant store');
      expect(logs[0].actor).toBe('superadmin@platform.com');
    });
  });

  describe('Platform Metrics Calculation', () => {
    it('should compute real-time MRR, tenant status breakdown and totals', async () => {
      // Seed 3 tenants
      localStorage.setItem('jq_saas_platform_tenants_v1', JSON.stringify(mockTenantsFixture));

      const metrics = await PlatformService.getMetrics();
      expect(metrics.totalTenants).toBe(3);
      expect(metrics.activeTenants).toBe(2);
      expect(metrics.trialTenants).toBe(1);
      expect(metrics.suspendedTenants).toBe(0);
      expect(metrics.mrrInr).toBeGreaterThan(0);
      expect(metrics.totalProducts).toBeGreaterThan(0);
    });
  });
});
