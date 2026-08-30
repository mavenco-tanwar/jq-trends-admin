'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Shield, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PlatformService } from '@/services/platform';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState<'superadmin' | 'merchant'>('superadmin');
  const [email, setEmail] = useState('superadmin@mavenco.com');
  const [password, setPassword] = useState('SuperAdmin@2026');
  const [selectedTenantSlug, setSelectedTenantSlug] = useState('jqtrends');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      id: 'superadmin',
      type: 'superadmin',
      role: 'Platform Owner',
      name: 'Superadmin Console',
      email: 'superadmin@mavenco.com',
      password: 'SuperAdmin@2026',
      targetUrl: '/platform',
      badge: '👑 Global Control Plane',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    {
      id: 'jqtrends',
      type: 'merchant',
      role: 'Store Owner',
      name: 'JQ Trends Admin',
      email: 'aanya.kapoor@example.com',
      password: 'Password@123',
      tenantId: 'store_jq_trends',
      tenantSlug: 'jqtrends',
      targetUrl: '/stores/jqtrends',
      badge: '👗 Fashion Boutique',
      badgeColor: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    },
    {
      id: 'auraliving',
      type: 'merchant',
      role: 'Store Owner',
      name: 'Aura Living Admin',
      email: 'elena@auraliving.com',
      password: 'Password@123',
      tenantId: 'store_aura_living',
      tenantSlug: 'auraliving',
      targetUrl: '/stores/auraliving',
      badge: '🌿 Nordic Home Decor',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'apexathletics',
      type: 'merchant',
      role: 'Store Owner',
      name: 'Apex Athletics Admin',
      email: 'marcus@apexathletics.com',
      password: 'Password@123',
      tenantId: 'store_apex_athletics',
      tenantSlug: 'apexathletics',
      targetUrl: '/stores/apexathletics',
      badge: '⚡ Activewear & Gear',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
  ];

  const handleSelectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setActiveRole(acc.type as 'superadmin' | 'merchant');
    if (acc.tenantId) {
      PlatformService.setActiveTenantId(acc.tenantId);
      setSelectedTenantSlug(acc.tenantSlug || 'jqtrends');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      if (email.includes('superadmin') || activeRole === 'superadmin') {
        router.push('/platform');
      } else {
        router.push(`/stores/${selectedTenantSlug}`);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C12] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-2xl shadow-rose-950/60 text-white font-extrabold text-2xl">
            M
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">MAVENCO COMMERCE</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Multi-Tenant SaaS Control Plane
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#0A0C12] p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveRole('superadmin');
                setEmail('superadmin@mavenco.com');
                setPassword('SuperAdmin@2026');
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'superadmin'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Superadmin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('merchant');
                setEmail('aanya.kapoor@example.com');
                setPassword('Password@123');
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeRole === 'merchant'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store Merchant</span>
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-base font-bold text-white">
              {activeRole === 'superadmin' ? 'Superadmin Platform Login' : 'Merchant Store Sign In'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeRole === 'superadmin'
                ? 'Manage tenants, SaaS subscription plans, and platform health.'
                : 'Manage product catalog, visual CMS sections, and orders.'}
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
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mavenco.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#0C0E14] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
                  className="w-full pl-9 pr-10 py-2 bg-[#0C0E14] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
              <button type="button" className="text-rose-400 hover:text-rose-300 font-semibold">
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
                  <span>Sign In to {activeRole === 'superadmin' ? 'Platform' : 'Store'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Quick Switcher */}
        <div className="bg-[#12151F] border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider">One-Click Demo Switcher</span>
            <span className="text-slate-400">Click to autofill credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectDemoAccount(acc)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === acc.email
                    ? 'bg-rose-500/10 border-rose-500/40 text-white'
                    : 'bg-[#0A0C12] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{acc.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${acc.badgeColor}`}>
                    {acc.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
