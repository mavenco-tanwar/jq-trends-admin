'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('aanya.kapoor@example.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1017] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 shadow-xl shadow-rose-950/50 text-white font-serif font-black text-2xl">
            JQ
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide font-serif">JQ TRENDS</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-rose-400">Headless Ecommerce Admin</p>
        </div>

        {/* Login Box */}
        <div className="bg-[#161822] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-base font-bold text-white">Sign In to Workspace</h2>
            <p className="text-xs text-slate-400 mt-0.5">Control catalog, visual CMS sections, and orders.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jqtrends.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
                  className="w-full pl-9 pr-10 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <button type="button" className="text-rose-400 hover:underline font-bold">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Fast Logins */}
        <div className="p-4 bg-[#161822]/70 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider text-center">
            Demo Credentials
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setEmail('aanya.kapoor@example.com');
                setPassword('Password@123');
              }}
              className="p-2 rounded-lg bg-[#10121A] hover:bg-slate-800 text-slate-300 text-left border border-slate-800"
            >
              <div className="font-bold text-white">Aanya Kapoor</div>
              <div className="text-[10px] text-rose-300">Store Owner</div>
            </button>
            <button
              onClick={() => {
                setEmail('vikram.mehta@example.com');
                setPassword('Password@123');
              }}
              className="p-2 rounded-lg bg-[#10121A] hover:bg-slate-800 text-slate-300 text-left border border-slate-800"
            >
              <div className="font-bold text-white">Vikram Mehta</div>
              <div className="text-[10px] text-slate-400">Store Manager</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
