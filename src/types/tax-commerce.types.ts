export interface TaxZone {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  countries: string[];
  regions: string[];
  postalCodeRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaxCategory {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  defaultRate: number;
  externalCode?: string; // HSN / SAC code
  createdAt: string;
  updatedAt: string;
}

export interface TaxComponent {
  code: 'CGST' | 'SGST' | 'IGST' | 'UTGST' | 'VAT' | 'SALES_TAX' | 'CESS';
  name: string;
  rate: number;
  taxableAmountMinor: number;
  taxAmountMinor: number;
}

export interface TaxRule {
  id: string;
  tenantId: string;
  taxZoneId: string;
  taxCategoryId: string;
  jurisdiction: string;
  taxType: 'GST' | 'CGST_SGST' | 'IGST' | 'VAT' | 'SALES_TAX';
  rate: number;
  components: TaxComponent[];
  priority: number;
  status: 'active' | 'inactive';
  includedInPrice: boolean;
  appliesToShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRegistration {
  id: string;
  tenantId: string;
  country: string;
  region: string;
  registrationType: 'GSTIN' | 'VAT' | 'SALES_TAX_ID';
  registrationNumber: string;
  businessName: string;
  status: 'active' | 'pending' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface TaxCalculationResult {
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxableAmountMinor: number;
  totalTaxMinor: number;
  grandTotalMinor: number;
  components: TaxComponent[];
  isInclusive: boolean;
  jurisdiction: string;
  calculatedAt: string;
}
