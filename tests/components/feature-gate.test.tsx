import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeatureGate } from '@/components/ui/FeatureGate';
import { PlatformService } from '@/services/platform';
import { mockPlansFixture, mockTenantsFixture } from '../fixtures/tenants.fixture';

describe('FeatureGate Component Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render children when feature is enabled in tenant plan', async () => {
    // Enterprise tenant has advancedAnalytics enabled
    const enterpriseTenant = mockTenantsFixture[0]; // JQ Trends (Enterprise)
    vi.spyOn(PlatformService, 'getActiveTenant').mockReturnValue(enterpriseTenant);
    vi.spyOn(PlatformService, 'listPlans').mockResolvedValue(mockPlansFixture);

    render(
      <FeatureGate
        featureKey="advancedAnalytics"
        featureName="Advanced AI Cohort Analytics"
        featureDescription="Deep customer segmentation"
      >
        <div data-testid="protected-content">Secret Analytics Dashboard</div>
      </FeatureGate>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Secret Analytics Dashboard')).toBeInTheDocument();
    });
  });

  it('should render locked paywall when feature is disabled in starter plan', async () => {
    // Starter tenant has advancedAnalytics disabled
    const starterTenant = mockTenantsFixture[2]; // Apex Athletics (Starter)
    vi.spyOn(PlatformService, 'getActiveTenant').mockReturnValue(starterTenant);
    vi.spyOn(PlatformService, 'listPlans').mockResolvedValue(mockPlansFixture);

    render(
      <FeatureGate
        featureKey="advancedAnalytics"
        featureName="Advanced AI Cohort Analytics"
        featureDescription="Upgrade to access deep cohort intelligence."
      >
        <div data-testid="protected-content">Secret Analytics Dashboard</div>
      </FeatureGate>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText('Advanced AI Cohort Analytics is Locked')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to access deep cohort intelligence.')).toBeInTheDocument();
    });
  });
});
