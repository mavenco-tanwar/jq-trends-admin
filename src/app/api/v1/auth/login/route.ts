import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, tenant: tenantQuery } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = password.trim();

    // 1. Superadmin Authentication Check
    if (
      cleanEmail === 'superadmin@platform.com' ||
      cleanEmail === 'admin@mavenco.com' ||
      cleanEmail === 'superadmin@mavenco.com'
    ) {
      if (
        cleanPass === 'MavencoSuperAdmin@2026!' ||
        cleanPass === 'admin123' ||
        cleanPass === 'superadmin' ||
        cleanPass === 'Mavenco@2026'
      ) {
        return NextResponse.json(
          {
            token: `superadmin_session_${Date.now()}`,
            user: {
              id: 'user_superadmin',
              name: 'Super Administrator',
              email: cleanEmail,
              roleId: 'role_superadmin',
              roleName: 'Platform Superadmin',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
            },
          },
          { headers: corsHeaders() }
        );
      } else {
        return NextResponse.json(
          { error: 'Invalid superadmin password. Please check your credentials.' },
          { status: 401, headers: corsHeaders() }
        );
      }
    }

    // 2. Query MongoDB Atlas for Merchant / Tenant User
    const db = await getDatabase();
    let tenantDoc: any = null;

    if (db) {
      // Find tenant by email, or slug match
      tenantDoc = await db.collection('tenants').findOne({
        $or: [
          { ownerEmail: cleanEmail },
          { 'contact.email': cleanEmail },
          { slug: cleanEmail.split('@')[0] },
          ...(tenantQuery ? [{ slug: tenantQuery.toLowerCase().trim() }] : []),
        ],
      });
    }

    // Fallback baseline stores if DB not queried yet
    if (!tenantDoc) {
      if (cleanEmail === 'demo@mavenco.com' || cleanEmail.includes('demo')) {
        tenantDoc = {
          id: 'store_demo',
          name: 'Demo Store',
          slug: 'demo',
          ownerEmail: 'demo@mavenco.com',
          status: 'active',
          temporaryPassword: 'Mavenco@2026!demo',
        };
      } else if (cleanEmail.includes('auraliving') || cleanEmail === 'elena@auraliving.com') {
        tenantDoc = {
          id: 'store_aura_living',
          name: 'Aura Living',
          slug: 'auraliving',
          ownerEmail: 'elena@auraliving.com',
          status: 'active',
          temporaryPassword: 'Mavenco@2026!auraliving',
        };
      } else if (cleanEmail.includes('apexathletics') || cleanEmail === 'marcus@apexathletics.com') {
        tenantDoc = {
          id: 'store_apex_athletics',
          name: 'Apex Athletics',
          slug: 'apexathletics',
          ownerEmail: 'marcus@apexathletics.com',
          status: 'active',
          temporaryPassword: 'Mavenco@2026!apexathletics',
        };
      } else if (cleanEmail.includes('lumina') || cleanEmail === 'sophia@luminaatelier.com') {
        tenantDoc = {
          id: 'store_lumina_atelier',
          name: 'Lumina Atelier',
          slug: 'lumina',
          ownerEmail: 'sophia@luminaatelier.com',
          status: 'trial',
          temporaryPassword: 'Mavenco@2026!lumina',
        };
      }
    }

    if (!tenantDoc) {
      return NextResponse.json(
        { error: `No merchant store account found for "${cleanEmail}". Please check your email or provision a store in Superadmin.` },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if store is suspended
    if (tenantDoc.status === 'suspended') {
      return NextResponse.json(
        { error: `Store "${tenantDoc.name}" is currently suspended. Please contact platform administration to reactivate your store.` },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Strict Password Validation
    const permanentPass = tenantDoc.password;
    const currentTempPass = tenantDoc.temporaryPassword;
    const defaultSlugPass = `Mavenco@2026!${tenantDoc.slug}`;

    let isPasswordValid = false;

    if (permanentPass && cleanPass === permanentPass) {
      // Valid permanent password
      isPasswordValid = true;
    } else if (currentTempPass && cleanPass === currentTempPass) {
      // Valid current temporary password
      isPasswordValid = true;
    } else if (!permanentPass && !currentTempPass && cleanPass === defaultSlugPass) {
      // Default initial provision password
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: `Incorrect password for ${tenantDoc.name}. If you reset your password, please use the latest temporary password sent to your email.`,
        },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Authentication Success
    const responseUser = {
      id: tenantDoc.id || `user_${tenantDoc.slug}`,
      name: tenantDoc.ownerName || tenantDoc.name,
      email: tenantDoc.ownerEmail || cleanEmail,
      roleId: 'role_owner',
      roleName: 'Store Owner & Administrator',
      tenantId: tenantDoc.id,
      tenantSlug: tenantDoc.slug,
      isTemporaryPassword: !!tenantDoc.isTemporaryPassword || !permanentPass,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    };

    return NextResponse.json(
      {
        token: `merchant_jwt_${tenantDoc.slug}_${Date.now()}`,
        user: responseUser,
        message: 'Signed in successfully',
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
