import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@/services/auth';
import { mockUsersFixture } from '../../fixtures/users.fixture';

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Session State', () => {
    it('should report not authenticated when no token exists', () => {
      expect(AuthService.isAuthenticated()).toBe(false);
      expect(AuthService.getCurrentUser()).toBeNull();
    });

    it('should return current user when stored in localStorage', () => {
      const user = mockUsersFixture[0];
      localStorage.setItem('jq_admin_user', JSON.stringify(user));
      localStorage.setItem('jq_admin_token', 'jwt_test_token_123');

      expect(AuthService.isAuthenticated()).toBe(true);
      expect(AuthService.getCurrentUser()?.email).toBe('admin@mavenco.com');
      expect(AuthService.getCurrentUser()?.roleId).toBe('superadmin');
    });

    it('should cleanly remove tokens and state on logout', async () => {
      localStorage.setItem('jq_admin_token', 'jwt_test_token_123');
      localStorage.setItem('jq_admin_user', JSON.stringify(mockUsersFixture[0]));
      localStorage.setItem('jq_saas_impersonation_state', 'true');

      await AuthService.logout();

      expect(AuthService.isAuthenticated()).toBe(false);
      expect(AuthService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('jq_admin_token')).toBeNull();
      expect(localStorage.getItem('jq_saas_impersonation_state')).toBeNull();
    });
  });

  describe('Login Operation', () => {
    it('should successfully authenticate and store token on 200 response', async () => {
      const mockLoginResponse = {
        token: 'session_superadmin_9999',
        user: mockUsersFixture[0],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockLoginResponse,
      } as Response);

      const result = await AuthService.login('admin@mavenco.com', 'admin123');

      expect(result.token).toBe('session_superadmin_9999');
      expect(result.user.email).toBe('admin@mavenco.com');
      expect(localStorage.getItem('jq_admin_token')).toBe('session_superadmin_9999');
      expect(JSON.parse(localStorage.getItem('jq_admin_user') || '{}').email).toBe('admin@mavenco.com');
    });

    it('should throw an error on failed credentials', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid password. Please check your credentials.' }),
      } as Response);

      await expect(AuthService.login('admin@mavenco.com', 'wrongpass')).rejects.toThrow(
        'Invalid password. Please check your credentials.'
      );
    });
  });
});
