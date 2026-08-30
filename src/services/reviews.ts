import { ApiClient } from './api';
import { INITIAL_REVIEWS } from '@/lib/mock-data';
import type { Review } from '@/types';

export class ReviewService {
  private static localReviews: Review[] = [...INITIAL_REVIEWS];

  static async getAll(): Promise<Review[]> {
    return this.localReviews;
  }

  static async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<Review> {
    this.localReviews = this.localReviews.map((r) => (r.id === id ? { ...r, status } : r));
    const updated = this.localReviews.find((r) => r.id === id);
    if (!updated) throw new Error('Review not found');
    return updated;
  }

  static async toggleFeatured(id: string): Promise<Review> {
    this.localReviews = this.localReviews.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r));
    const updated = this.localReviews.find((r) => r.id === id);
    if (!updated) throw new Error('Review not found');
    return updated;
  }

  static async delete(id: string): Promise<void> {
    this.localReviews = this.localReviews.filter((r) => r.id !== id);
  }
}
