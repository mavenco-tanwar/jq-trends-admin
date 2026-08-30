import { ApiClient } from './api';
import { INITIAL_CUSTOMERS } from '@/lib/mock-data';
import type { Customer } from '@/types';

export class CustomerService {
  private static localCustomers: Customer[] = [...INITIAL_CUSTOMERS];

  static async getAll(): Promise<Customer[]> {
    try {
      const res = await ApiClient.get<Customer[]>('/api/v1/customers');
      if (res.data && res.data.length > 0) {
        this.localCustomers = res.data;
        return res.data;
      }
    } catch {
      // Mock Fallback
    }
    return this.localCustomers;
  }

  static async getById(id: string): Promise<Customer | null> {
    return this.localCustomers.find((c) => c.id === id || c.email === id) || null;
  }
}
