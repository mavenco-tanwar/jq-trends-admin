export interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
}

export interface MerchantReply {
  id: string;
  body: string;
  repliedAt: string;
  authorName: string;
}

export interface ProductReview {
  id: string;
  tenantId: string;
  productId: string;
  productTitle?: string;
  customerId?: string;
  reviewerName: string;
  reviewerEmail?: string;
  reviewerLocation?: string;
  rating: number; // 1-5
  title: string;
  body: string;
  status: 'published' | 'pending_moderation' | 'rejected' | 'hidden';
  verificationStatus: 'verified_purchase' | 'unverified';
  media?: ReviewMedia[];
  helpfulCount: number;
  reportCount: number;
  merchantReply?: MerchantReply;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnswer {
  id: string;
  body: string;
  authorType: 'merchant' | 'verified_purchaser' | 'customer';
  authorName: string;
  answeredAt: string;
}

export interface ProductQuestion {
  id: string;
  tenantId: string;
  productId: string;
  productTitle?: string;
  customerId?: string;
  customerName: string;
  question: string;
  status: 'published' | 'pending' | 'rejected';
  helpfulCount: number;
  answers: ProductAnswer[];
  createdAt: string;
}

export interface ProductReviewSummary {
  tenantId: string;
  productId: string;
  averageRating: number;
  reviewCount: number;
  verifiedReviewCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
