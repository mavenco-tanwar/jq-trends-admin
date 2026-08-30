'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Boxes,
  ShoppingCart,
  Users,
  MessageSquare,
  Percent,
  Image as ImageIcon,
  FileText,
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PlatformService, TenantStore } from '@/services/platform';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  isMobileOpen,
  onCloseMobile,
}: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTenant, setActiveTenant] = useState<TenantStore>(PlatformService.getActiveTenant());
  const [isSuperadminAuthority, setIsSuperadminAuthority] = useState(false);

  useEffect(() => {
    setActiveTenant(PlatformService.getActiveTenant());
    const isSuper =
      user?.email?.toLowerCase().includes('superadmin') ||
      pathname?.startsWith('/platform') ||
      PlatformService.getImpersonationState().isImpersonating;
    setIsSuperadminAuthority(Boolean(isSuper));
  }, [user, pathname]);

  const navSections: NavSection[] = [
    ...(isSuperadminAuthority
      ? [
          {
            title: 'SUPERADMIN PLATFORM',
            items: [
              {
                label: 'Platform Control Plane',
                href: '/platform',
                icon: Shield,
                badge: 'SaaS',
                badgeColor: 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40',
              },
            ],
          },
        ]
      : []),
    {
      title: 'DASHBOARD',
      items: [
        { label: 'Overview', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CATALOG',
      items: [
        { label: 'Products', href: '/products', icon: Package, badge: `${activeTenant.metrics?.products || 8}`, badgeColor: 'bg-emerald-500/20 text-emerald-300' },
        { label: 'Categories', href: '/categories', icon: FolderTree },
        { label: 'Collections', href: '/collections', icon: Layers },
        { label: 'Inventory', href: '/inventory', icon: Boxes, badge: '1 Low', badgeColor: 'bg-amber-500/20 text-amber-300' },
      ],
    },
    {
      title: 'SALES & CUSTOMERS',
      items: [
        { label: 'Orders', href: '/orders', icon: ShoppingCart, badge: '3 New', badgeColor: 'bg-rose-500/20 text-rose-300' },
        { label: 'Customers', href: '/customers', icon: Users },
        { label: 'Reviews', href: '/reviews', icon: MessageSquare, badge: '3', badgeColor: 'bg-sky-500/20 text-sky-300' },
        { label: 'Discounts & Coupons', href: '/discounts', icon: Percent },
      ],
    },
    {
      title: 'CONTENT & CMS',
      items: [
        { label: 'Homepage Builder', href: '/content/homepage', icon: Sparkles, badge: 'Visual', badgeColor: 'bg-rose-600 text-white font-bold' },
        { label: 'Pages', href: '/content/pages', icon: FileText },
        { label: 'Block Library', href: '/content/blocks', icon: Layers },
        { label: 'Media Library', href: '/media', icon: ImageIcon },
        { label: 'Navigation Menus', href: '/navigation', icon: Compass },
      ],
    },
    {
      title: 'MARKETING & SEO',
      items: [
        { label: 'Campaigns', href: '/marketing/campaigns', icon: Megaphone },
        { label: 'Coupons', href: '/marketing/coupons', icon: Tag },
        { label: 'SEO Settings', href: '/marketing/seo', icon: SearchIcon },
      ],
    },
    {
      title: 'STORE & THEME',
      items: [
        { label: 'Store Settings', href: '/settings', icon: Sliders },
        { label: 'Theme Tokens', href: '/settings/theme', icon: Palette, badge: activeTenant.planName ? activeTenant.planName.split(' ')[0] : 'Pro', badgeColor: 'bg-rose-500/20 text-rose-300' },
        { label: 'Shipping & Delivery', href: '/settings/shipping', icon: Truck },
        { label: 'Payment Gateways', href: '/settings/payments', icon: CreditCard },
        { label: 'Taxes & GST', href: '/settings/tax', icon: Receipt },
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#12141D] text-slate-300 border-r border-slate-800/90 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/90 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
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
          </div>
        ) : (
          <div
            className="w-9 h-9 mx-auto rounded-xl flex items-center justify-center text-white font-serif font-black text-lg shadow-md"
            style={{ backgroundColor: activeTenant.theme?.primaryColor || '#111111' }}
          >
            {activeTenant.code || activeTenant.name.substring(0, 2).toUpperCase()}
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

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer User Card */}
      <div className="p-3 border-t border-slate-800/90 bg-[#0E1017]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-300 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-slate-500 truncate">{user?.roleName || 'Store Admin'}</div>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-72 h-full z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
