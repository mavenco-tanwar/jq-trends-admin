import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const tenantParam = url.searchParams.get('tenant');
  const cookieTenant = request.cookies.get('jq_saas_active_tenant_slug')?.value;

  let tenantSlug = 'jq-trends';

  // 1. Path-based tenant resolution: /stores/[slug] or /tenant/[slug]
  const pathMatch = url.pathname.match(/^\/(stores|tenant)\/([a-zA-Z0-9_-]+)(.*)/);
  if (pathMatch) {
    tenantSlug = pathMatch[2].toLowerCase();
    const restPath = pathMatch[3] || '/';
    url.pathname = restPath === '' ? '/' : restPath;
    url.searchParams.set('tenant', tenantSlug);

    const response = NextResponse.rewrite(url);
    response.headers.set('x-tenant-slug', tenantSlug);
    response.cookies.set('jq_saas_active_tenant_slug', tenantSlug, { path: '/' });
    return response;
  }

  // 2. Query param resolution: ?tenant=slug
  if (tenantParam) {
    tenantSlug = tenantParam.toLowerCase();
  }
  // 3. Cookie resolution
  else if (cookieTenant && cookieTenant !== 'lumina' && cookieTenant !== 'all') {
    tenantSlug = cookieTenant.toLowerCase();
  }
  // 4. Domain / Subdomain resolution
  else if (hostname.includes('auraliving') || hostname.startsWith('auraliving.')) {
    tenantSlug = 'auraliving';
  } else if (hostname.includes('apexathletics') || hostname.startsWith('apexathletics.')) {
    tenantSlug = 'apexathletics';
  } else if (hostname.includes('jqtrends') || hostname.startsWith('jqtrends.')) {
    tenantSlug = 'jq-trends';
  }

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);
  response.cookies.set('jq_saas_active_tenant_slug', tenantSlug, { path: '/' });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
