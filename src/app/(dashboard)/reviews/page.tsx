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
} from 'lucide-react';
import { ReviewService, ReviewItem } from '@/services/reviews';
import { useToast } from '@/lib/toast-context';

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('Founder & CEO');
  const [company, setCompany] = useState('Vedic Luxe Botanicals');
  const [location, setLocation] = useState('Bengaluru, India');
  const [highlight, setHighlight] = useState('Saved ₹3.8L in First 6 Months');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');
  const [comment, setComment] = useState('');
  const [badge, setBadge] = useState('D2C Brand Founder');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/reviews?status=all').then((r) => (r.ok ? r.json() : null));
      if (res?.data && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAddModal = () => {
    setEditingReviewId(null);
    setAuthor('');
    setRole('Founder & CEO');
    setCompany('D2C Brand');
    setLocation('Bengaluru, India');
    setHighlight('Zero Platform Fees');
    setRating(5);
    setImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');
    setComment('');
    setBadge('D2C Brand Founder');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rev: any) => {
    setEditingReviewId(rev.id);
    setAuthor(rev.author || '');
    setRole(rev.role || 'Founder & CEO');
    setCompany(rev.company || '');
    setLocation(rev.location || '');
    setHighlight(rev.highlight || '');
    setRating(rev.rating || 5);
    setImage(rev.image || '');
    setComment(rev.comment || '');
    setBadge(rev.badge || 'D2C Brand Founder');
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      showToast('Please provide both author name and review text', 'error');
      return;
    }

    const payload = {
      id: editingReviewId || `rev_saas_${Date.now()}`,
      author,
      role,
      company,
      location,
      highlight,
      rating,
      image,
      comment,
      badge,
      status: 'published',
    };

    try {
      if (editingReviewId) {
        const res = await fetch('/api/v1/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then((r) => r.json());

        if (res.success) {
          showToast('SaaS testimonial updated in MongoDB Atlas database', 'success');
        }
      } else {
        const res = await fetch('/api/v1/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then((r) => r.json());

        if (res.success) {
          showToast('New SaaS testimonial saved to MongoDB Atlas database', 'success');
        }
      }
    } catch (err) {
      showToast('Operation failed', 'error');
    }

    setIsModalOpen(false);
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review from MongoDB Atlas?')) return;
    try {
      const res = await fetch(`/api/v1/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).then((r) => r.json());

      if (res.success) {
        showToast('Review deleted from MongoDB Atlas', 'info');
        fetchReviews();
      }
    } catch (e) {
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            SaaS Platform Testimonials
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Founder &amp; Merchant Reviews</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add, moderate, and edit SaaS customer testimonials synced live to MongoDB Atlas and shown on the landing page.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add SaaS Testimonial</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading SaaS reviews from MongoDB Atlas...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-[#161822] rounded-xl border border-slate-800">
            No testimonials found in database.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  {rev.image ? (
                    <div className="w-12 h-12 rounded-full bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                      <img src={rev.image} alt={rev.author} className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{rev.author}</span>
                      {rev.badge && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {rev.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {rev.role ? `${rev.role}, ` : ''}<strong className="text-rose-400">{rev.company}</strong> • {rev.location || 'Global'}
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
                {rev.highlight && (
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{rev.highlight}</span>
                  </div>
                )}
                <p className="text-xs text-slate-300 italic">&ldquo;{rev.comment}&rdquo;</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-rose-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {editingReviewId ? 'Edit SaaS Testimonial' : 'Add SaaS Testimonial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Founder / Author Name</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Aarav Singhania"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder & CEO"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Brand / Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Vedic Luxe Botanicals"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Key Impact Highlight</label>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. Saved ₹3.8L in First 6 Months"
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
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
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Founder Photo URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Testimonial Quote</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe experience with Mavenco Commerce SaaS..."
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
