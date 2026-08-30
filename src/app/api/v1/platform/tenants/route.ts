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
      const tenants = await db
        .collection('tenants')
        .find({ status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 })
        .toArray();

      if (tenants.length > 0) {
        const clean = tenants.map(({ _id, ...rest }) => rest);
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
      await db.collection('tenants').updateOne(
        { slug: cleanSlug },
        {
          $set: {
            ...body,
            slug: cleanSlug,
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      // Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Superadmin provisioned new store: ${body.name || cleanSlug}`,
        actor: 'superadmin@platform.com',
        tenantId: body.id || `store_${cleanSlug}`,
        tenantName: body.name || cleanSlug,
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, message: 'Tenant persisted in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, slug, ...updates } = body;
    const identifier = slug || id;

    const db = await getDatabase();
    if (db && identifier) {
      await db.collection('tenants').updateOne(
        { $or: [{ slug: identifier }, { id: identifier }] },
        {
          $set: {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      // Record activity in MongoDB
      if (updates.status) {
        await db.collection('platform_activities').insertOne({
          event: `Store ${identifier} status changed to ${updates.status.toUpperCase()}`,
          actor: 'superadmin@platform.com',
          tenantId: identifier,
          tenantName: identifier,
          severity: updates.status === 'suspended' ? 'warning' : 'info',
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
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
    const identifier = searchParams.get('id') || searchParams.get('slug');
    if (!identifier) {
      return NextResponse.json({ error: 'Missing tenant identifier' }, { status: 400, headers: corsHeaders() });
    }

    const db = await getDatabase();
    if (db) {
      await db.collection('tenants').updateOne(
        { $or: [{ slug: identifier }, { id: identifier }] },
        {
          $set: {
            status: 'deleted',
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );

      // Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Store ${identifier} archived from platform`,
        actor: 'superadmin@platform.com',
        tenantId: identifier,
        tenantName: identifier,
        severity: 'critical',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, message: 'Tenant archived in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}
