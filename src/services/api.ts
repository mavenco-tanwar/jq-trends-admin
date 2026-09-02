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

export function getTenantStorefrontUrl(tenantSlug: string = 'jqtrends', subPath: string = ''): string {
  const base = getStorefrontBaseUrl();
  const cleanPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  return `${base}/stores/${tenantSlug}${cleanPath}`;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'store_jq_trends';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
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
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();
    let currentTenantSlug = 'lumina';
    try {
      const storedTenantId = localStorage.getItem('jq_saas_active_tenant_id') || '';
      if (storedTenantId) {
        currentTenantSlug = storedTenantId.startsWith('store_') ? storedTenantId.replace('store_', '') : storedTenantId;
      }
    } catch {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Store-ID': STORE_ID,
      'X-API-Key': 'sk_live_master_admin_key_9921',
      'x-tenant-slug': currentTenantSlug,
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
