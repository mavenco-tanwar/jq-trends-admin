export interface ShippingZone {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  countries: string[];
  regions: string[];
  postalCodeRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  tenantId: string;
  zoneId: string;
  name: string;
  code: string;
  description: string;
  type: 'flat_rate' | 'free_shipping' | 'weight_based' | 'price_based' | 'carrier_rate' | 'pickup';
  status: 'active' | 'inactive';
  displayOrder: number;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  rateAmountMinor: number; // Integer minor currency units (paise/cents)
  freeShippingThresholdMinor?: number;
  carrierCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCarrier {
  id: string;
  tenantId: string;
  name: string;
  code: 'bluedart' | 'delhivery' | 'fedex' | 'dhl' | 'shiprocket' | 'custom';
  status: 'active' | 'inactive' | 'degraded';
  supportedCountries: string[];
  trackingUrlTemplate: string;
  avgDeliveryDays: number;
  slaComplianceRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentTrackingEvent {
  id: string;
  status: 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  eventCode: string;
  description: string;
  location: string;
  eventAt: string;
}

export interface Shipment {
  id: string;
  tenantId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  warehouseId: string;
  carrierId: string;
  carrierName: string;
  trackingNumber: string;
  trackingUrl: string;
  status: 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  estimatedDeliveryAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  packageWeightKg: number;
  events: ShipmentTrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRateQuote {
  id: string;
  methodId: string;
  name: string;
  amountMinor: number;
  currency: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  carrier: string;
}
