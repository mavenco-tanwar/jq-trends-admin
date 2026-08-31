export interface ReviewItem {
  id: string;
  author: string;
  customerName?: string;
  customerEmail?: string;
  location?: string;
  rating: number;
  store: string;
  storeSlug?: string;
  product: string;
  productTitle?: string;
  productImage?: string;
  image?: string;
  comment: string;
  reviewText?: string;
  badge?: string;
  status: 'published' | 'approved' | 'rejected' | 'pending';
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class ReviewService {
  static async getAll(store?: string): Promise<ReviewItem[]> {
    try {
      const url = store ? `/api/v1/reviews?store=${encodeURIComponent(store)}&status=all` : `/api/v1/reviews?status=all`;
      const res = await fetch(url).then((r) => (r.ok ? r.json() : null));
      if (res?.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.error('Failed to load reviews from API:', e);
    }
    return [];
  }

  static async create(review: Partial<ReviewItem>): Promise<ReviewItem | null> {
    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      }).then((r) => (r.ok ? r.json() : null));
      return res?.data || null;
    } catch (e) {
      console.error('Failed to create review:', e);
      return null;
    }
  }

  static async update(id: string, updates: Partial<ReviewItem>): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      }).then((r) => (r.ok ? r.json() : null));
      return !!res?.success;
    } catch (e) {
      console.error('Failed to update review:', e);
      return false;
    }
  }

  static async updateStatus(id: string, status: 'approved' | 'rejected' | 'published'): Promise<boolean> {
    return this.update(id, { status });
  }

  static async toggleFeatured(id: string, isFeatured: boolean): Promise<boolean> {
    return this.update(id, { isFeatured });
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).then((r) => (r.ok ? r.json() : null));
      return !!res?.success;
    } catch (e) {
      console.error('Failed to delete review:', e);
      return false;
    }
  }
}
