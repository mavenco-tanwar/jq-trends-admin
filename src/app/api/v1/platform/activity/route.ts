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

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { activities: [], error: 'Database unavailable' },
        { status: 503, headers: corsHeaders() }
      );
    }

    const logs = await db
      .collection('platform_activities')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const formattedLogs = logs.map((log) => ({
      id: log._id.toString(),
      event: log.event,
      actor: log.actor || 'superadmin@platform.com',
      tenantId: log.tenantId,
      tenantName: log.tenantName,
      ipAddress: log.ipAddress || '127.0.0.1',
      severity: log.severity || 'info',
      timestamp: log.createdAt ? timeAgo(log.createdAt) : 'Recently',
      createdAt: log.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({ activities: formattedLogs }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ activities: [], error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, actor, tenantId, tenantName, severity = 'info', ipAddress = '127.0.0.1' } = body;

    if (!event) {
      return NextResponse.json({ error: 'event description is required' }, { status: 400, headers: corsHeaders() });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503, headers: corsHeaders() });
    }

    const newActivity = {
      event,
      actor: actor || 'superadmin@platform.com',
      tenantId: tenantId || null,
      tenantName: tenantName || null,
      severity,
      ipAddress,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('platform_activities').insertOne(newActivity);

    return NextResponse.json(
      {
        success: true,
        activity: {
          id: result.insertedId.toString(),
          ...newActivity,
          timestamp: 'Just now',
        },
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
