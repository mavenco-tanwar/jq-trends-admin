import { ApiClient } from './api';
import { INITIAL_ORDERS } from '@/lib/mock-data';
import type { Order, OrderStatus } from '@/types';

function normalizeOrder(raw: any): Order {
  const fullName =
    raw.customer?.fullName ||
    raw.customerName ||
    raw.shippingAddress?.fullName ||
    raw.billingAddress?.fullName ||
    'Valued Customer';
  const nameParts = fullName.split(' ');
  const firstName = raw.customer?.firstName || nameParts[0] || 'Valued';
  const lastName = raw.customer?.lastName || nameParts.slice(1).join(' ') || 'Customer';
  const email = raw.customer?.email || raw.customerEmail || raw.email || 'customer@example.com';
  const phone = raw.customer?.phone || raw.phone || raw.shippingAddress?.phone || '+91 98765 43210';

  const subtotal = typeof raw.pricing?.subtotal === 'number' ? raw.pricing.subtotal : raw.subtotal || raw.grandTotal || 0;
  const shippingTotal = typeof raw.pricing?.shippingFee === 'number' ? raw.pricing.shippingFee : raw.shippingTotal || 0;
  const discountTotal = typeof raw.pricing?.discountTotal === 'number' ? raw.pricing.discountTotal : raw.discountTotal || 0;
  const taxTotal = typeof raw.pricing?.taxTotal === 'number' ? raw.pricing.taxTotal : raw.taxTotal || 0;
  const grandTotal = typeof raw.pricing?.grandTotal === 'number' ? raw.pricing.grandTotal : raw.grandTotal || raw.subtotal || 0;
  const rawStatus = (raw.orderStatus || raw.status || 'processing').toLowerCase();
  const status: OrderStatus =
    rawStatus === 'delivered'
      ? 'delivered'
      : rawStatus === 'shipped'
      ? 'shipped'
      : rawStatus === 'packed'
      ? 'packed'
      : rawStatus === 'cancelled'
      ? 'cancelled'
      : 'processing';

  return {
    id: raw.id || raw._id || `ord_${Date.now()}`,
    orderNumber: raw.orderNumber || `JQT-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId: raw.customerId || raw.customer?.id || `cust_${Date.now()}`,
    customer: {
      id: raw.customerId || raw.customer?.id || `cust_${Date.now()}`,
      firstName,
      lastName,
      email,
      phone,
    },
    items: Array.isArray(raw.items) && raw.items.length > 0
      ? raw.items.map((it: any) => ({
          productId: it.productId || it.productSnapshot?.sku || 'prod_jq_01',
          title: it.title || it.productSnapshot?.title || it.name || 'Boutique Garment',
          sku: it.sku || it.productSnapshot?.sku || 'JQT-SKU',
          price: it.price || it.unitPrice || 999,
          quantity: it.quantity || 1,
          total: it.total || (it.unitPrice || it.price || 999) * (it.quantity || 1),
          imageUrl: it.imageUrl || it.productSnapshot?.image || it.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&auto=format&fit=crop',
          options: it.options || {},
        }))
      : [],
    subtotal,
    shippingTotal,
    discountTotal,
    taxTotal,
    grandTotal,
    currency: raw.currency || 'INR',
    paymentStatus: (raw.paymentStatus || 'paid').toLowerCase() as any,
    paymentMethod: raw.paymentMethod || 'UPI / Online',
    status,
    fulfillmentStatus:
      raw.fulfillmentStatus ||
      (status === 'shipped' || status === 'delivered' ? 'fulfilled' : 'unfulfilled'),
    shippingAddress: raw.shippingAddress || {
      fullName,
      addressLine1: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone,
    },
    billingAddress: raw.billingAddress || raw.shippingAddress,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    carrier: raw.carrier || 'BlueDart Express',
    trackingNumber: raw.trackingNumber || 'BD-847291-IN',
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    placedAt: raw.placedAt || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export class OrderService {
  private static localOrders: Order[] = INITIAL_ORDERS.map(normalizeOrder);

  static async getAll(): Promise<Order[]> {
    try {
      const res = await ApiClient.get<any[]>('/api/v1/orders');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map(normalizeOrder);
        this.localOrders = normalized;
        return normalized;
      }
    } catch {
      // Mock Fallback
    }
    return this.localOrders.map(normalizeOrder);
  }

  static async getById(id: string): Promise<Order | null> {
    try {
      const res = await ApiClient.get<any>(`/api/v1/orders/${id}`);
      if (res.data) return normalizeOrder(res.data);
    } catch {
      // Mock Fallback
    }
    const found = this.localOrders.find((o) => o.id === id || o.orderNumber === id);
    return found ? normalizeOrder(found) : null;
  }

  static async updateStatus(
    id: string,
    status: OrderStatus,
    carrier?: string,
    trackingNumber?: string
  ): Promise<Order> {
    try {
      const res = await ApiClient.patch<any>(`/api/v1/orders/${id}`, { status, carrier, trackingNumber });
      if (res.data) {
        const normalized = normalizeOrder(res.data);
        this.localOrders = this.localOrders.map((o) =>
          o.id === id || o.orderNumber === id ? normalized : o
        );
        return normalized;
      }
    } catch {
      // Mock Fallback
    }

    this.localOrders = this.localOrders.map((o) => {
      if (o.id === id || o.orderNumber === id) {
        return normalizeOrder({
          ...o,
          status,
          carrier: carrier || o.carrier,
          trackingNumber: trackingNumber || o.trackingNumber,
          fulfillmentStatus:
            status === 'shipped' || status === 'delivered' ? 'fulfilled' : o.fulfillmentStatus,
          updatedAt: new Date().toISOString(),
        });
      }
      return o;
    });

    const updated = this.localOrders.find((o) => o.id === id || o.orderNumber === id);
    if (!updated) throw new Error('Order not found');
    return updated;
  }

  static async addAdminNote(id: string, note: string): Promise<Order> {
    this.localOrders = this.localOrders.map((o) => {
      if (o.id === id || o.orderNumber === id) {
        const currentNotes = Array.isArray(o.notes) ? o.notes : [];
        return normalizeOrder({
          ...o,
          notes: [
            ...currentNotes,
            {
              id: `note_${Date.now()}`,
              author: 'Admin',
              content: note,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
      return o;
    });

    const updated = this.localOrders.find((o) => o.id === id || o.orderNumber === id);
    if (!updated) throw new Error('Order not found');
    return updated;
  }
}
