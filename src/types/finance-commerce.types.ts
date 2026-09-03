export interface FinancialLedgerEntry {
  id: string;
  tenantId: string;
  entryType: 'sale' | 'payment' | 'refund' | 'chargeback' | 'payment_fee' | 'tax' | 'shipping_revenue' | 'discount' | 'settlement' | 'payout';
  sourceType: 'order' | 'payment' | 'refund' | 'settlement' | 'payout';
  sourceId: string;
  referenceType?: string;
  referenceId?: string;
  direction: 'credit' | 'debit';
  amountMinor: number;
  currency: string;
  accountCode: string;
  category: string;
  description: string;
  occurredAt: string;
  createdAt: string;
}

export interface FinancialAccount {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balanceMinor: number;
  currency: string;
  status: 'active' | 'archived';
  description?: string;
}

export interface SettlementRecord {
  id: string;
  tenantId: string;
  provider: string;
  settlementReference: string;
  grossAmountMinor: number;
  feesMinor: number;
  taxOnFeesMinor: number;
  netAmountMinor: number;
  currency: string;
  settlementDate: string;
  status: 'reconciled' | 'pending' | 'disputed';
  transactionCount: number;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  tenantId: string;
  provider: string;
  payoutReference: string;
  destinationBank: string;
  accountEnding: string;
  amountMinor: number;
  currency: string;
  status: 'paid' | 'processing' | 'failed';
  initiatedAt: string;
  completedAt?: string;
}

export interface FinancialPeriod {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closing' | 'closed';
  closedAt?: string;
  closedBy?: string;
}

export interface FinancialReportData {
  currency: string;
  period: string;
  grossSalesMinor: number;
  discountsMinor: number;
  returnsRefundsMinor: number;
  netSalesMinor: number;
  shippingRevenueMinor: number;
  taxCollectedMinor: number;
  gatewayFeesMinor: number;
  netProfitMinor: number;
}
