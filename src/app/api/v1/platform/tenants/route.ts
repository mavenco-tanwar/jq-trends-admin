import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    const db = await getDatabase();
    if (db) {
      const [tDocs, rDocs] = await Promise.all([
        db.collection('tenants').find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).toArray(),
        db.collection('platform_tenants_registry').find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).toArray(),
      ]);

      const mergedMap = new Map<string, any>();
      for (const t of [...rDocs, ...tDocs]) {
        const slug = (t.slug || t.id || '').toLowerCase().trim();
        if (slug && !mergedMap.has(slug)) {
          const { _id, ...clean } = t;
          mergedMap.set(slug, clean);
        }
      }

      const clean = Array.from(mergedMap.values());
      if (clean.length > 0) {
        return NextResponse.json({ data: clean, count: clean.length, source: 'mongodb' }, { headers: corsHeaders() });
      }
    }
  } catch (err) {
    console.error('Failed to load tenants from MongoDB:', err);
  }

  return NextResponse.json({ data: [], source: 'empty' }, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    if (db && body.slug) {
      const cleanSlug = body.slug.toLowerCase().trim();
      const tempPassword = body.temporaryPassword || body.password || `Mavenco@2026!${cleanSlug}`;
      const ownerEmail = body.ownerEmail ? body.ownerEmail.toLowerCase().trim() : null;
      const now = new Date().toISOString();

      const tenantRecord: any = {
        ...body,
        slug: cleanSlug,
        ownerEmail: ownerEmail || body.ownerEmail,
        temporaryPassword: tempPassword,
        password: tempPassword,
        isTemporaryPassword: body.isTemporaryPassword !== undefined ? body.isTemporaryPassword : true,
        passwordUpdatedAt: now,
        updatedAt: now,
      };

      const createdAtVal = tenantRecord.createdAt || now;
      delete tenantRecord.createdAt;
      delete tenantRecord._id;

      const filter = { $or: [{ slug: cleanSlug }, { id: body.id || `store_${cleanSlug}` }] };

      // 1. Upsert Tenant Record in both 'tenants' and 'platform_tenants_registry'
      await Promise.all([
        db.collection('tenants').updateOne(
          filter,
          {
            $set: tenantRecord,
            $setOnInsert: { createdAt: createdAtVal },
          },
          { upsert: true }
        ),
        db.collection('platform_tenants_registry').updateOne(
          filter,
          {
            $set: tenantRecord,
            $setOnInsert: { createdAt: createdAtVal },
          },
          { upsert: true }
        ),
      ]);

      // 2. Upsert Merchant Administrator Account in 'users' collection
      if (ownerEmail) {
        await db.collection('users').updateOne(
          { email: ownerEmail },
          {
            $set: {
              email: ownerEmail,
              name: body.ownerName || body.name || 'Store Owner',
              firstName: body.ownerName ? body.ownerName.split(' ')[0] : body.name || 'Store',
              lastName: body.ownerName ? body.ownerName.split(' ').slice(1).join(' ') || 'Owner' : 'Owner',
              roleId: 'role_owner',
              role: 'owner',
              roleName: 'Store Owner & Administrator',
              tenantId: body.id || `store_${cleanSlug}`,
              tenantSlug: cleanSlug,
              temporaryPassword: tempPassword,
              password: tempPassword,
              isTemporaryPassword: tenantRecord.isTemporaryPassword,
              status: body.status || 'active',
              passwordUpdatedAt: now,
              updatedAt: now,
            },
            $setOnInsert: {
              id: `user_${ownerEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              createdAt: now,
            },
          },
          { upsert: true }
        );
      }

      // 3. Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Superadmin provisioned new store: ${body.name || cleanSlug} (Admin: ${ownerEmail || 'Pending'})`,
        actor: 'superadmin@platform.com',
        tenantId: body.id || `store_${cleanSlug}`,
        tenantName: body.name || cleanSlug,
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Tenant and administrator account persisted in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, slug, ...updates } = body;
    const identifier = (slug || id || '').toLowerCase().trim();
    const safeSlug = identifier.replace(/^store_/, '');
    const now = new Date().toISOString();

    const db = await getDatabase();
    if (db && identifier) {
      const filter = {
        $or: [
          { slug: identifier },
          { id: identifier },
          { slug: safeSlug },
          { id: `store_${safeSlug}` },
        ],
      };

      const setUpdates: any = {
        ...updates,
        updatedAt: now,
      };

      if (updates.password || updates.temporaryPassword) {
        const pass = updates.password || updates.temporaryPassword;
        setUpdates.password = pass;
        setUpdates.temporaryPassword = pass;
        setUpdates.isTemporaryPassword = updates.isTemporaryPassword !== undefined ? updates.isTemporaryPassword : false;
        setUpdates.passwordUpdatedAt = now;
      }

      await Promise.all([
        db.collection('tenants').updateMany(filter, { $set: setUpdates }),
        db.collection('platform_tenants_registry').updateMany(filter, { $set: setUpdates }),
      ]);

      // If password or owner details updated, sync users collection
      const cleanEmail = (updates.ownerEmail || updates.email || '').toLowerCase().trim();
      if (setUpdates.password || cleanEmail || safeSlug) {
        const userFilter: any[] = [];
        if (cleanEmail) userFilter.push({ email: cleanEmail });
        if (safeSlug) userFilter.push({ tenantSlug: safeSlug });

        if (userFilter.length > 0) {
          const userUpdates: any = { updatedAt: now };
          if (setUpdates.password) {
            userUpdates.password = setUpdates.password;
            userUpdates.temporaryPassword = setUpdates.temporaryPassword;
            userUpdates.isTemporaryPassword = setUpdates.isTemporaryPassword;
            userUpdates.passwordUpdatedAt = now;
          }
          if (updates.ownerName) userUpdates.name = updates.ownerName;
          if (cleanEmail) userUpdates.email = cleanEmail;
          if (safeSlug) userUpdates.tenantSlug = safeSlug;

          await db.collection('users').updateMany({ $or: userFilter }, { $set: userUpdates });
        }
      }

      // Record activity in MongoDB
      if (updates.status) {
        await db.collection('platform_activities').insertOne({
          event: `Store ${identifier} status changed to ${updates.status.toUpperCase()}`,
          actor: 'superadmin@platform.com',
          tenantId: identifier,
          tenantName: identifier,
          severity: updates.status === 'suspended' ? 'warning' : 'info',
          ipAddress: '127.0.0.1',
          createdAt: now,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Tenant updated in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = (searchParams.get('id') || searchParams.get('slug') || '').toLowerCase().trim();
    if (!identifier) {
      return NextResponse.json({ error: 'Missing tenant identifier' }, { status: 400, headers: corsHeaders() });
    }

    const safeSlug = identifier.replace(/^store_/, '');
    const now = new Date().toISOString();
    const db = await getDatabase();
    if (db) {
      const filter = {
        $or: [
          { slug: identifier },
          { id: identifier },
          { slug: safeSlug },
          { id: `store_${safeSlug}` },
        ],
      };

      await Promise.all([
        db.collection('tenants').updateMany(filter, {
          $set: { status: 'deleted', deletedAt: now, updatedAt: now },
        }),
        db.collection('platform_tenants_registry').updateMany(filter, {
          $set: { status: 'deleted', deletedAt: now, updatedAt: now },
        }),
      ]);

      // Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Store ${identifier} archived from platform`,
        actor: 'superadmin@platform.com',
        tenantId: identifier,
        tenantName: identifier,
        severity: 'critical',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Tenant archived in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}
