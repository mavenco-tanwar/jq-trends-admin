import { INITIAL_USERS } from '@/lib/mock-data';
import type { AdminUser } from '@/types';

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export class AuthService {
  static async login(email: string, pass: string): Promise<LoginResponse> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(data.error || 'Invalid credentials. Please verify your email and password.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('jq_admin_token', data.token);
      localStorage.setItem('jq_admin_user', JSON.stringify(data.user));
      const storeSlug = data.user.tenantSlug || (data.user as any).storeSlug;
      if (storeSlug && storeSlug !== 'all' && storeSlug !== 'lumina') {
        localStorage.setItem('jq_saas_active_tenant_id', data.user.tenantId || `store_${storeSlug}`);
      }
    }

    return {
      token: data.token,
      user: data.user,
    };
  }

  static async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jq_admin_token');
      localStorage.removeItem('jq_admin_user');
      localStorage.removeItem('jq_saas_impersonation_state');
    }
  }

  static getCurrentUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('jq_admin_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('jq_admin_token');
  }
}
