'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  Plus,
  Edit,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { ReviewService, ReviewItem } from '@/services/reviews';
import { useToast } from '@/lib/toast-context';

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStore, setFilterStore] = useState<string>('all');

  // Modal State for Add / Edit Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('Mumbai, India');
  const [store, setStore] = useState('Muskan Clothing');
  const [storeSlug, setStoreSlug] = useState('muskan-clothing');
  const [product, setProduct] = useState('Pure Mulberry Silk Banarasi Saree');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');
  const [comment, setComment] = useState('');
  const [badge, setBadge] = useState('Verified Buyer');

  const fetchReviews = async () => {
    setIsLoading(true);
    const list = await ReviewService.getAll();
    setReviews(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAddModal = () => {
    setEditingReviewId(null);
    setAuthor('');
    setLocation('Mumbai, India');
    setStore('Muskan Clothing');
    setStoreSlug('muskan-clothing');
    setProduct('Pure Mulberry Silk Banarasi Saree');
    setRating(5);
    setImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');
    setComment('');
    setBadge('Verified Buyer');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rev: ReviewItem) => {
    setEditingReviewId(rev.id);
    setAuthor(rev.author || rev.customerName || '');
    setLocation(rev.location || '');
    setStore(rev.store || 'Muskan Clothing');
    setStoreSlug(rev.storeSlug || 'muskan-clothing');
    setProduct(rev.product || rev.productTitle || '');
    setRating(rev.rating || 5);
    setImage(rev.image || rev.productImage || '');
    setComment(rev.comment || rev.reviewText || '');
    setBadge(rev.badge || 'Verified Buyer');
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      showToast('Please provide both author name and review text', 'error');
      return;
    }

    const payload: Partial<ReviewItem> = {
      author,
      customerName: author,
      location,
      store,
      storeSlug: storeSlug || store.toLowerCase().replace(/\s+/g, '-'),
      product,
      productTitle: product,
      rating,
      image,
      productImage: image,
      comment,
      reviewText: comment,
      badge,
      status: 'published',
    };

    if (editingReviewId) {
      const ok = await ReviewService.update(editingReviewId, payload);
      if (ok) {
        showToast('Review updated in MongoDB Atlas database', 'success');
      } else {
        showToast('Failed to update review', 'error');
      }
    } else {
      const created = await ReviewService.create(payload);
      if (created) {
        showToast('New review saved to MongoDB Atlas database', 'success');
      } else {
        showToast('Failed to save review', 'error');
      }
    }

    setIsModalOpen(false);
    fetchReviews();
  };

  const handleStatus = async (id: string, status: 'published' | 'rejected') => {
    await ReviewService.updateStatus(id, status);
    showToast(`Review status updated to ${status}`, 'success');
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review from MongoDB?')) return;
    await ReviewService.delete(id);
    showToast('Review deleted from MongoDB Atlas', 'info');
    fetchReviews();
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterStore === 'all') return true;
    return (r.storeSlug || r.store || '').toLowerCase().includes(filterStore.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Customer Experience &amp; UGC Moderation
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Verified Customer Reviews</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add, moderate, and edit customer testimonials synced live to MongoDB Atlas and displayed on the storefront.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Review</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#161822] p-3 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-2">Filter Store:</span>
        {['all', 'muskan-clothing', 'auraliving', 'apexathletics'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStore(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStore === st
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {st === 'all' ? 'All Stores' : st.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading reviews from MongoDB Atlas...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-[#161822] rounded-xl border border-slate-800">
            No reviews found for this store.
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const authorName = rev.author || rev.customerName || 'Anonymous';
            const prodName = rev.product || rev.productTitle || 'Featured Item';
            const imgUrl = rev.image || rev.productImage || '';
            const commentText = rev.comment || rev.reviewText || '';

            return (
              <div
                key={rev.id}
                className="bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {imgUrl ? (
                      <div className="w-12 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                        <img src={imgUrl} alt={authorName} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{authorName}</span>
                        {rev.badge && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {rev.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rev.location ? `${rev.location} • ` : ''}Store: <strong className="text-rose-400">{rev.store}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        rev.status === 'published' || rev.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {rev.status}
                    </span>

                    <button
                      onClick={() => handleOpenEditModal(rev)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                      title="Edit Review"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-all"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-300 font-mono">Product: {prodName}</div>
                  <p className="text-xs text-slate-300 italic">&ldquo;{commentText}&rdquo;</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-rose-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {editingReviewId ? 'Edit Customer Review' : 'Add Verified Customer Review'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Author Name</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Store Name</label>
                  <select
                    value={storeSlug}
                    onChange={(e) => {
                      setStoreSlug(e.target.value);
                      if (e.target.value === 'muskan-clothing') setStore('Muskan Clothing');
                      else if (e.target.value === 'auraliving') setStore('Aura Living');
                      else if (e.target.value === 'apexathletics') setStore('Apex Athletics');
                      else setStore(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="muskan-clothing">Muskan Clothing</option>
                    <option value="auraliving">Aura Living</option>
                    <option value="apexathletics">Apex Athletics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Purchased Product Name</label>
                <input
                  type="text"
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. Pure Mulberry Silk Banarasi Saree"
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Customer / UGC Photo URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Review Comment</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter genuine customer testimonial..."
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  {editingReviewId ? 'Save Changes' : 'Save to MongoDB Atlas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
