import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    const db = await getDatabase();
    if (db) {
      const activeDoc = await db.collection('platform_broadcasts').findOne(
        { status: 'active' },
        { sort: { createdAt: -1 } }
      );

      if (activeDoc) {
        const { _id, ...clean } = activeDoc;
        return NextResponse.json(
          { success: true, broadcast: clean, source: 'mongodb' },
          { headers: corsHeaders() }
        );
      }
    }
  } catch (err: any) {
    console.error('Failed to load platform broadcast from MongoDB:', err);
  }

  return NextResponse.json(
    { success: true, broadcast: null, source: 'empty' },
    { headers: corsHeaders() }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, type = 'info', publishedBy = 'superadmin@platform.com' } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Broadcast message is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanMsg = message.trim();
    const now = new Date().toISOString();
    const id = `bcast_${Date.now()}`;

    const newBroadcast = {
      id,
      message: cleanMsg,
      type: type === 'warning' ? 'warning' : 'info',
      status: 'active',
      active: true,
      publishedBy,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDatabase();
    if (db) {
      // Archive any prior active broadcasts
      await db.collection('platform_broadcasts').updateMany(
        { status: 'active' },
        { $set: { status: 'archived', active: false, archivedAt: now } }
      );

      // Insert new broadcast
      await db.collection('platform_broadcasts').insertOne({ ...newBroadcast });

      // Record activity
      await db.collection('platform_activities').insertOne({
        event: `New platform broadcast announcement published: ${cleanMsg}`,
        actor: publishedBy,
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    return NextResponse.json(
      {
        success: true,
        broadcast: newBroadcast,
        message: 'Global broadcast announcement published successfully',
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to publish broadcast' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE() {
  try {
    const now = new Date().toISOString();
    const db = await getDatabase();
    if (db) {
      await db.collection('platform_broadcasts').updateMany(
        { status: 'active' },
        { $set: { status: 'archived', active: false, archivedAt: now } }
      );

      await db.collection('platform_activities').insertOne({
        event: 'Platform broadcast announcement dismissed/archived',
        actor: 'superadmin@platform.com',
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    return NextResponse.json(
      { success: true, message: 'Platform broadcast archived successfully' },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to archive broadcast' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
