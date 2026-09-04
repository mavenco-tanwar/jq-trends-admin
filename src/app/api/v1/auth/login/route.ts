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
    const now = new Date().toISOString();

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

    // 1. Check 'users' collection in MongoDB
    const userDoc = await db.collection('users').findOne({
      email: cleanEmail,
      status: { $ne: 'deleted' },
    });

    // 2. Check 'tenants' collection in MongoDB
    let tenantDoc = await db.collection('tenants').findOne({
      $or: [
        { ownerEmail: cleanEmail },
        { 'contact.email': cleanEmail },
        { slug: cleanEmail.split('@')[0] },
        ...(tenantQuery ? [{ slug: tenantQuery.toLowerCase().trim() }] : []),
      ],
      status: { $ne: 'deleted' },
    });

    // 3. Fallback check 'platform_tenants_registry'
    if (!tenantDoc) {
      tenantDoc = await db.collection('platform_tenants_registry').findOne({
        $or: [
          { ownerEmail: cleanEmail },
          { 'contact.email': cleanEmail },
          { slug: cleanEmail.split('@')[0] },
          ...(tenantQuery ? [{ slug: tenantQuery.toLowerCase().trim() }] : []),
        ],
        status: { $ne: 'deleted' },
      });
    }

    // If neither user nor tenant found in database
    if (!userDoc && !tenantDoc) {
      return NextResponse.json(
        { error: `No registered account found in MongoDB for "${cleanEmail}". Please check your email or provision a store in Superadmin.` },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check account status
    if (userDoc?.status === 'suspended' || tenantDoc?.status === 'suspended') {
      const storeName = tenantDoc?.name || 'Your account';
      return NextResponse.json(
        { error: `${storeName} is currently suspended in the database. Please contact platform administration.` },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Password verification across users collection and tenants collection
    const userMatches =
      userDoc &&
      ((userDoc.password && userDoc.password === cleanPass) ||
        (userDoc.temporaryPassword && userDoc.temporaryPassword === cleanPass));

    const tenantMatches =
      tenantDoc &&
      ((tenantDoc.password && tenantDoc.password === cleanPass) ||
        (tenantDoc.temporaryPassword && tenantDoc.temporaryPassword === cleanPass));

    if (!userMatches && !tenantMatches) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Active store slug
    const activeSlug = tenantDoc?.slug || userDoc?.tenantSlug || cleanEmail.split('@')[0];
    const activeTenantId = tenantDoc?.id || userDoc?.tenantId || `store_${activeSlug}`;
    const displayName = userDoc?.name || tenantDoc?.ownerName || tenantDoc?.name || 'Store Owner';

    // Synchronize password across users, tenants, and platform_tenants_registry
    try {
      const syncFilter = {
        $or: [
          { slug: activeSlug },
          { id: activeTenantId },
          { ownerEmail: cleanEmail },
        ],
      };

      const syncPayload = {
        password: cleanPass,
        temporaryPassword: cleanPass,
        passwordUpdatedAt: now,
        updatedAt: now,
      };

      await Promise.all([
        db.collection('tenants').updateMany(syncFilter, { $set: syncPayload }),
        db.collection('platform_tenants_registry').updateMany(syncFilter, { $set: syncPayload }),
        db.collection('users').updateOne(
          { email: cleanEmail },
          {
            $set: {
              ...syncPayload,
              tenantSlug: activeSlug,
              tenantId: activeTenantId,
              name: displayName,
              roleId: userDoc?.roleId || 'role_owner',
              role: userDoc?.role || 'owner',
              roleName: userDoc?.roleName || 'Store Owner & Administrator',
              status: 'active',
            },
            $setOnInsert: {
              id: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              createdAt: now,
            },
          },
          { upsert: true }
        ),
      ]);
    } catch (syncErr) {
      console.warn('Auth credentials auto-sync notice:', syncErr);
    }

    const responseUser = {
      id: userDoc?.id || tenantDoc?.id || `user_${activeSlug}`,
      name: displayName,
      email: cleanEmail,
      roleId: userDoc?.roleId || 'role_owner',
      role: userDoc?.role || 'owner',
      roleName: userDoc?.roleName || 'Store Owner & Administrator',
      tenantId: activeTenantId,
      tenantSlug: activeSlug,
      storeSlug: activeSlug,
      isTemporaryPassword: !!(tenantDoc?.isTemporaryPassword || userDoc?.isTemporaryPassword),
      avatar: userDoc?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
    };

    return NextResponse.json(
      {
        token: `merchant_jwt_${activeSlug}_${Date.now()}`,
        user: responseUser,
        message: 'Signed in successfully via MongoDB',
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
