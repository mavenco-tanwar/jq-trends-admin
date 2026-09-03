'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  LayoutTemplate,
  PanelBottom,
  Package,
  Layers,
  Sparkles,
  Boxes,
  ShoppingCart,
  Users,
  MessageSquare,
  Mail,
  Percent,
  Crown,
  Gift,
  Bell,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Compass,
  Megaphone,
  Tag,
  Search as SearchIcon,
  Sliders,
  Palette,
  Truck,
  CreditCard,
  Receipt,
  UserCheck,
  KeyRound,
  Activity,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  HelpCircle,
  FolderTree,
  Shield,
  Zap,
  Store,
  RotateCcw,
  Globe,
  Database,
  Eye,
  Server,
  ArrowRight,
  CheckCircle2,
  X,
  Cpu,
  Lock,
  BarChart3,
  ShoppingBag,
  Wand2,
  Code,
  Cable,
  Workflow,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PlatformService, TenantStore } from '@/services/platform';

interface NavItem {
  label: string;
  href: string;
  tabKey?: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  isExternal?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function AdminSidebarInner({
  isMobileOpen,
  onCloseMobile,
}: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'overview';

  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTenant, setActiveTenant] = useState<TenantStore>(PlatformService.getActiveTenant());
  const [allTenants, setAllTenants] = useState<TenantStore[]>([]);
  const [impersonationState, setImpersonationState] = useState(PlatformService.getImpersonationState());
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);

  const isSuperadminRoute = pathname === '/platform' || pathname.startsWith('/platform');

  useEffect(() => {
    setMounted(true);
    PlatformService.listTenants().then((list) => {
      setAllTenants(list);
      setActiveTenant(PlatformService.getActiveTenant());
      setImpersonationState(PlatformService.getImpersonationState());
    });
  }, [pathname]);

  const handleImpersonateStore = (tenant: TenantStore) => {
    PlatformService.startImpersonation(tenant);
    window.location.href = `/stores/${tenant.slug}`;
  };

  // =========================================================================
  // 1. SUPERADMIN EXCLUSIVE SIDEBAR (When on /platform)
  // =========================================================================
  const superadminNavSections: NavSection[] = [
    {
      title: 'PLATFORM MANAGEMENT',
      items: [
        {
          label: 'Overview',
          href: '/platform?tab=overview',
          tabKey: 'overview',
          icon: LayoutDashboard,
        },
        {
          label: 'Tenant Stores',
          href: '/platform?tab=tenants',
          tabKey: 'tenants',
          icon: Store,
          badge: `${allTenants.length || 4} Stores`,
          badgeColor: 'bg-rose-500/20 text-rose-300 font-bold',
        },
        {
          label: 'Custom Domains & SSL',
          href: '/platform?tab=domains',
          tabKey: 'domains',
          icon: Globe,
          badge: 'Auto SSL',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold',
        },
        {
          label: 'SaaS Billing & Plans',
          href: '/platform?tab=plans',
          tabKey: 'plans',
          icon: CreditCard,
          badge: '3 Tiers',
          badgeColor: 'bg-amber-500/20 text-amber-300 font-bold',
        },
        {
          label: 'Inquiries & Demo Leads',
          href: '/platform?tab=inquiries',
          tabKey: 'inquiries',
          icon: MessageSquare,
          badge: 'Prospects',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold',
        },
        {
          label: 'SaaS Showcase Reviews',
          href: '/platform?tab=reviews',
          tabKey: 'reviews',
          icon: Sparkles,
          badge: 'Live DB',
          badgeColor: 'bg-rose-500/20 text-rose-300 font-bold',
        },
        {
          label: 'Platform Audit Trail',
          href: '/platform?tab=activity',
          tabKey: 'activity',
          icon: Activity,
          badge: 'Audit',
          badgeColor: 'bg-sky-500/20 text-sky-300 font-bold',
        },
      ],
    },
    {
      title: 'PUBLIC STOREFRONTS',
      items: [
        {
          label: 'Platform Showcase',
          href: 'https://mavenco-storefront.vercel.app/',
          icon: Globe,
          isExternal: true,
        },
        {
          label: 'Generic Demo Storefront',
          href: 'https://mavenco-storefront.vercel.app/stores/demo',
          icon: Store,
          isExternal: true,
        },
      ],
    },
  ];

  // =========================================================================
  // 2. STORE MERCHANT WORKSPACE SIDEBAR (When in a store admin)
  // =========================================================================
  const storeMerchantNavSections: NavSection[] = [
    {
      title: 'DASHBOARD',
      items: [{ label: 'Overview', href: '/', icon: LayoutDashboard }],
    },
    {
      title: 'CATALOG',
      items: [
        {
          label: 'Products',
          href: '/products',
          icon: Package,
          badge: mounted ? `${activeTenant.metrics?.products || 16}` : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-300',
        },
        { label: 'Categories', href: '/categories', icon: FolderTree },
        { label: 'Collections', href: '/collections', icon: Layers },
        {
          label: 'Inventory',
          href: '/inventory',
          icon: Boxes,
          badge: '1 Low',
          badgeColor: 'bg-amber-500/20 text-amber-300',
        },
      ],
    },
    {
      title: 'SALES & CUSTOMERS',
      items: [
        { label: 'Orders & Fulfillment', href: '/orders', icon: ShoppingCart },
        {
          label: 'Shipping & Logistics',
          href: '/shipping',
          icon: Truck,
          badge: 'Carriers',
          badgeColor: 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold',
        },
        {
          label: 'Returns & Refunds',
          href: '/returns',
          icon: RotateCcw,
          badge: '2 New',
          badgeColor: 'bg-rose-500/20 text-rose-300',
        },
        { label: 'Customers & CRM', href: '/customers', icon: Users },
        {
          label: 'Marketing & Automations',
          href: '/marketing',
          icon: Mail,
          badge: 'Journeys',
          badgeColor: 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold',
        },
        {
          label: 'Omnichannel Communications',
          href: '/communications',
          icon: Bell,
          badge: 'Gateways',
          badgeColor: 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold',
        },
        {
          label: 'Customer Reviews',
          href: '/reviews',
          icon: MessageSquare,
          badge: '3',
          badgeColor: 'bg-sky-500/20 text-sky-300',
        },
        { label: 'Discounts & Coupons', href: '/discounts', icon: Percent },
        {
          label: 'Multi-Store & Fleet',
          href: '/stores',
          icon: Store,
          badge: 'Fleet',
          badgeColor: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold',
        },
        {
          label: 'Channels & Headless API',
          href: '/channels',
          icon: Cable,
          badge: 'Omni',
          badgeColor: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold',
        },
        {
          label: 'Invoices & Documents',
          href: '/invoices',
          icon: FileText,
          badge: 'PDF',
          badgeColor: 'bg-gradient-to-r from-rose-500 to-indigo-500 text-white font-bold',
        },
        {
          label: 'Payments & Gateways',
          href: '/payments',
          icon: CreditCard,
          badge: 'Online',
          badgeColor: 'bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-bold',
        },
        {
          label: 'Finance & Ledger',
          href: '/finance',
          icon: DollarSign,
          badge: 'GL',
          badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold',
        },
        {
          label: 'Plans & SaaS Billing',
          href: '/billing',
          icon: Crown,
          badge: 'SaaS',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-indigo-500 text-white font-bold',
        },
        {
          label: 'Tax & Compliance',
          href: '/tax',
          icon: Receipt,
          badge: 'GST/VAT',
          badgeColor: 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold',
        },
        {
          label: 'Gift Cards & Vouchers',
          href: '/gift-cards',
          icon: Gift,
          badge: 'Vouchers',
          badgeColor: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold',
        },
        {
          label: 'Loyalty & VIP Club',
          href: '/loyalty',
          icon: Crown,
          badge: 'VIP Club',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold',
        },
        {
          label: 'Search & Discovery Studio',
          href: '/marketing/search',
          icon: SearchIcon,
          badge: 'Smart Discovery',
          badgeColor: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold',
        },
        { label: 'Advanced Analytics', href: '/analytics', icon: BarChart3 },
        {
          label: 'AI Intelligence Studio',
          href: '/ai',
          icon: Sparkles,
          badge: 'AI Gen',
          badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold',
        },
      ],
    },
    {
      title: 'APPEARANCE & THEME',
      items: [
        {
          label: 'Theme & Design Studio',
          href: '/appearance/theme',
          icon: Palette,
          badge: 'Design System',
          badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold',
        },
        {
          label: 'Product Card Builder',
          href: '/appearance/product-cards',
          icon: ShoppingBag,
          badge: 'Catalog Card',
          badgeColor: 'bg-rose-600 text-white font-bold',
        },
      ],
    },
    {
      title: 'CONTENT & CMS',
      items: [
        {
          label: 'Header & Navbar Builder',
          href: '/content/header',
          icon: LayoutTemplate,
          badge: 'Navbar',
          badgeColor: 'bg-indigo-600 text-white font-bold',
        },
        {
          label: 'Footer Builder',
          href: '/content/footer',
          icon: PanelBottom,
          badge: 'Footer',
          badgeColor: 'bg-emerald-600 text-white font-bold',
        },
        {
          label: 'Homepage Builder',
          href: '/content/homepage',
          icon: Sparkles,
          badge: 'Visual',
          badgeColor: 'bg-rose-600 text-white font-bold',
        },
        {
          label: 'Collection Pages',
          href: '/content/collections',
          icon: Layers,
          badge: 'PLP Studio',
          badgeColor: 'bg-amber-600 text-white font-bold',
        },
        {
          label: 'Product Page Builder',
          href: '/content/product-page',
          icon: Package,
          badge: 'PDP',
          badgeColor: 'bg-amber-500/20 text-amber-300 font-bold',
        },
        {
          label: 'Collection Page Builder',
          href: '/content/collection-page',
          icon: FolderTree,
          badge: 'PLP',
          badgeColor: 'bg-sky-500/20 text-sky-300 font-bold',
        },
        {
          label: 'Brand Story & About',
          href: '/content/about-page',
          icon: FileText,
          badge: 'Story',
          badgeColor: 'bg-pink-500/20 text-pink-300 font-bold',
        },
        {
          label: 'Contact & Store Locator',
          href: '/content/contact-page',
          icon: Store,
          badge: 'Stores',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold',
        },
        { label: 'Custom Pages', href: '/content/pages', icon: FileText },
        { label: 'Block Library', href: '/content/blocks', icon: Layers },
        { label: 'Media Library', href: '/media', icon: ImageIcon },
        { label: 'Navigation Menus', href: '/navigation', icon: Compass },
      ],
    },
    {
      title: 'MARKETING & AUTOMATION',
      items: [
        {
          label: 'Abandoned Carts',
          href: '/marketing/abandoned-carts',
          icon: ShoppingBag,
          badge: '4 Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 font-bold',
        },
        {
          label: 'AI Studio',
          href: '/marketing/ai',
          icon: Wand2,
          badge: 'AI',
          badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold',
        },
        { label: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone },
        { label: 'Coupons', href: '/marketing/coupons', icon: Tag },
        { label: 'SEO Settings', href: '/marketing/seo', icon: SearchIcon },
      ],
    },
    {
      title: 'STORE & THEME',
      items: [
        { label: 'Store Settings', href: '/settings', icon: Sliders },
        {
          label: 'Theme Tokens',
          href: '/settings/theme',
          icon: Palette,
          badge: activeTenant.planName ? activeTenant.planName.split(' ')[0] : 'Pro',
          badgeColor: 'bg-rose-500/20 text-rose-300',
        },
        { label: 'Shipping & Delivery', href: '/settings/shipping', icon: Truck },
        { label: 'Payment Gateways', href: '/settings/payments', icon: CreditCard },
        { label: 'Taxes & GST', href: '/settings/tax', icon: Receipt },
        { label: 'REST API & Webhooks', href: '/settings/api', icon: Code },
      ],
    },
    {
      title: 'ECOSYSTEM & DEVELOPERS',
      items: [
        {
          label: 'Integration Hub',
          href: '/integrations',
          icon: Cable,
          badge: 'Sync Hub',
          badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold',
        },
        {
          label: 'No-Code Automations',
          href: '/automations',
          icon: Workflow,
          badge: 'WHEN-IF',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold',
        },
        {
          label: 'App Marketplace',
          href: '/apps',
          icon: Package,
          badge: 'Verified',
          badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold',
        },
        {
          label: 'Developer Portal & APIs',
          href: '/developers',
          icon: Code,
          badge: 'OpenAPI',
          badgeColor: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold',
        },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { label: 'Admin Users', href: '/users', icon: UserCheck },
        { label: 'Roles & RBAC', href: '/roles', icon: KeyRound },
        { label: 'Activity Logs', href: '/activity', icon: Activity },
      ],
    },
  ];

  const currentSections = isSuperadminRoute ? superadminNavSections : storeMerchantNavSections;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#10121A] text-slate-300 border-r border-slate-800/90 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/90 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            {isSuperadminRoute ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 via-amber-600 to-rose-700 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-950/60 shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-white text-sm tracking-wide">
                    MAVENCO SAAS
                  </div>
                  <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                    Superadmin Control
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-serif font-black text-lg shadow-md shrink-0"
                  style={{ backgroundColor: activeTenant.theme?.primaryColor || '#111111' }}
                >
                  {activeTenant.code || activeTenant.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-serif font-bold text-white text-sm tracking-wide truncate">
                    {activeTenant.name}
                  </div>
                  <div className="text-[10px] text-rose-400 font-semibold tracking-wider uppercase truncate">
                    {activeTenant.planName || 'Merchant Console'}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mx-auto">
            {isSuperadminRoute ? (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-serif font-black text-lg shadow-md"
                style={{ backgroundColor: activeTenant.theme?.primaryColor || '#111111' }}
              >
                {activeTenant.code || activeTenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Return to Superadmin Button when inside a Store Workspace */}
      {!isSuperadminRoute && (user?.email?.toLowerCase().includes('superadmin') || impersonationState.isImpersonating) && (
        <div className="px-3 pt-3">
          <Link
            href="/platform?tab=overview"
            className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-rose-950/60 to-amber-950/40 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span>Superadmin Platform</span>}
            </div>
            {!isCollapsed && <ArrowRight className="w-3.5 h-3.5 text-rose-400" />}
          </Link>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 scrollbar-thin">
        {currentSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isTabMatch = isSuperadminRoute && item.tabKey ? activeTabParam === item.tabKey : false;
                const isExactMatch = !isSuperadminRoute && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
                const isActive = isTabMatch || isExactMatch;
                const Icon = item.icon;

                if (item.isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={onCloseMobile}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all group"
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
                      {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!isCollapsed && <ExternalLink className="w-3 h-3 text-slate-500" />}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-600/15 text-rose-300 font-bold border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span
                        suppressHydrationWarning
                        className={`text-[10px] px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Live Infrastructure Telemetry Card (Superadmin Mode Only) */}
        {isSuperadminRoute && !isCollapsed && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Cluster Telemetry</span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <button
              onClick={() => setIsClusterModalOpen(true)}
              type="button"
              className="w-full text-left p-3 rounded-xl bg-[#0D0F16] border border-slate-800 hover:border-slate-700 transition-all space-y-2 group shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-semibold text-slate-200 text-[11px]">Multi-Tenant DBs</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  {allTenants.length} Partitions
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200 text-[11px]">Edge CDN Latency</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  24ms
                </span>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-rose-400 font-medium">
                <span>View Diagnostics</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* Quick Impersonate Stores List (Superadmin Mode Only) */}
        {isSuperadminRoute && !isCollapsed && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Quick Impersonate</span>
              <span className="text-[9px] text-rose-400 font-mono">Store Admin</span>
            </div>

            <div className="space-y-1">
              {allTenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleImpersonateStore(t)}
                  type="button"
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0C0E14] hover:bg-slate-800/80 text-left transition-all border border-slate-800 text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: t.theme?.primaryColor || '#111111' }}
                    />
                    <span className="text-slate-300 group-hover:text-white truncate font-medium">
                      {t.name}
                    </span>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer User Card */}
      <div className="p-3 border-t border-slate-800/90 bg-[#0A0C10]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-300 font-bold flex items-center justify-center text-xs shrink-0">
                {isSuperadminRoute ? '👑' : user?.firstName?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {isSuperadminRoute ? 'Super Admin' : `${user?.firstName || 'Store'} ${user?.lastName || 'Admin'}`}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {isSuperadminRoute ? 'Platform Owner' : user?.roleName || 'Store Admin'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Infrastructure Diagnostics Modal */}
      {isClusterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161822] border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cluster &amp; Infrastructure Health</h3>
                  <p className="text-[11px] text-slate-400">Multi-tenant hardware isolation &amp; Edge routing</p>
                </div>
              </div>
              <button
                onClick={() => setIsClusterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#10121A] rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    MongoDB Atlas Primary Cluster
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono text-[10px]">
                    HEALTHY (99.98%)
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Zero shared tables. Every tenant is provisioned with an isolated logical partition with role-restricted RBAC keys.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Database Partitions ({allTenants.length})
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {allTenants.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#10121A] border border-slate-800/80 font-mono text-[11px]"
                    >
                      <span className="text-purple-300">{t.databaseName}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-sans text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Isolated
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#10121A] rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Global Edge Anycast Ingress
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">24ms TTFB</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Automatic wildcard SSL certificates with TLS 1.3 encryption and edge-cached dynamic CMS blocks.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsClusterModalOpen(false)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block shrink-0 transition-all duration-200 ${isCollapsed ? 'w-18' : 'w-64'}`}>
        <div className="fixed top-0 bottom-0 z-30 h-screen transition-all duration-200" style={{ width: isCollapsed ? '4.5rem' : '16rem' }}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export function AdminSidebar(props: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  return (
    <Suspense fallback={<aside className="hidden md:block w-64 bg-[#10121A] shrink-0 h-screen" />}>
      <AdminSidebarInner {...props} />
    </Suspense>
  );
}
