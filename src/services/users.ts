import { ApiClient } from './api';
import { INITIAL_USERS, INITIAL_ROLES, INITIAL_ACTIVITY_LOGS } from '@/lib/mock-data';
import type { AdminUser, Role, ActivityLog } from '@/types';

export class UserService {
  private static localUsers: AdminUser[] = [...INITIAL_USERS];
  private static localRoles: Role[] = [...INITIAL_ROLES];

  static async getUsers(): Promise<AdminUser[]> {
    return this.localUsers;
  }

  static async inviteUser(email: string, firstName: string, lastName: string, roleId: string): Promise<AdminUser> {
    const role = this.localRoles.find((r) => r.id === roleId) || this.localRoles[1];
    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      email,
      firstName,
      lastName,
      roleId,
      roleName: role.name,
      status: 'invited',
      createdAt: new Date().toISOString(),
    };
    this.localUsers.push(newUser);
    return newUser;
  }

  static async deleteUser(id: string): Promise<void> {
    this.localUsers = this.localUsers.filter((u) => u.id !== id);
  }

  static async getRoles(): Promise<Role[]> {
    return this.localRoles;
  }

  static async updateRolePermissions(roleId: string, permissions: any[]): Promise<Role> {
    this.localRoles = this.localRoles.map((r) => (r.id === roleId ? { ...r, permissions } : r));
    const updated = this.localRoles.find((r) => r.id === roleId);
    if (!updated) throw new Error('Role not found');
    return updated;
  }
}

export class ActivityService {
  private static localLogs: ActivityLog[] = [...INITIAL_ACTIVITY_LOGS];

  static async getLogs(): Promise<ActivityLog[]> {
    return this.localLogs;
  }

  static async logAction(action: string, entityType: string, entityId: string, details?: any): Promise<void> {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      userEmail: 'aanya.kapoor@example.com',
      userName: 'Aanya Kapoor',
      action,
      entityType,
      entityId,
      details,
      ipAddress: '192.168.1.14',
      createdAt: new Date().toISOString(),
    };
    this.localLogs.unshift(newLog);
  }
}
