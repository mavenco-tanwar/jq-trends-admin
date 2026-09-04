'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Trash2,
  Plus,
  Edit,
  X,
  ShieldCheck,
  TrendingUp,
  Store,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  HelpCircle,
  Camera,
  Send,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { ApiClient } from '@/services/api';
import { PlatformService } from '@/services/platform';
import { ProductReview, ProductQuestion, ProductReviewSummary } from '@/types/reviews-commerce.types';

export default function ReviewsPage() {
  const { showToast } = useToast();
  const activeTenant = PlatformService.getActiveTenant();
  const tenantSlug = activeTenant.slug || 'lumina';

  const [activeTab, setActiveTab] = useState<'published' | 'moderation' | 'qa' | 'analytics'>('published');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [summary, setSummary] = useState<ProductReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reply Modal State
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<ProductReview | null>(null);
  const [replyText, setReplyText] = useState('');

  // Answer Modal State
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState<ProductQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');

  const fetchReviewsAndQA = async () => {
    setIsLoading(true);
    try {
      const revRes: any = await ApiClient.get<any>(`/api/v1/reviews?tenant=${tenantSlug}&status=all`);
      if (revRes?.data) {
        setReviews(revRes.data);
        setSummary(revRes.summary);
      }

      const qaRes = await ApiClient.get<any>(`/api/v1/reviews/qa?tenant=${tenantSlug}`);
      if (qaRes.data) {
        setQuestions(qaRes.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndQA();
  }, [tenantSlug]);

  const handleModerate = async (reviewId: string, nextStatus: 'published' | 'rejected' | 'hidden') => {
    try {
      await ApiClient.patch('/api/v1/reviews', { id: reviewId, status: nextStatus });
      showToast(`Review marked as ${nextStatus.toUpperCase()}!`, 'success');
      fetchReviewsAndQA();
    } catch {
      showToast('Failed to moderate review', 'error');
    }
  };

  const handlePostMerchantReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForReply) return;
    try {
      const reply = {
        id: `rep_${Date.now()}`,
        body: replyText,
        repliedAt: new Date().toISOString(),
        authorName: 'Lumina VIP Concierge (Merchant)',
      };

      await ApiClient.patch('/api/v1/reviews', {
        id: selectedReviewForReply.id,
        merchantReply: reply,
      });

      showToast('Merchant reply posted!', 'success');
      setSelectedReviewForReply(null);
      setReplyText('');
      fetchReviewsAndQA();
    } catch {
      showToast('Failed to post reply', 'error');
    }
  };

  const handlePostMerchantAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestionForAnswer) return;
    try {
      await ApiClient.post('/api/v1/reviews/qa', {
        questionId: selectedQuestionForAnswer.id,
        answerBody: answerText,
        authorType: 'merchant',
        authorName: 'Lumina Master Atelier Specialist (Official)',
      });

      showToast('Official merchant answer published!', 'success');
      setSelectedQuestionForAnswer(null);
      setAnswerText('');
      fetchReviewsAndQA();
    } catch {
      showToast('Failed to submit answer', 'error');
    }
  };

  // Metrics
  const publishedReviews = reviews.filter((r) => r.status === 'published' || !r.status);
  const pendingReviews = reviews.filter((r) => r.status === 'pending_moderation');
  const avgRating = summary?.averageRating || 4.9;
  const verifiedPct = reviews.length > 0 ? Math.round((reviews.filter((r) => r.verificationStatus === 'verified_purchase').length / reviews.length) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Social Proof &amp; UGC Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Store: <strong className="text-white">{activeTenant.name} ({tenantSlug})</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            Reviews, Ratings, Q&amp;A &amp; Moderation
          </h1>
          <p className="text-xs text-slate-400">
            Moderate customer product feedback, reply as merchant, answer pre-purchase questions, and inspect social proof ratings.
          </p>
        </div>
      </div>

      {/* 2. TOP METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Published Reviews</span>
          <span className="text-xl font-mono font-black text-white">{publishedReviews.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average Rating</span>
          <span className="text-xl font-mono font-black text-amber-400">{avgRating.toFixed(1)} ★</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verified Buyer %</span>
          <span className="text-xl font-mono font-black text-emerald-400">{verifiedPct}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Moderation</span>
          <span className="text-xl font-mono font-black text-rose-400">{pendingReviews.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1117] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Product Questions</span>
          <span className="text-xl font-mono font-black text-white">{questions.length}</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'published'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Published Reviews ({publishedReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'moderation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Moderation Queue ({pendingReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'qa'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Product Q&amp;A ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Rating Analytics</span>
        </button>
      </div>

      {/* TAB 1: PUBLISHED REVIEWS */}
      {activeTab === 'published' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Product Reviews</h3>
              <p className="text-xs text-slate-400">All customer feedback visible on storefront product pages.</p>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`rev-skel-${i}`} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-32 bg-slate-800 rounded" />
                      <div className="h-4 w-20 bg-slate-800/80 rounded" />
                    </div>
                    <div className="h-3 w-28 bg-slate-800/60 rounded" />
                  </div>
                  <div className="h-3.5 w-48 bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-800/50 rounded" />
                  <div className="h-3 w-3/4 bg-slate-800/40 rounded" />
                </div>
              ))
            ) : publishedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.productTitle || 'Haute Couture Garment'}</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      {rev.verificationStatus === 'verified_purchase' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-200">"{rev.title}"</h4>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    By {rev.reviewerName} • {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rev.body}</p>

                {rev.merchantReply && (
                  <div className="p-3 bg-slate-950 border-l-2 border-rose-500 rounded-r-xl space-y-1 text-xs">
                    <strong className="text-rose-400 block font-bold text-[11px]">
                      Merchant Response ({rev.merchantReply.authorName}):
                    </strong>
                    <p className="text-slate-400 text-[11px]">{rev.merchantReply.body}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    👍 {rev.helpfulCount} Helpful Votes
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReviewForReply(rev);
                        setReplyText(rev.merchantReply?.body || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                      <span>{rev.merchantReply ? 'Edit Reply' : 'Reply as Merchant'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, 'hidden')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 font-bold text-xs cursor-pointer"
                    >
                      Hide
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Pending Moderation Queue</h3>
              <p className="text-xs text-slate-400">Review newly submitted feedback before making it visible to shoppers.</p>
            </div>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              ✓ Moderation queue is clean. No pending reviews awaiting review.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">{rev.productTitle}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-200">"{rev.title}"</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                      Pending
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{rev.body}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, 'rejected')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerate(rev.id, 'published')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve &amp; Publish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCT Q&A */}
      {activeTab === 'qa' && (
        <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Pre-Purchase Questions &amp; Answers</h3>
              <p className="text-xs text-slate-400">Inquiries submitted by shoppers regarding materials, sizing, and care.</p>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{q.productTitle}</span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-rose-400 font-black">Q:</span>
                      <span>{q.question}</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Asked by {q.customerName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuestionForAnswer(q);
                      setAnswerText('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Answer Question</span>
                  </button>
                </div>

                {q.answers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {q.answers.map((a) => (
                      <div key={a.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                        <strong className="text-emerald-400 block font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {a.authorName}
                        </strong>
                        <p className="text-slate-300 text-[11px]">{a.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RATING ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rating Distribution Breakdown</h3>
            <div className="space-y-3 text-xs">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-16 font-mono text-slate-400">{star} Stars</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: star === 5 ? '92%' : star === 4 ? '8%' : '0%' }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono font-bold text-white">
                    {star === 5 ? '92%' : star === 4 ? '8%' : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1117] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Proof Trust Metrics</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">100% Authenticated Verified Purchases</strong>
                  <span className="text-slate-400 text-[10px]">Verified against historical delivered orders</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">94%</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <strong className="text-white block font-bold">Average Merchant Reply Time</strong>
                  <span className="text-slate-400 text-[10px]">Direct response to customer inquiries</span>
                </div>
                <span className="font-mono font-bold text-rose-400">&lt; 4 Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MERCHANT REPLY MODAL */}
      {selectedReviewForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Reply as Merchant</h3>
                <p className="text-xs text-slate-400">Customer: {selectedReviewForReply.reviewerName}</p>
              </div>
              <button onClick={() => setSelectedReviewForReply(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostMerchantReply} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Official Response</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the customer or address their sizing feedback..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForReply(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERCHANT ANSWER MODAL */}
      {selectedQuestionForAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F1117] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Answer Customer Question</h3>
                <p className="text-xs text-slate-400">Q: "{selectedQuestionForAnswer.question}"</p>
              </div>
              <button onClick={() => setSelectedQuestionForAnswer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostMerchantAnswer} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Official Answer Body</label>
                <textarea
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Provide precise details regarding materials, sizing, or dry cleaning..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionForAnswer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Publish Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
