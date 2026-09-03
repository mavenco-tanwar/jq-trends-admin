import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { PlatformService } from '@/services/platform';
import { mockTenantsFixture } from '../fixtures/tenants.fixture';
import { mockUsersFixture } from '../fixtures/users.fixture';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/products'),
}));

// Mock Auth Context
vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'user_superadmin_01',
      name: 'Platform Superadmin',
      email: 'admin@mavenco.com',
      role: 'superadmin',
    },
    logout: vi.fn(),
  })),
}));

describe('AdminHeader Component Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render active store name and store switcher trigger', async () => {
    vi.spyOn(PlatformService, 'getActiveTenant').mockReturnValue(mockTenantsFixture[0]);
    vi.spyOn(PlatformService, 'listTenants').mockResolvedValue(mockTenantsFixture);

    render(<AdminHeader onOpenMobileSidebar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('JQ Trends High Fashion')).toBeInTheDocument();
    });
  });

  it('should toggle store switcher dropdown when clicked', async () => {
    vi.spyOn(PlatformService, 'getActiveTenant').mockReturnValue(mockTenantsFixture[0]);
    vi.spyOn(PlatformService, 'listTenants').mockResolvedValue(mockTenantsFixture);

    render(<AdminHeader onOpenMobileSidebar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('JQ Trends High Fashion')).toBeInTheDocument();
    });

    const switcherBtn = screen.getByText('JQ Trends High Fashion').closest('button');
    if (switcherBtn) {
      fireEvent.click(switcherBtn);
      await waitFor(() => {
        expect(screen.getByText('Switch Active Store')).toBeInTheDocument();
        expect(screen.getByText('Aura Living Home Goods')).toBeInTheDocument();
      });
    }
  });

  it('should open global search modal when search button is clicked', async () => {
    render(<AdminHeader onOpenMobileSidebar={vi.fn()} />);

    const searchBtn = screen.getByText('Search catalog, orders...').closest('button');
    if (searchBtn) {
      fireEvent.click(searchBtn);
      await waitFor(() => {
        expect(screen.getByText('Quick Navigation')).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText('Search products, SKUs, orders, customers...')
        ).toBeInTheDocument();
      });
    }
  });
});
