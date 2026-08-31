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
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';
import { PlatformService } from '@/services/platform';

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'product' | 'saas'>('product');
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTenant, setActiveTenant] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Form fields for Product Review
  const [productTitle, setProductTitle] = useState('Pure Mulberry Silk Banarasi Saree');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [location, setLocation] = useState('Mumbai, India');
  const [productImage, setProductImage] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');
  const [reviewComment, setReviewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [badge, setBadge] = useState('Verified Buyer');

  // Form fields for SaaS Review
  const [saasAuthor, setSaasAuthor] = useState('');
  const [saasRole, setSaasRole] = useState('Founder & CEO');
  const [saasCompany, setSaasCompany] = useState('D2C Brand');
  const [saasHighlight, setSaasHighlight] = useState('Saved ₹3.8L in First 6 Months');
  const [saasImage, setSaasImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');
  const [saasComment, setSaasComment] = useState('');

  const fetchReviews = async (tab = activeTab) => {
    setIsLoading(true);
    try {
      const url = tab === 'saas' ? '/api/v1/reviews?type=saas&status=all' : '/api/v1/reviews?type=product&status=all';
      const res = await fetch(url).then((r) => (r.ok ? r.json() : null));
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
    const tenant = PlatformService.getActiveTenant();
    setActiveTenant(tenant);
    fetchReviews(activeTab);
  }, [activeTab]);

  const handleOpenAddModal = () => {
    setEditingReviewId(null);
    if (activeTab === 'product') {
      setProductTitle('Pure Mulberry Silk Banarasi Saree');
      setCustomerName('');
      setCustomerEmail('');
      setLocation('Mumbai, India');
      setProductImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop');
      setReviewComment('');
      setRating(5);
      setBadge('Verified Buyer');
    } else {
      setSaasAuthor('');
      setSaasRole('Founder & CEO');
      setSaasCompany('D2C Brand');
      setSaasHighlight('Zero Platform Fees');
      setSaasImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop');
      setSaasComment('');
      setRating(5);
      setBadge('D2C Brand Founder');
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rev: any) => {
    setEditingReviewId(rev.id);
    if (activeTab === 'product') {
      setProductTitle(rev.productTitle || rev.product || '');
      setCustomerName(rev.customerName || rev.author || '');
      setCustomerEmail(rev.customerEmail || '');
      setLocation(rev.location || '');
      setProductImage(rev.productImage || rev.image || '');
      setReviewComment(rev.comment || rev.reviewText || '');
      setRating(rev.rating || 5);
      setBadge(rev.badge || 'Verified Buyer');
    } else {
      setSaasAuthor(rev.author || '');
      setSaasRole(rev.role || 'Founder & CEO');
      setSaasCompany(rev.company || '');
      setLocation(rev.location || '');
      setSaasHighlight(rev.highlight || '');
      setSaasImage(rev.image || '');
      setSaasComment(rev.comment || '');
      setRating(rev.rating || 5);
      setBadge(rev.badge || 'D2C Brand Founder');
    }
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload: any;
    if (activeTab === 'product') {
      if (!customerName.trim() || !reviewComment.trim()) {
        showToast('Please provide customer name and review text', 'error');
        return;
      }
      payload = {
        id: editingReviewId || `rev_prod_${Date.now()}`,
        type: 'product',
        tenantSlug: activeTenant?.slug || 'muskan-clothing',
        storeSlug: activeTenant?.slug || 'muskan-clothing',
        store: activeTenant?.name || 'Muskan Clothing',
        product: productTitle,
        productTitle,
        productImage,
        image: productImage,
        customerName,
        author: customerName,
        customerEmail,
        location,
        rating,
        comment: reviewComment,
        reviewText: reviewComment,
        badge,
        status: 'approved',
      };
    } else {
      if (!saasAuthor.trim() || !saasComment.trim()) {
        showToast('Please provide author name and testimonial quote', 'error');
        return;
      }
      payload = {
        id: editingReviewId || `rev_saas_${Date.now()}`,
        type: 'saas',
        author: saasAuthor,
        role: saasRole,
        company: saasCompany,
        location,
        highlight: saasHighlight,
        rating,
        image: saasImage,
        comment: saasComment,
        badge,
        status: 'published',
      };
    }

    try {
      const method = editingReviewId ? 'PUT' : 'POST';
      const res = await fetch('/api/v1/reviews', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.success) {
        showToast(
          editingReviewId ? 'Review updated in MongoDB Atlas' : 'New review saved to MongoDB Atlas',
          'success'
        );
      }
    } catch (err) {
      showToast('Failed to save review', 'error');
    }

    setIsModalOpen(false);
    fetchReviews(activeTab);
  };

  const handleStatusToggle = async (rev: any, newStatus: string) => {
    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rev.id,
          type: activeTab,
          status: newStatus,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast(`Review status updated to ${newStatus}`, 'success');
        fetchReviews(activeTab);
      }
    } catch (e) {
      showToast('Status update failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review from MongoDB Atlas?')) return;
    try {
      const res = await fetch(`/api/v1/reviews?id=${encodeURIComponent(id)}&type=${activeTab}`, {
        method: 'DELETE',
      }).then((r) => r.json());

      if (res.success) {
        showToast('Review deleted from MongoDB Atlas', 'info');
        fetchReviews(activeTab);
      }
    } catch (e) {
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Reviews &amp; Testimonials Hub
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            {activeTab === 'product' ? 'Merchant Product Reviews Moderation' : 'SaaS Platform Testimonials'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeTab === 'product'
              ? 'Moderate and approve genuine customer reviews for products in your store.'
              : 'Manage founder & enterprise client testimonials featured on the Mavenco showcase.'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'product' ? 'Add Product Review' : 'Add SaaS Testimonial'}</span>
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-[#161822] p-2 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'product'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Merchant Store Product Reviews</span>
        </button>

        <button
          onClick={() => setActiveTab('saas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'saas'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>SaaS Platform Founder Testimonials</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading reviews from MongoDB Atlas...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-[#161822] rounded-xl border border-slate-800">
            No reviews found in this collection.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#161822] border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  {rev.image || rev.productImage ? (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                      <img
                        src={rev.image || rev.productImage}
                        alt={rev.author || rev.customerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{rev.author || rev.customerName}</span>
                      {rev.badge && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {rev.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {activeTab === 'product' ? (
                        <span>
                          Product: <strong className="text-rose-400">{rev.productTitle || rev.product}</strong> ({rev.location || 'India'})
                        </span>
                      ) : (
                        <span>
                          {rev.role ? `${rev.role}, ` : ''}<strong className="text-rose-400">{rev.company}</strong> • {rev.location || 'Global'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
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
                      rev.status === 'approved' || rev.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {rev.status || 'approved'}
                  </span>

                  {activeTab === 'product' && (
                    <button
                      onClick={() => handleStatusToggle(rev, rev.status === 'approved' ? 'rejected' : 'approved')}
                      className={`p-1.5 rounded-lg transition-all ${
                        rev.status === 'approved'
                          ? 'text-amber-400 hover:bg-amber-950/60'
                          : 'text-emerald-400 hover:bg-emerald-950/60'
                      }`}
                      title={rev.status === 'approved' ? 'Reject Review' : 'Approve Review'}
                    >
                      {rev.status === 'approved' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  )}

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
                <p className="text-xs text-slate-300 italic">&ldquo;{rev.comment || rev.reviewText}&rdquo;</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141F] border border-rose-500/40 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {editingReviewId
                  ? `Edit ${activeTab === 'product' ? 'Product Review' : 'SaaS Testimonial'}`
                  : `Add ${activeTab === 'product' ? 'Product Review' : 'SaaS Testimonial'}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              {activeTab === 'product' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Mumbai, India"
                        className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Purchased Product Title</label>
                    <input
                      type="text"
                      required
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="e.g. Pure Mulberry Silk Banarasi Saree"
                      className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Badge</label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="Verified Buyer"
                        className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Product Photo URL</label>
                    <input
                      type="url"
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-[11px] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Review</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Customer feedback..."
                      className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Founder Name</label>
                      <input
                        type="text"
                        required
                        value={saasAuthor}
                        onChange={(e) => setSaasAuthor(e.target.value)}
                        placeholder="e.g. Aarav Singhania"
                        className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Role / Title</label>
                      <input
                        type="text"
                        value={saasRole}
                        onChange={(e) => setSaasRole(e.target.value)}
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
                        value={saasCompany}
                        onChange={(e) => setSaasCompany(e.target.value)}
                        placeholder="e.g. Vedic Luxe Botanicals"
                        className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Impact Metric Highlight</label>
                      <input
                        type="text"
                        value={saasHighlight}
                        onChange={(e) => setSaasHighlight(e.target.value)}
                        placeholder="e.g. Saved ₹3.8L in First 6 Months"
                        className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Founder Photo URL</label>
                    <input
                      type="url"
                      value={saasImage}
                      onChange={(e) => setSaasImage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-[11px] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">SaaS Testimonial Quote</label>
                    <textarea
                      required
                      rows={3}
                      value={saasComment}
                      onChange={(e) => setSaasComment(e.target.value)}
                      placeholder="Quote about Mavenco Commerce..."
                      className="w-full px-3 py-2 bg-[#0A0C10] border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </>
              )}

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
