export interface FinancialDocument {
  id: string;
  tenantId: string;
  documentType: 'invoice' | 'credit_note' | 'debit_note' | 'refund_receipt' | 'payment_receipt' | 'packing_slip';
  documentNumber: string;
  status: 'draft' | 'issued' | 'void' | 'cancelled';
  orderId: string;
  customerId: string;
  currency: string;
  issueDate: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  orderId: string;
  orderNumber: string;
  documentNumber: string;
  status: 'issued' | 'paid' | 'void' | 'partially_refunded';
  issueDate: string;
  currency: string;
  sellerSnapshot: {
    businessName: string;
    legalName: string;
    gstinOrVat: string;
    address: string;
    email: string;
    phone: string;
  };
  customerSnapshot: {
    customerName: string;
    email: string;
    phone?: string;
    taxIdOrGstin?: string;
    billingAddress: string;
    shippingAddress: string;
  };
  lineItems: Array<{
    productId: string;
    title: string;
    sku?: string;
    hsnCode?: string;
    quantity: number;
    unitPriceMinor: number;
    taxableAmountMinor: number;
    taxAmountMinor: number;
    totalMinor: number;
  }>;
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNote {
  id: string;
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  orderId: string;
  documentNumber: string;
  status: 'issued' | 'void';
  issueDate: string;
  reason: 'full_return' | 'partial_return' | 'price_adjustment' | 'tax_adjustment' | 'order_cancellation';
  customerName: string;
  customerEmail: string;
  refundAmountMinor: number;
  taxRefundMinor: number;
  currency: string;
  createdAt: string;
}

export interface DocumentSeries {
  id: string;
  tenantId: string;
  documentType: 'invoice' | 'credit_note' | 'receipt' | 'packing_slip';
  prefix: string;
  suffix?: string;
  currentSequence: number;
  padding: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  id: string;
  tenantId: string;
  documentType: 'invoice' | 'credit_note';
  name: string;
  version: number;
  status: 'published' | 'draft';
  headerNote?: string;
  footerTerms?: string;
  showGstBreakdown: boolean;
  showHsnCode: boolean;
  createdAt: string;
  updatedAt: string;
}
