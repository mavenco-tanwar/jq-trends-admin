'use client';

import React, { useState } from 'react';
import {
  Cable,
  Smartphone,
  Globe,
  Store,
  ShoppingBag,
  Layers,
  DollarSign,
  Boxes,
  CreditCard,
  Truck,
  Sparkles,
  History,
  Code,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
  Activity,
  Sliders,
  Eye,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
} from 'lucide-react';
import {
  StorefrontChannel,
  StorefrontChannelType,
  ChannelConfiguration,
} from '@/types/headless-experience.types';

const INITIAL_CHANNELS: StorefrontChannel[] = [
  {
    id: 'chan_web_primary',
    tenantId: 'tenant_lumina',
    storeId: 'store_flagship_01',
    name: 'Next.js Flagship Web Storefront',
    code: 'WEB_PRIMARY',
    type: 'web',
    status: 'active',
    apiKeyPrefix: 'sf_live_web_982',
    configuration: {
      locale: 'en-US',
      currency: 'USD',
      allowedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'],
      allowedLocales: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'hi-IN'],
      catalogVisibility: 'all',
      pricingMultiplier: 1.0,
      allowGuestCheckout: true,
      requiresCustomerApproval: false,
      inventoryAllocationPolicy: 'shared',
      paymentMethodIds: ['pm_stripe_card', 'pm_apple_pay', 'pm_google_pay', 'pm_paypal', 'pm_klarna'],
      shippingMethodIds: ['ship_standard_ground', 'ship_express_air', 'ship_overnight_priority'],
      seo: {
        titleTemplate: '%s | Lumina Luxury Commerce',
        defaultMetaDescription: 'Curated luxury fashion, couture tailoring, and modern lifestyle essentials.',
        robotsRule: 'index, follow',
        canonicalBaseUrl: 'https://lumina-luxury.com',
      },
      features: {
        wishlist: true,
        reviews: true,
        loyalty: true,
        giftCards: true,
        wallet: true,
        recommendations: true,
        analytics: true,
      },
    },
    activeVersion: 3,
    metrics24h: {
      requestCount: 148920,
      avgLatencyMs: 38,
      conversionRate: 3.82,
      ordersCount: 429,
      revenue: 68420.5,
    },
    createdAt: new Date(Date.now() - 100000000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chan_mobile_app',
    tenantId: 'tenant_lumina',
    storeId: 'store_flagship_01',
    name: 'iOS & Android Native Mobile App',
    code: 'MOBILE_APP',
    type: 'mobile',
    status: 'active',
    apiKeyPrefix: 'sf_live_mob_419',
    configuration: {
      locale: 'en-US',
      currency: 'USD',
      allowedCurrencies: ['USD', 'EUR', 'GBP'],
      allowedLocales: ['en-US', 'en-GB'],
      catalogVisibility: 'all',
      pricingMultiplier: 0.95, // 5% App Discount
      allowGuestCheckout: true,
      requiresCustomerApproval: false,
      inventoryAllocationPolicy: 'shared',
      paymentMethodIds: ['pm_apple_pay', 'pm_google_pay', 'pm_stripe_card'],
      shippingMethodIds: ['ship_standard_ground', 'ship_express_air'],
      seo: {
        titleTemplate: '%s | Lumina App',
        defaultMetaDescription: 'Lumina Mobile VIP Shopping Experience.',
        robotsRule: 'noindex, nofollow',
        canonicalBaseUrl: 'https://lumina-luxury.com',
      },
      features: {
        wishlist: true,
        reviews: true,
        loyalty: true,
        giftCards: true,
        wallet: true,
        recommendations: true,
        analytics: true,
      },
    },
    activeVersion: 2,
    metrics24h: {
      requestCount: 84210,
      avgLatencyMs: 24,
      conversionRate: 4.65,
      ordersCount: 312,
      revenue: 47910.0,
    },
    createdAt: new Date(Date.now() - 80000000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chan_pos_flagship',
    tenantId: 'tenant_lumina',
    storeId: 'store_flagship_01',
    name: 'NYC Fifth Avenue Boutique POS',
    code: 'POS_NYC_5TH',
    type: 'pos',
    status: 'active',
    apiKeyPrefix: 'sf_live_pos_771',
    configuration: {
      locale: 'en-US',
      currency: 'USD',
      allowedCurrencies: ['USD'],
      allowedLocales: ['en-US'],
      catalogVisibility: 'curated',
      pricingMultiplier: 1.0,
      allowGuestCheckout: true,
      requiresCustomerApproval: false,
      inventoryAllocationPolicy: 'channel_reserved',
      reservedWarehouseId: 'wh_nyc_flagship_01',
      paymentMethodIds: ['pm_pos_terminal_chip', 'pm_cash_register', 'pm_pos_gift_card'],
      shippingMethodIds: ['ship_instore_pickup', 'ship_local_courier'],
      seo: {
        titleTemplate: 'POS Terminal | NYC Store',
        defaultMetaDescription: 'POS In-store register',
        robotsRule: 'noindex, nofollow',
        canonicalBaseUrl: 'https://lumina-luxury.com',
      },
      features: {
        wishlist: false,
        reviews: false,
        loyalty: true,
        giftCards: true,
        wallet: true,
        recommendations: true,
        analytics: true,
      },
    },
    activeVersion: 1,
    metrics24h: {
      requestCount: 14200,
      avgLatencyMs: 18,
      conversionRate: 42.1,
      ordersCount: 94,
      revenue: 31800.0,
    },
    createdAt: new Date(Date.now() - 60000000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chan_marketplace_amazon',
    tenantId: 'tenant_lumina',
    storeId: 'store_flagship_01',
    name: 'Amazon Luxury Stores Marketplace',
    code: 'MKT_AMAZON_US',
    type: 'marketplace',
    status: 'active',
    apiKeyPrefix: 'sf_live_mkt_502',
    configuration: {
      locale: 'en-US',
      currency: 'USD',
      allowedCurrencies: ['USD'],
      allowedLocales: ['en-US'],
      catalogVisibility: 'curated',
      pricingMultiplier: 1.08, // 8% Offset
      allowGuestCheckout: false,
      requiresCustomerApproval: false,
      inventoryAllocationPolicy: 'safety_stock',
      paymentMethodIds: ['pm_marketplace_settlement'],
      shippingMethodIds: ['ship_fba_prime', 'ship_fbm_express'],
      seo: {
        titleTemplate: 'Amazon Storefeed',
        defaultMetaDescription: 'Amazon Luxury Feed',
        robotsRule: 'noindex, nofollow',
        canonicalBaseUrl: 'https://lumina-luxury.com',
      },
      features: {
        wishlist: false,
        reviews: false,
        loyalty: false,
        giftCards: false,
        wallet: false,
        recommendations: false,
        analytics: true,
      },
    },
    activeVersion: 1,
    metrics24h: {
      requestCount: 32900,
      avgLatencyMs: 42,
      conversionRate: 2.1,
      ordersCount: 88,
      revenue: 14920.0,
    },
    createdAt: new Date(Date.now() - 40000000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ChannelStudioPage() {
  const [channels, setChannels] = useState<StorefrontChannel[]>(INITIAL_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(INITIAL_CHANNELS[0].id);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'catalog'
    | 'pricing'
    | 'inventory'
    | 'payments'
    | 'seo_features'
    | 'versions'
    | 'sdk_sandbox'
  >('overview');

  const [notification, setNotification] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateConfig = (partialConfig: Partial<ChannelConfiguration>) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === selectedChannel.id
          ? {
              ...c,
              configuration: { ...c.configuration, ...partialConfig },
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    showNotice(`Channel '${selectedChannel.name}' configuration updated`);
  };

  const handlePublishVersion = () => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === selectedChannel.id
          ? {
              ...c,
              activeVersion: c.activeVersion + 1,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    showNotice(`Published new configuration version v${selectedChannel.activeVersion + 1} to Edge Gateways!`);
  };

  const getChannelIcon = (type: StorefrontChannelType) => {
    switch (type) {
      case 'web':
        return Globe;
      case 'mobile':
      case 'pwa':
        return Smartphone;
      case 'pos':
        return Store;
      case 'marketplace':
      case 'social':
        return ShoppingBag;
      default:
        return Cable;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Banner Alert */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/90 text-white shadow-2xl backdrop-blur-md border border-emerald-400/40 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Cable className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Omnichannel & Headless Experience Studio
              </h1>
              <p className="text-sm text-slate-400">
                Channel-independent commerce engine powering Web, Native Mobile, POS, Marketplace & PWA endpoints.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublishVersion}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 transition"
          >
            <Sparkles className="w-4 h-4" />
            Publish Version (v{selectedChannel.activeVersion + 1})
          </button>
        </div>
      </div>

      {/* Channel Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((chan) => {
          const Icon = getChannelIcon(chan.type);
          const isSelected = chan.id === selectedChannel.id;

          return (
            <div
              key={chan.id}
              onClick={() => setSelectedChannelId(chan.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {chan.status.toUpperCase()}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-semibold text-white truncate">{chan.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{chan.code}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>{(chan.metrics24h.requestCount / 1000).toFixed(1)}k reqs/24h</span>
                <span className="font-semibold text-slate-300">
                  ${chan.metrics24h.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview & Telemetry', icon: Activity },
          { id: 'catalog', label: 'Catalog Visibility', icon: Layers },
          { id: 'pricing', label: 'Pricing & Currency', icon: DollarSign },
          { id: 'inventory', label: 'Inventory Allocation', icon: Boxes },
          { id: 'payments', label: 'Payment & Shipping', icon: CreditCard },
          { id: 'seo_features', label: 'SEO & Feature Flags', icon: Sliders },
          { id: 'versions', label: 'Version Snapshots', icon: History },
          { id: 'sdk_sandbox', label: 'SDK & Developer API', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>24h Request Volume</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {selectedChannel.metrics24h.requestCount.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% vs previous period
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Edge P95 Latency</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">{selectedChannel.metrics24h.avgLatencyMs} ms</p>
              <p className="text-xs text-slate-400">Edge cached via Cloudflare Workers</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{selectedChannel.metrics24h.conversionRate}%</p>
              <p className="text-xs text-slate-400">{selectedChannel.metrics24h.ordersCount} completed orders</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Attributed GMV Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                ${selectedChannel.metrics24h.revenue.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Currency: {selectedChannel.configuration.currency}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Channel Security & Edge Endpoint Routing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400">Primary Public Edge Gateway</span>
                <p className="text-sm font-mono text-cyan-300">
                  https://api.lumina-luxury.com/api/storefront/v1
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400">Scoped Channel Identifier</span>
                <p className="text-sm font-mono text-emerald-300">
                  x-channel-code: {selectedChannel.code}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG SCOPE */}
      {activeTab === 'catalog' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Catalog Visibility & Scoping</h3>
            <p className="text-xs text-slate-400">Control which catalog items are published to this channel endpoint.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'all', title: 'Full Catalog Visibility', desc: 'All published products are available to this channel.' },
              { id: 'curated', title: 'Curated Category Scope', desc: 'Only selected categories and collections are visible.' },
              { id: 'tagged', title: 'Tag-Based Rule', desc: 'Products matching specific channel tags (e.g. #mobile_vip).' },
            ].map((scope) => (
              <div
                key={scope.id}
                onClick={() => handleUpdateConfig({ catalogVisibility: scope.id as any })}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedChannel.configuration.catalogVisibility === scope.id
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <h4 className="text-sm font-semibold text-slate-200">{scope.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{scope.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & CURRENCY */}
      {activeTab === 'pricing' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Channel Pricing Strategy</h3>
            <p className="text-xs text-slate-400">
              Apply dynamic price modifiers or channel-exclusive promotional multipliers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">
                Channel Price Multiplier (Current: {selectedChannel.configuration.pricingMultiplier}x)
              </label>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.01"
                value={selectedChannel.configuration.pricingMultiplier}
                onChange={(e) => handleUpdateConfig({ pricingMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0.80x (-20% Discount)</span>
                <span>1.00x (Base Price)</span>
                <span>1.30x (+30% Markup)</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Base Settlement Currency</label>
              <select
                value={selectedChannel.configuration.currency}
                onChange={(e) => handleUpdateConfig({ currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="USD">USD - United States Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="CAD">CAD - Canadian Dollar (CA$)</option>
                <option value="AUD">AUD - Australian Dollar (AU$)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Inventory Allocation Policy</h3>
            <p className="text-xs text-slate-400">
              Define how stock is reserved and deducted for orders placed via this channel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'shared', title: 'Shared Global Pool', desc: 'Deducts live from total unified warehouse stock.' },
              { id: 'channel_reserved', title: 'Channel Reserved Depot', desc: 'Dedicated warehouse stock allocation (e.g. POS boutique).' },
              { id: 'safety_stock', title: 'Safety Stock Buffer', desc: 'Maintains minimum buffer to prevent overselling on marketplaces.' },
            ].map((policy) => (
              <div
                key={policy.id}
                onClick={() => handleUpdateConfig({ inventoryAllocationPolicy: policy.id as any })}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedChannel.configuration.inventoryAllocationPolicy === policy.id
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <h4 className="text-sm font-semibold text-slate-200">{policy.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{policy.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS & SHIPPING */}
      {activeTab === 'payments' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Payment & Fulfillment Methods</h3>
            <p className="text-xs text-slate-400">Enable or disable specific payment gates and shipping carriers per channel.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-300">Enabled Payment Methods</h4>
            <div className="flex flex-wrap gap-2">
              {['pm_stripe_card', 'pm_apple_pay', 'pm_google_pay', 'pm_paypal', 'pm_klarna', 'pm_pos_terminal_chip', 'pm_cash_register'].map((pm) => (
                <span
                  key={pm}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border ${
                    selectedChannel.configuration.paymentMethodIds.includes(pm)
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SEO & FEATURES */}
      {activeTab === 'seo_features' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">SEO & Channel Feature Toggles</h3>
            <p className="text-xs text-slate-400">Configure search crawler directives and client-side capability flags.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Title Template</label>
              <input
                type="text"
                value={selectedChannel.configuration.seo.titleTemplate}
                onChange={(e) =>
                  handleUpdateConfig({
                    seo: { ...selectedChannel.configuration.seo, titleTemplate: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Robots Meta Rule</label>
              <input
                type="text"
                value={selectedChannel.configuration.seo.robotsRule}
                onChange={(e) =>
                  handleUpdateConfig({
                    seo: { ...selectedChannel.configuration.seo, robotsRule: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-semibold text-slate-300">Experience Feature Capabilities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(selectedChannel.configuration.features).map(([feat, enabled]) => (
                <div
                  key={feat}
                  onClick={() =>
                    handleUpdateConfig({
                      features: { ...selectedChannel.configuration.features, [feat]: !enabled },
                    })
                  }
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                    enabled ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-medium capitalize">{feat}</span>
                  <span className="text-xs font-bold">{enabled ? 'ON' : 'OFF'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Immutable Configuration Snapshots</h3>
            <p className="text-xs text-slate-400">All published changes create versioned snapshots for instant rollback.</p>
          </div>

          <div className="space-y-3">
            {[
              { version: selectedChannel.activeVersion, label: 'Current Live', date: 'Just now', user: 'Platform Superadmin' },
              { version: selectedChannel.activeVersion - 1, label: 'Previous Release', date: '2 days ago', user: 'Ops Lead' },
            ].map((v) => (
              <div key={v.version} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Version v{v.version}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300">
                      {v.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Published by {v.user} • {v.date}</p>
                </div>
                <button
                  onClick={() => showNotice(`Rolled back to v${v.version}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Rollback
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SDK & SANDBOX */}
      {activeTab === 'sdk_sandbox' && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Storefront Client SDK & OpenAPI</h3>
              <p className="text-xs text-slate-400">Connect mobile apps, web apps, and partner integrations.</p>
            </div>
            <a
              href="http://localhost:3000/api/storefront/v1/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              OpenAPI 3.0 Spec
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>TypeScript SDK Initializer</span>
              <button
                onClick={() => {
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedKey ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-cyan-300 overflow-x-auto">
{`import { createStorefrontClient } from '@mavenco/storefront-sdk';

const client = createStorefrontClient({
  endpoint: 'https://api.lumina-luxury.com/api/storefront/v1',
  channelCode: '${selectedChannel.code}',
  locale: '${selectedChannel.configuration.locale}',
  currency: '${selectedChannel.configuration.currency}'
});

// Fetch catalog with channel-exclusive pricing
const { products } = await client.catalog.getProducts();`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
