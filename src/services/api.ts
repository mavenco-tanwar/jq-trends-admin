const API_BASE_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://jq-trends.vercel.app'
    : 'http://localhost:4000');
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
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Store-ID': STORE_ID,
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
