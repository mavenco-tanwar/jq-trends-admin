export function getApiBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_CMS_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  if (!raw || raw.includes('jq-trends.vercel.app')) {
    raw =
      typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.protocol === 'https:')
        ? 'https://mavenco-storefront.vercel.app'
        : 'http://localhost:3000';
  }

  raw = raw.trim().replace(/\/+$/, '');
  if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw;
}

export function getStorefrontBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_STOREFRONT_URL || '';
  if (!raw || raw.includes('jq-trends.vercel.app')) {
    raw =
      typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.protocol === 'https:')
        ? 'https://mavenco-storefront.vercel.app'
        : 'http://localhost:3000';
  }
  raw = raw.trim().replace(/\/+$/, '');
  if (raw && !raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  return raw;
}

export function getTenantStorefrontUrl(tenantSlug?: string, subPath: string = ''): string {
  const base = getStorefrontBaseUrl();
  let cleanSlug = (tenantSlug || '').trim().toLowerCase();

  // If missing, generic placeholder, or stale mock lumina, retrieve from logged-in user
  if (!cleanSlug || cleanSlug === 'demo' || cleanSlug === 'store_demo' || cleanSlug === 'all' || cleanSlug === 'jqtrends' || cleanSlug === 'lumina' || cleanSlug === 'store_lumina') {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('jq_admin_user');
        if (raw) {
          const u = JSON.parse(raw);
          const isSuper =
            u.role === 'superadmin' ||
            u.roleId === 'role_superadmin' ||
            (u.email && (u.email.toLowerCase().includes('superadmin') || u.email.toLowerCase() === 'admin@mavenco.com'));
          if (!isSuper && u.tenantSlug && u.tenantSlug !== 'all' && u.tenantSlug !== 'lumina') {
            cleanSlug = u.tenantSlug.toLowerCase().trim();
          } else if (!isSuper && u.storeSlug && u.storeSlug !== 'all' && u.storeSlug !== 'lumina') {
            cleanSlug = u.storeSlug.toLowerCase().trim();
          }
        }
      } catch {}
    }
  }

  if (!cleanSlug || cleanSlug === 'demo' || cleanSlug === 'store_demo' || cleanSlug === 'all' || cleanSlug === 'jqtrends' || cleanSlug === 'lumina' || cleanSlug === 'store_lumina') {
    cleanSlug = 'jq-trends';
  }

  const cleanPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  return `${base}/stores/${cleanSlug}${cleanPath}`;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'store_jq_trends';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  message?: string;
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('jq_admin_token') || 'demo_jwt_token_jq_trends';
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = getApiBaseUrl();
    let currentTenantSlug = '';
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const qTenant = urlParams.get('tenant');
        if (qTenant && qTenant !== 'all' && qTenant !== 'lumina') {
          currentTenantSlug = qTenant.replace(/^store_/, '').trim().toLowerCase();
        }
        if (!currentTenantSlug) {
          const storedTenantId = localStorage.getItem('jq_saas_active_tenant_id');
          const storedTenantSlug = localStorage.getItem('jq_saas_active_tenant_slug');
          const effective = storedTenantId || storedTenantSlug || '';
          if (effective && effective !== 'all' && effective !== 'lumina') {
            currentTenantSlug = effective.replace(/^store_/, '').trim().toLowerCase();
            localStorage.setItem('jq_saas_active_tenant_slug', currentTenantSlug);
          }
        }
        if (!currentTenantSlug) {
          const userRaw = localStorage.getItem('jq_admin_user');
          if (userRaw) {
            const u = JSON.parse(userRaw);
            if (u.tenantSlug && u.tenantSlug !== 'all') {
              currentTenantSlug = u.tenantSlug.replace(/^store_/, '').trim().toLowerCase();
            } else if (u.tenantId) {
              currentTenantSlug = u.tenantId.replace(/^store_/, '').trim().toLowerCase();
            }
          }
        }
      }
    } catch {}

    if (!currentTenantSlug || currentTenantSlug === 'all') {
      currentTenantSlug = 'jq-trends';
    }

    // Explicitly append tenant query param if not already present
    let finalEndpoint = endpoint;
    if (!finalEndpoint.includes('tenant=') && currentTenantSlug) {
      const sep = finalEndpoint.includes('?') ? '&' : '?';
      finalEndpoint = `${finalEndpoint}${sep}tenant=${encodeURIComponent(currentTenantSlug)}`;
    }

    const url = `${baseUrl}${finalEndpoint.startsWith('/') ? finalEndpoint : `/${finalEndpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Store-ID': `store_${currentTenantSlug}`,
      'x-tenant-slug': currentTenantSlug,
      'X-API-Key': 'sk_live_master_admin_key_9921',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status} Error`);
      }

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`[API Client fallback] API error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  public static get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
