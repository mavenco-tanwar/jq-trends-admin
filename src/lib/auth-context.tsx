'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/services/auth';
import type { AdminUser, PermissionCode } from '@/types';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: PermissionCode) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const isAuth = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    setIsAuthenticated(isAuth);
    setUser(currentUser);
    setIsLoading(false);

    if (!isAuth && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  const login = async (email: string, pass: string) => {
    const res = await AuthService.login(email, pass);
    setUser(res.user);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const hasPermission = (code: PermissionCode): boolean => {
    if (!user) return false;
    if (user.roleId === 'role_owner') return true;
    // Granular permissions check can be enhanced here
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
