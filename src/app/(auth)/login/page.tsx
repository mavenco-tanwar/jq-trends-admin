'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Store, Key, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PlatformService } from '@/services/platform';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot / Reset Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSlug, setResetSlug] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Merchant Sign In | Mavenco Commerce';
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetSuccess(null);
    setResetError(null);

    try {
      const res = await fetch('/api/v1/platform/merchant-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          slug: resetSlug,
          requestedBy: 'Merchant Self-Service',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess(
          `Temporary password generated and dispatched to ${resetEmail || data.credentials?.email}! Please check your inbox.`
        );
      } else {
        setResetError(data.error || 'Failed to reset password. Please verify your email.');
      }
    } catch (err: any) {
      setResetError(err.message || 'Network error resetting password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);

      // 1. If Superadmin logging in
      if (email.toLowerCase().includes('superadmin')) {
        router.push('/platform');
        return;
      }

      // 2. Identify Tenant Store by email
      const tenants = PlatformService.getAllTenants();
      const matched = tenants.find(
        (t) =>
          t.ownerEmail.toLowerCase() === email.toLowerCase() ||
          t.slug.toLowerCase() === email.split('@')[0].toLowerCase() ||
          email.toLowerCase().includes(t.slug.toLowerCase())
      );

      if (matched) {
        PlatformService.setActiveTenantId(matched.id);
        router.push(`/stores/${matched.slug}`);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C12] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-2xl shadow-rose-950/60 text-white font-extrabold text-2xl">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MAVENCO COMMERCE</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Merchant Workspace Sign In
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="text-center">
            <h2 className="text-base font-bold text-white">Sign In to Your Store</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage product catalogs, visual CMS sections, and customer orders.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Merchant Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@yourbrand.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0C0E14] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#0C0E14] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-[#0C0E14] text-rose-600 focus:ring-rose-500"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsForgotModalOpen(true);
                }}
                className="text-rose-400 hover:text-rose-300 font-semibold"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Merchant Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Reset Temporary Password</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetSuccess(null);
                  setResetError(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your Merchant Email or Store Slug. We will generate and email a fresh temporary password directly to your registered inbox.
            </p>

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Merchant Email *</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="merchant@yourbrand.com"
                    className="w-full px-3 py-2.5 bg-[#0C0E14] border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Store Slug (Optional)</label>
                  <input
                    type="text"
                    value={resetSlug}
                    onChange={(e) => setResetSlug(e.target.value)}
                    placeholder="e.g. lumina, demo, auraliving"
                    className="w-full px-3 py-2.5 bg-[#0C0E14] border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting || !resetEmail}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50"
                  >
                    {isResetting ? 'Dispatching...' : 'Send Temporary Password Email →'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
