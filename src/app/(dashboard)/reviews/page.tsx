'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ReviewService } from '@/services/reviews';
import { useToast } from '@/lib/toast-context';
import type { Review } from '@/types';

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    const list = await ReviewService.getAll();
    setReviews(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    await ReviewService.updateStatus(id, status);
    showToast(`Review ${status}`, 'success');
    fetchReviews();
  };

  const handleToggleFeatured = async (id: string) => {
    await ReviewService.toggleFeatured(id);
    showToast('Featured testimonial status updated', 'success');
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await ReviewService.delete(id);
    showToast('Review deleted', 'info');
    fetchReviews();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Customer Feedback
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Product Review Moderation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Approve genuine buyer testimonials, moderate feedback, and curate storefront features.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#161822] border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                  <img src={rev.productImage} alt={rev.productTitle} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{rev.productTitle}</div>
                  <div className="text-[11px] text-slate-400">
                    By <strong className="text-slate-200">{rev.customerName}</strong> ({rev.customerEmail})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    rev.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {rev.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-white text-sm">{rev.title}</div>
              <p className="text-slate-300 leading-relaxed font-sans">{rev.comment}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleFeatured(rev.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  rev.isFeatured
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{rev.isFeatured ? '★ Featured on Storefront' : 'Feature as Testimonial'}</span>
              </button>

              <div className="flex items-center gap-2">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => handleStatus(rev.id, 'approved')}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}
                {rev.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatus(rev.id, 'rejected')}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
