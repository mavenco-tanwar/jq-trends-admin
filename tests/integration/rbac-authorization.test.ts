import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '@/services/users';
import { PlatformService } from '@/services/platform';
import { mockTenantsFixture } from '../fixtures/tenants.fixture';

describe('RBAC & Role-Based Authorization Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Role Definitions & Permissions', () => {
    it('should retrieve existing staff roles and verify permission matrix', async () => {
      const roles = await UserService.getRoles();
      expect(roles.length).toBeGreaterThan(0);

      const ownerRole = roles.find((r) => r.id === 'role_owner' || r.name.toLowerCase().includes('owner'));
      expect(ownerRole).toBeDefined();
    });

    it('should invite a new staff member with a specific role', async () => {
      const invited = await UserService.inviteUser(
        'merchandiser@jqtrends.com',
        'Zoya',
        'Khan',
        'role_editor'
      );

      expect(invited.id).toBeDefined();
      expect(invited.email).toBe('merchandiser@jqtrends.com');
      expect(invited.status).toBe('invited');
      expect(invited.roleId).toBe('role_editor');

      const allUsers = await UserService.getUsers();
      expect(allUsers.some((u) => u.email === 'merchandiser@jqtrends.com')).toBe(true);
    });

    it('should allow updating role permission matrices', async () => {
      const roles = await UserService.getRoles();
      const firstRole = roles[0];

      const newPermissions = [
        { resource: 'products', actions: ['read', 'create', 'update'] },
        { resource: 'orders', actions: ['read'] },
      ];

      const updated = await UserService.updateRolePermissions(firstRole.id, newPermissions);
      expect(updated.permissions).toEqual(newPermissions);
    });

    it('should remove a staff user', async () => {
      const user = await UserService.inviteUser(
        'temp_staff@jqtrends.com',
        'Temp',
        'User',
        'role_support'
      );

      await UserService.deleteUser(user.id);
      const allUsers = await UserService.getUsers();
      expect(allUsers.find((u) => u.id === user.id)).toBeUndefined();
    });
  });

  describe('Superadmin Impersonation Security Boundary', () => {
    it('should maintain security state when superadmin impersonates a merchant', () => {
      const targetStore = mockTenantsFixture[0]; // JQ Trends

      expect(PlatformService.getImpersonationState().isImpersonating).toBe(false);

      // Start Impersonation
      PlatformService.startImpersonation(targetStore);
      const activeState = PlatformService.getImpersonationState();
      expect(activeState.isImpersonating).toBe(true);
      expect(activeState.tenant?.slug).toBe('jqtrends');
      expect(activeState.tenant?.id).toBe('store_jqtrends');

      // Stop Impersonation
      PlatformService.stopImpersonation();
      expect(PlatformService.getImpersonationState().isImpersonating).toBe(false);
    });
  });
});
