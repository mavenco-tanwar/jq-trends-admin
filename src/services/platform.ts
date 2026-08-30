import { ApiClient } from './api';

export interface TenantPlan {
  id: string;
  name: string;
  code: 'starter' | 'pro' | 'enterprise';
  priceMonthlyInr: number;
  priceMonthlyUsd: number;
  maxProducts: number;
  maxOrdersMonthly: number;
  maxStorageMb: number;
  maxStaff: number;
  features: {
    customDomains: boolean;
    advancedAnalytics: boolean;
    richCms: boolean;
    productReviews: boolean;
    abandonedCart: boolean;
    aiFeatures: boolean;
    apiAccess: boolean;
  };
}

export interface TenantDomain {
  id: string;
  domain: string;
  type: 'subdomain' | 'custom';
  isPrimary: boolean;
  status: 'connected' | 'verifying' | 'pending' | 'failed';
  sslActive: boolean;
  createdAt: string;
}

export interface TenantStore {
  id: string;
  name: string;
  slug: string;
  code: string;
  tagline: string;
  status: 'active' | 'trial' | 'suspended' | 'provisioning' | 'archived';
  planId: string;
  planName: string;
  databaseName: string;
  currency: string;
  ownerEmail: string;
  ownerName: string;
  primaryDomain: string;
  domains: TenantDomain[];
  theme: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
  metrics: {
    products: number;
    orders: number;
    customers: number;
    monthlyRevenue: number;
    storageUsedMb: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlatformActivityLog {
  id: string;
  event: string;
  actor: string;
  tenantId?: string;
  tenantName?: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  mrrInr: number;
  mrrUsd: number;
  totalProducts: number;
  totalOrders: number;
  totalPlatformSalesInr: number;
  totalPlatformSalesUsd: number;
  systemHealth: {
    status: 'healthy' | 'degraded' | 'maintenance';
    uptimePercentage: number;
    apiLatencyMs: number;
    dbClusterStatus: string;
  };
}

export const INITIAL_PLANS: TenantPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Boutique',
    code: 'starter',
    priceMonthlyInr: 2499,
    priceMonthlyUsd: 29,
    maxProducts: 250,
    maxOrdersMonthly: 1000,
    maxStorageMb: 2048,
    maxStaff: 3,
    features: {
      customDomains: true,
      advancedAnalytics: false,
      richCms: true,
      productReviews: true,
      abandonedCart: false,
      aiFeatures: false,
      apiAccess: false,
    },
  },
  {
    id: 'plan_pro',
    name: 'Professional Scale',
    code: 'pro',
    priceMonthlyInr: 6499,
    priceMonthlyUsd: 79,
    maxProducts: 2500,
    maxOrdersMonthly: 10000,
    maxStorageMb: 10240,
    maxStaff: 15,
    features: {
      customDomains: true,
      advancedAnalytics: true,
      richCms: true,
      productReviews: true,
      abandonedCart: true,
      aiFeatures: true,
      apiAccess: true,
    },
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Global',
    code: 'enterprise',
    priceMonthlyInr: 19999,
    priceMonthlyUsd: 249,
    maxProducts: 50000,
    maxOrdersMonthly: 250000,
    maxStorageMb: 102400,
    maxStaff: 100,
    features: {
      customDomains: true,
      advancedAnalytics: true,
      richCms: true,
      productReviews: true,
      abandonedCart: true,
      aiFeatures: true,
      apiAccess: true,
    },
  },
];

export const INITIAL_TENANTS: TenantStore[] = [
  {
    id: 'store_demo',
    name: 'Demo Store',
    slug: 'demo',
    code: 'DEMO',
    tagline: 'Curated Modern Lifestyle & Apparel',
    status: 'active',
    planId: 'plan_pro',
    planName: 'Professional Scale',
    databaseName: 'tenant_demo',
    currency: 'USD',
    ownerEmail: 'demo@mavenco.com',
    ownerName: 'Mavenco Client Demo',
    primaryDomain: 'demo.mavenco.com',
    domains: [
      { id: 'dom_demo_1', domain: 'demo.mavenco.com', type: 'custom', isPrimary: true, status: 'connected', sslActive: true, createdAt: '2026-08-01T00:00:00Z' },
    ],
    theme: {
      logoUrl: '',
      primaryColor: '#0F172A',
      secondaryColor: '#F8FAFC',
      accentColor: '#6366F1',
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      borderRadius: 'md',
    },
    metrics: {
      products: 36,
      orders: 412,
      customers: 320,
      monthlyRevenue: 28400,
      storageUsedMb: 128,
    },
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-30T12:00:00Z',
  },
  {
    id: 'store_lumina_atelier',
    name: 'Lumina Atelier',
    slug: 'lumina',
    code: 'LUM',
    tagline: 'Contemporary Artisanal Lighting & Objects',
    status: 'trial',
    planId: 'plan_starter',
    planName: 'Starter Boutique (14-Day Trial)',
    databaseName: 'tenant_lumina',
    currency: 'USD',
    ownerEmail: 'sophia@luminaatelier.com',
    ownerName: 'Sophia Laurent',
    primaryDomain: 'luminaatelier.com',
    domains: [
      { id: 'dom_lum_1', domain: 'luminaatelier.com', type: 'custom', isPrimary: true, status: 'connected', sslActive: true, createdAt: '2026-08-20T00:00:00Z' },
      { id: 'dom_lum_2', domain: 'lumina.ourplatform.com', type: 'subdomain', isPrimary: false, status: 'connected', sslActive: true, createdAt: '2026-08-20T00:00:00Z' },
    ],
    theme: {
      logoUrl: '',
      primaryColor: '#1E1B4B',
      secondaryColor: '#FFFDF9',
      accentColor: '#F59E0B',
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      borderRadius: 'md',
    },
    metrics: {
      products: 16,
      orders: 48,
      customers: 39,
      monthlyRevenue: 34200,
      storageUsedMb: 42,
    },
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'store_aura_living',
    name: 'Aura Living',
    slug: 'auraliving',
    code: 'AURA',
    tagline: 'Minimalist Scandinavian Home Decor & Lifestyle',
    status: 'active',
    planId: 'plan_starter',
    planName: 'Starter Boutique',
    databaseName: 'tenant_auraliving',
    currency: 'USD',
    ownerEmail: 'elena@auraliving.com',
    ownerName: 'Elena Rostova',
    primaryDomain: 'auraliving.com',
    domains: [
      { id: 'dom_3', domain: 'auraliving.com', type: 'custom', isPrimary: true, status: 'connected', sslActive: true, createdAt: '2026-03-15T00:00:00Z' },
      { id: 'dom_4', domain: 'auraliving.ourplatform.com', type: 'subdomain', isPrimary: false, status: 'connected', sslActive: true, createdAt: '2026-03-15T00:00:00Z' },
    ],
    theme: {
      logoUrl: '',
      primaryColor: '#1B4332',
      secondaryColor: '#FAF3E0',
      accentColor: '#74C69D',
      headingFont: 'Cinzel',
      bodyFont: 'Inter',
      borderRadius: 'md',
    },
    metrics: {
      products: 48,
      orders: 198,
      customers: 172,
      monthlyRevenue: 14200,
      storageUsedMb: 92,
    },
    createdAt: '2026-03-15T12:00:00Z',
    updatedAt: '2026-08-28T14:30:00Z',
  },
  {
    id: 'store_apex_athletics',
    name: 'Apex Athletics',
    slug: 'apexathletics',
    code: 'APEX',
    tagline: 'High-Performance Activewear & Compression Gear',
    status: 'active',
    planId: 'plan_enterprise',
    planName: 'Enterprise Global',
    databaseName: 'tenant_apexathletics',
    currency: 'USD',
    ownerEmail: 'marcus@apexathletics.com',
    ownerName: 'Marcus Vance',
    primaryDomain: 'apexathletics.com',
    domains: [
      { id: 'dom_5', domain: 'apexathletics.com', type: 'custom', isPrimary: true, status: 'connected', sslActive: true, createdAt: '2026-05-01T00:00:00Z' },
      { id: 'dom_6', domain: 'apexathletics.ourplatform.com', type: 'subdomain', isPrimary: false, status: 'connected', sslActive: true, createdAt: '2026-05-01T00:00:00Z' },
    ],
    theme: {
      logoUrl: '',
      primaryColor: '#0A0A0A',
      secondaryColor: '#161822',
      accentColor: '#00F5D4',
      headingFont: 'Montserrat',
      bodyFont: 'Inter',
      borderRadius: 'lg',
    },
    metrics: {
      products: 112,
      orders: 890,
      customers: 750,
      monthlyRevenue: 78900,
      storageUsedMb: 420,
    },
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-08-29T16:00:00Z',
  },
];

export const INITIAL_ACTIVITY_LOGS: PlatformActivityLog[] = [
  { id: 'act_1', event: 'Superadmin provisioned new tenant Apex Athletics', actor: 'superadmin@platform.com', tenantId: 'store_apex_athletics', tenantName: 'Apex Athletics', ipAddress: '103.21.244.12', severity: 'info', timestamp: '10m ago' },
  { id: 'act_2', event: 'Custom domain apexathletics.com SSL auto-renewed', actor: 'System SSL Daemon', tenantId: 'store_apex_athletics', tenantName: 'Apex Athletics', ipAddress: '127.0.0.1', severity: 'info', timestamp: '1h ago' },
  { id: 'act_3', event: 'Aura Living upgraded to Starter Boutique Plan', actor: 'elena@auraliving.com', tenantId: 'store_aura_living', tenantName: 'Aura Living', ipAddress: '49.207.198.54', severity: 'info', timestamp: '4h ago' },
  { id: 'act_4', event: 'Superadmin impersonated JQ Trends for technical audit', actor: 'superadmin@platform.com', tenantId: 'store_jq_trends', tenantName: 'JQ Trends', ipAddress: '103.21.244.12', severity: 'warning', timestamp: '1d ago' },
  { id: 'act_5', event: 'Database migration tenant_jqtrends upgraded to Schema v2', actor: 'Platform DB Engine', tenantId: 'store_jq_trends', tenantName: 'JQ Trends', ipAddress: '127.0.0.1', severity: 'info', timestamp: '2d ago' },
];

const PLATFORM_STORAGE_KEY = 'jq_saas_platform_tenants_v1';
const CURRENT_STORE_KEY = 'jq_saas_active_tenant_id';
const IMPERSONATION_KEY = 'jq_saas_impersonation_state';

export class PlatformService {
  private static tenants: TenantStore[] = this.loadTenants();
  private static plans: TenantPlan[] = INITIAL_PLANS;
  private static activities: PlatformActivityLog[] = INITIAL_ACTIVITY_LOGS;

  private static loadTenants(): TenantStore[] {
    if (typeof window === 'undefined') return INITIAL_TENANTS;
    try {
      const stored = localStorage.getItem(PLATFORM_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TENANTS;
  }

  private static saveTenants(list: TenantStore[]) {
    this.tenants = list;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(list));
      } catch {}
    }
  }

  public static updateTenant(tenantId: string, updates: Partial<TenantStore>): TenantStore | null {
    const list = this.loadTenants();
    const idx = list.findIndex((t) => t.id === tenantId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      theme: {
        ...list[idx].theme,
        ...(updates.theme || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    this.saveTenants(list);
    return list[idx];
  }

  public static getAllTenants(): TenantStore[] {
    return this.loadTenants();
  }

  // Active Store Context (Tenant Switcher)
  public static getActiveTenantId(): string {
    if (typeof window === 'undefined') return 'store_jq_trends';

    // 1. Check URL path for /stores/[slug] or /tenant/[slug]
    const pathMatch = window.location.pathname.match(/^\/(stores|tenant)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) {
      const slug = pathMatch[2].toLowerCase();
      const match = this.tenants.find((t) => t.slug.toLowerCase() === slug || t.id.toLowerCase() === slug);
      if (match) {
        localStorage.setItem(CURRENT_STORE_KEY, match.id);
        return match.id;
      }
    }

    // 2. Check search params ?tenant=[slug]
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    if (tenantParam) {
      const match = this.tenants.find(
        (t) => t.slug.toLowerCase() === tenantParam.toLowerCase() || t.id.toLowerCase() === tenantParam.toLowerCase()
      );
      if (match) {
        localStorage.setItem(CURRENT_STORE_KEY, match.id);
        return match.id;
      }
    }

    return localStorage.getItem(CURRENT_STORE_KEY) || 'store_jq_trends';
  }

  public static setActiveTenantId(tenantId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_STORE_KEY, tenantId);
    }
  }

  public static getActiveTenant(): TenantStore {
    const activeId = this.getActiveTenantId();
    return this.tenants.find((t) => t.id === activeId) || this.tenants[0] || INITIAL_TENANTS[0];
  }

  // Impersonation Support
  public static getImpersonationState(): { isImpersonating: boolean; tenant?: TenantStore } {
    if (typeof window === 'undefined') return { isImpersonating: false };
    try {
      const raw = localStorage.getItem(IMPERSONATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { isImpersonating: true, tenant: parsed };
      }
    } catch {}
    return { isImpersonating: false };
  }

  public static startImpersonation(tenant: TenantStore): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(tenant));
      this.setActiveTenantId(tenant.id);
      this.logActivity({
        id: `act_${Date.now()}`,
        event: `Superadmin started impersonation session for ${tenant.name}`,
        actor: 'superadmin@platform.com',
        tenantId: tenant.id,
        tenantName: tenant.name,
        ipAddress: '127.0.0.1',
        severity: 'warning',
        timestamp: 'Just now',
      });
    }
  }

  public static stopImpersonation(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(IMPERSONATION_KEY);
    }
  }

  // Platform Metrics
  public static async getMetrics(): Promise<PlatformMetrics> {
    const list = await this.listTenants();
    const active = list.filter((t) => t.status === 'active').length;
    const trial = list.filter((t) => t.status === 'trial').length;
    const suspended = list.filter((t) => t.status === 'suspended').length;
    const mrrInr = list.reduce((acc, t) => {
      const plan = this.plans.find((p) => p.id === t.planId);
      return acc + (plan ? (plan.priceMonthlyInr || 6499) : 6499);
    }, 0);
    const mrrUsd = list.reduce((acc, t) => {
      const plan = this.plans.find((p) => p.id === t.planId);
      return acc + (plan ? plan.priceMonthlyUsd : 79);
    }, 0);
    const products = list.reduce((acc, t) => acc + (t.metrics?.products || 0), 0);
    const orders = list.reduce((acc, t) => acc + (t.metrics?.orders || 0), 0);
    const totalPlatformSalesInr = list.reduce((acc, t) => acc + (t.metrics?.monthlyRevenue || 0), 0);

    return {
      totalTenants: list.length,
      activeTenants: active,
      trialTenants: trial,
      suspendedTenants: suspended,
      mrrInr,
      mrrUsd,
      totalProducts: products,
      totalOrders: orders,
      totalPlatformSalesInr: totalPlatformSalesInr || 1245000,
      totalPlatformSalesUsd: 579000,
      systemHealth: {
        status: 'healthy',
        uptimePercentage: 99.98,
        apiLatencyMs: 24,
        dbClusterStatus: 'MongoDB Atlas Multi-Region Cluster (Active & Synchronized)',
      },
    };
  }

  public static async listTenants(): Promise<TenantStore[]> {
    try {
      const res = await fetch('/api/v1/platform/tenants').then((r) => (r.ok ? r.json() : null));
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const dbTenants: TenantStore[] = res.data.map((t: any) => ({
          id: t.id || `store_${t.slug}`,
          name: t.name,
          slug: t.slug,
          code: t.code || t.name.substring(0, 4).toUpperCase(),
          tagline: t.tagline || 'Modern Commerce Store',
          status: t.status || 'active',
          planId: t.planId || 'plan_starter',
          planName: t.planName || 'Starter Boutique',
          databaseName: t.databaseName || `tenant_${t.slug}`,
          currency: t.currency || 'USD',
          ownerEmail: t.ownerEmail || t.contact?.email || 'owner@platform.com',
          ownerName: t.ownerName || 'Store Owner',
          primaryDomain: t.primaryDomain || `${t.slug}.com`,
          domains: t.domains || [
            {
              id: `dom_${t.slug}`,
              domain: `${t.slug}.com`,
              type: 'custom',
              isPrimary: true,
              status: 'connected',
              sslActive: true,
              createdAt: t.createdAt || new Date().toISOString(),
            },
          ],
          theme: {
            logoUrl: t.theme?.logoUrl || '',
            primaryColor: t.theme?.primaryColor || '#111111',
            secondaryColor: t.theme?.secondaryColor || '#FFFFFF',
            accentColor: t.theme?.accentColor || '#E11D48',
            headingFont: t.theme?.headingFont || 'Playfair Display',
            bodyFont: t.theme?.bodyFont || 'Plus Jakarta Sans',
            borderRadius: t.theme?.borderRadius || 'md',
          },
          metrics: t.metrics || {
            products: 16,
            orders: 24,
            customers: 19,
            monthlyRevenue: 12400,
            storageUsedMb: 28,
          },
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
        }));
        this.saveTenants(dbTenants);
        return dbTenants;
      }
    } catch (err) {
      console.error('Failed to fetch platform tenants from DB:', err);
    }
    return this.loadTenants();
  }

  public static async getTenantById(id: string): Promise<TenantStore | null> {
    const list = await this.listTenants();
    return list.find((t) => t.id === id || t.slug === id) || null;
  }

  // 5-Step Store Provisioning Engine
  public static async provisionStore(payload: {
    name: string;
    slug: string;
    tagline: string;
    ownerName: string;
    ownerEmail: string;
    currency: string;
    planId: string;
    status?: TenantStore['status'];
    primaryColor?: string;
    accentColor?: string;
    subdomain?: string;
    customDomain?: string;
  }): Promise<TenantStore> {
    const tenantId = `store_${payload.slug.replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const plan = this.plans.find((p) => p.id === payload.planId) || this.plans[1];

    const domains: TenantDomain[] = [
      {
        id: `dom_${Date.now()}_1`,
        domain: `${payload.slug}.ourplatform.com`,
        type: 'subdomain',
        isPrimary: !payload.customDomain,
        status: 'connected',
        sslActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    if (payload.customDomain) {
      domains.push({
        id: `dom_${Date.now()}_2`,
        domain: payload.customDomain.replace(/^https?:\/\//, ''),
        type: 'custom',
        isPrimary: true,
        status: 'verifying',
        sslActive: false,
        createdAt: new Date().toISOString(),
      });
    }

    const newStore: TenantStore = {
      id: tenantId,
      name: payload.name,
      slug: payload.slug.toLowerCase().trim(),
      code: payload.name.substring(0, 3).toUpperCase(),
      tagline: payload.tagline || 'Modern Commerce Store',
      status: payload.status || 'active',
      planId: plan.id,
      planName: plan.name,
      databaseName: `tenant_${payload.slug.toLowerCase()}`,
      currency: payload.currency || 'USD',
      ownerEmail: payload.ownerEmail,
      ownerName: payload.ownerName,
      primaryDomain: payload.customDomain || `${payload.slug}.ourplatform.com`,
      domains,
      theme: {
        logoUrl: '',
        primaryColor: payload.primaryColor || '#111111',
        secondaryColor: '#FFFFFF',
        accentColor: payload.accentColor || '#E11D48',
        headingFont: 'Playfair Display',
        bodyFont: 'Plus Jakarta Sans',
        borderRadius: 'md',
      },
      metrics: {
        products: 4,
        orders: 0,
        customers: 0,
        monthlyRevenue: 0,
        storageUsedMb: 12,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.loadTenants();
    const updated = [newStore, ...current];
    this.saveTenants(updated);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `New tenant store ${newStore.name} provisioned with database ${newStore.databaseName}`,
      actor: payload.ownerEmail,
      tenantId: newStore.id,
      tenantName: newStore.name,
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
    });

    try {
      await ApiClient.post('/api/v1/platform/tenants', newStore);
    } catch {}

    // Real-time sync with storefront API
    try {
      fetch(`https://mavenco-storefront.vercel.app/api/v1/tenant-config?tenant=${newStore.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStore.name,
          slug: newStore.slug,
          tagline: newStore.tagline,
          currency: newStore.currency,
          theme: newStore.theme,
        }),
      }).catch(() => {});
    } catch {}

    return newStore;
  }

  public static async updateTenantStatus(id: string, status: TenantStore['status']): Promise<void> {
    const list = this.loadTenants();
    const updated = list.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    this.saveTenants(updated);

    const tenant = list.find((t) => t.id === id);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Tenant ${tenant?.name || id} status changed to ${status.toUpperCase()}`,
      actor: 'superadmin@platform.com',
      tenantId: id,
      ipAddress: '127.0.0.1',
      severity: status === 'suspended' ? 'critical' : 'info',
      timestamp: 'Just now',
    });

    try {
      await ApiClient.patch(`/api/v1/platform/tenants`, { id, slug: tenant?.slug, status });
    } catch {}

    // Real-time sync with storefront API
    if (tenant?.slug) {
      try {
        await fetch(`https://mavenco-storefront.vercel.app/api/v1/tenant-config?tenant=${tenant.slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } catch {}
    }
  }

  public static async updateTenantPlan(id: string, planId: string): Promise<void> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return;

    const list = this.loadTenants();
    const updated = list.map((t) =>
      t.id === id ? { ...t, planId: plan.id, planName: plan.name, updatedAt: new Date().toISOString() } : t
    );
    this.saveTenants(updated);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Tenant ${id} plan changed to ${plan.name}`,
      actor: 'superadmin@platform.com',
      tenantId: id,
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
    });
  }

  public static async updateTenantDetails(
    id: string,
    updates: Partial<Pick<TenantStore, 'name' | 'slug' | 'tagline' | 'currency' | 'ownerEmail' | 'ownerName' | 'planId' | 'status' | 'theme'>>
  ): Promise<TenantStore | null> {
    const list = this.loadTenants();
    const plan = updates.planId ? this.plans.find((p) => p.id === updates.planId) : null;

    let updatedStore: TenantStore | null = null;
    const updated = list.map((t) => {
      if (t.id === id || t.slug === id) {
        updatedStore = {
          ...t,
          ...updates,
          planName: plan ? plan.name : t.planName,
          theme: updates.theme ? { ...t.theme, ...updates.theme } : t.theme,
          updatedAt: new Date().toISOString(),
        };
        return updatedStore;
      }
      return t;
    });

    if (updatedStore) {
      this.saveTenants(updated);
      this.logActivity({
        id: `act_${Date.now()}`,
        event: `Tenant ${(updatedStore as TenantStore).name} configuration updated by Superadmin`,
        actor: 'superadmin@mavenco.com',
        tenantId: id,
        tenantName: (updatedStore as TenantStore).name,
        ipAddress: '127.0.0.1',
        severity: 'info',
        timestamp: 'Just now',
      });

      // Real-time sync with storefront API
      try {
        fetch(`https://mavenco-storefront.vercel.app/api/v1/tenant-config?tenant=${(updatedStore as TenantStore).slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: (updatedStore as TenantStore).name,
            tagline: (updatedStore as TenantStore).tagline,
            currency: (updatedStore as TenantStore).currency,
            theme: (updatedStore as TenantStore).theme,
          }),
        }).catch(() => {});
      } catch {}
    }

    return updatedStore;
  }

  public static async deleteTenant(id: string): Promise<boolean> {
    const list = this.loadTenants();
    const tenant = list.find((t) => t.id === id || t.slug === id);
    if (!tenant) return false;

    const filtered = list.filter((t) => t.id !== id && t.slug !== id);
    this.saveTenants(filtered);

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Tenant ${tenant.name} (${tenant.databaseName}) was deleted/archived by Superadmin`,
      actor: 'superadmin@mavenco.com',
      tenantId: id,
      tenantName: tenant.name,
      ipAddress: '127.0.0.1',
      severity: 'critical',
      timestamp: 'Just now',
    });

    // Real-time sync with storefront API to archive and invalidate storefront route
    try {
      fetch(`https://mavenco-storefront.vercel.app/api/v1/tenant-config?tenant=${tenant.slug}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    return true;
  }

  public static async updatePlanFeatures(
    planId: string,
    features: Partial<TenantPlan['features']>
  ): Promise<void> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return;

    plan.features = { ...plan.features, ...features };

    this.logActivity({
      id: `act_${Date.now()}`,
      event: `Plan ${plan.name} features updated by Superadmin`,
      actor: 'superadmin@mavenco.com',
      tenantId: 'platform',
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
    });
  }

  public static async listPlans(): Promise<TenantPlan[]> {
    return this.plans;
  }

  public static async listActivityLogs(): Promise<PlatformActivityLog[]> {
    return this.activities;
  }

  private static logActivity(log: PlatformActivityLog) {
    this.activities = [log, ...this.activities];
  }
}
