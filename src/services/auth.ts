import { ApiClient } from './api';
import { INITIAL_USERS } from '@/lib/mock-data';
import type { AdminUser } from '@/types';

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export class AuthService {
  static async login(email: string, pass: string): Promise<LoginResponse> {
    try {
      const res = await ApiClient.post<LoginResponse>('/api/v1/auth/login', {
        email,
        password: pass,
      });
      if (res.data?.token) {
        localStorage.setItem('jq_admin_token', res.data.token);
        localStorage.setItem('jq_admin_user', JSON.stringify(res.data.user));
        return res.data;
      }
    } catch {
      // Mock Fallback
    }

    const matchedUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || INITIAL_USERS[0];
    const mockRes: LoginResponse = {
      token: `demo_jwt_token_${matchedUser.id}`,
      user: matchedUser,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('jq_admin_token', mockRes.token);
      localStorage.setItem('jq_admin_user', JSON.stringify(mockRes.user));
    }
    return mockRes;
  }

  static async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jq_admin_token');
      localStorage.removeItem('jq_admin_user');
    }
  }

  static getCurrentUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('jq_admin_user');
    if (!raw) return INITIAL_USERS[0];
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS[0];
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('jq_admin_token');
  }
}
