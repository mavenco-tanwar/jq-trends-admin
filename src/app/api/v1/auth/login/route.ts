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

    // Primary Superadmin Authentication Fast-Path
    if (
      (cleanEmail === 'admin@mavenco.com' && cleanPass === 'admin123') ||
      (cleanEmail === 'superadmin@platform.com' && cleanPass === 'MavencoSuperAdmin@2026!')
    ) {
      return NextResponse.json(
        {
          token: `session_superadmin_${Date.now()}`,
          user: {
            id: 'user_superadmin_01',
            email: cleanEmail,
            name: 'Platform Superadmin',
            role: 'superadmin',
            status: 'active',
            tenantSlug: 'all',
            storeSlug: 'all',
          },
          message: 'Signed in successfully as Platform Superadmin',
        },
        { headers: corsHeaders() }
      );
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection unavailable. Please check MongoDB cluster configuration.' },
        { status: 503, headers: corsHeaders() }
      );
    }

    // 1. Check 'users' collection in MongoDB (Superadmins, Staff, Operators)
    const userDoc = await db.collection('users').findOne({
      email: cleanEmail,
      status: { $ne: 'deleted' },
    });

    if (userDoc) {
      if (userDoc.status === 'suspended') {
        return NextResponse.json(
          { error: 'Your user account is suspended. Please contact platform administration.' },
          { status: 403, headers: corsHeaders() }
        );
      }

      // Verify password strictly against database record
      const isValidPassword =
        (userDoc.password && userDoc.password === cleanPass) ||
        (userDoc.temporaryPassword && userDoc.temporaryPassword === cleanPass);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials.' },
          { status: 401, headers: corsHeaders() }
        );
      }

      const { _id, password: _p, temporaryPassword: _tp, ...cleanUser } = userDoc;
      return NextResponse.json(
        {
          token: `session_${userDoc.roleId || 'user'}_${Date.now()}`,
          user: {
            ...cleanUser,
            id: cleanUser.id || `user_${cleanUser.email}`,
          },
          message: 'Signed in successfully via MongoDB',
        },
        { headers: corsHeaders() }
      );
    }

    // 2. Check 'tenants' collection in MongoDB (Store Owners & Merchant Admins)
    const tenantDoc = await db.collection('tenants').findOne({
      $or: [
        { ownerEmail: cleanEmail },
        { 'contact.email': cleanEmail },
        { slug: cleanEmail.split('@')[0] },
        ...(tenantQuery ? [{ slug: tenantQuery.toLowerCase().trim() }] : []),
      ],
      status: { $ne: 'deleted' },
    });

    if (!tenantDoc) {
      return NextResponse.json(
        { error: `No registered account found in MongoDB for "${cleanEmail}". Please check your email or provision a store in Superadmin.` },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check store lifecycle status in MongoDB
    if (tenantDoc.status === 'suspended') {
      return NextResponse.json(
        { error: `Store "${tenantDoc.name}" is currently suspended in the database. Please contact platform administration.` },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Strictly verify password against MongoDB tenant record
    const permanentPass = tenantDoc.password;
    const temporaryPass = tenantDoc.temporaryPassword;

    const isMatch =
      (permanentPass && cleanPass === permanentPass) ||
      (temporaryPass && cleanPass === temporaryPass);

    if (!isMatch) {
      return NextResponse.json(
        {
          error: `Incorrect password for ${tenantDoc.name}. Please enter your active password or request a reset.`,
        },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Valid authenticated store owner from MongoDB
    const responseUser = {
      id: tenantDoc.id || `user_${tenantDoc.slug}`,
      name: tenantDoc.ownerName || tenantDoc.name,
      email: tenantDoc.ownerEmail || cleanEmail,
      roleId: 'role_owner',
      roleName: 'Store Owner & Administrator',
      tenantId: tenantDoc.id || `store_${tenantDoc.slug}`,
      tenantSlug: tenantDoc.slug,
      isTemporaryPassword: !!tenantDoc.isTemporaryPassword || !permanentPass,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    };

    return NextResponse.json(
      {
        token: `merchant_jwt_${tenantDoc.slug}_${Date.now()}`,
        user: responseUser,
        message: 'Signed in successfully via MongoDB tenant partition',
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
