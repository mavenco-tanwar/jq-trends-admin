import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const DEFAULT_ROADMAP_ITEMS = [
  {
    id: 'road_shiprocket',
    title: 'Automated Shiprocket & Delhivery Logistics Sync',
    category: 'Fulfillment & Operations',
    status: 'In Progress',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    votes: 148,
    desc: 'Auto-generate AWB tracking numbers and print thermal shipping labels with 1 click directly from the Merchant Admin.',
    createdAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'road_ai_photo',
    title: 'AI Fashion Model Photo Replacement Studio',
    category: 'Visual AI Studio',
    status: 'Planned (Q4)',
    statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    votes: 104,
    desc: 'Swap product mannequins into editorial fashion models across diverse ethnicities with zero studio photography costs.',
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'road_edge_routing',
    title: 'Sub-40ms Anycast Edge Dynamic Routing',
    category: 'Cloud Infrastructure',
    status: 'Live in Production',
    statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    votes: 219,
    desc: 'Global Anycast CDN with sub-40ms TTFB across 280+ edge points of presence on Next.js 16 Edge runtime.',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'road_multi_warehouse',
    title: 'Multi-Warehouse Inventory & Split Fulfillment',
    category: 'Enterprise Scaling',
    status: 'In Progress',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    votes: 82,
    desc: 'Route orders automatically to the nearest regional warehouse (Delhi NCR, Mumbai, Bengaluru) for same-day delivery.',
    createdAt: new Date('2026-02-15').toISOString(),
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: true, data: DEFAULT_ROADMAP_ITEMS, source: 'fallback' });
    }

    const collection = db.collection('platform_roadmap');
    let items = await collection.find({}).sort({ votes: -1 }).toArray();

    if (items.length === 0) {
      await collection.insertMany(DEFAULT_ROADMAP_ITEMS as any);
      items = await collection.find({}).sort({ votes: -1 }).toArray();
    }

    const cleanItems = items.map((doc: any) => ({
      id: doc.id || doc._id.toString(),
      title: doc.title,
      category: doc.category,
      status: doc.status,
      statusColor: doc.statusColor,
      votes: doc.votes || 0,
      desc: doc.desc,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: cleanItems,
      source: 'mongodb_atlas',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, data: DEFAULT_ROADMAP_ITEMS, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    const body = await req.json();
    if (!body.title || !body.desc) {
      return NextResponse.json({ success: false, error: 'Title and description required' }, { status: 400 });
    }

    const newItem = {
      id: `road_${Date.now()}`,
      title: body.title,
      category: body.category || 'Feature Request',
      status: body.status || 'Under Review',
      statusColor: body.statusColor || 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      votes: 1,
      desc: body.desc,
      createdAt: new Date().toISOString(),
    };

    await db.collection('platform_roadmap').insertOne(newItem as any);

    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
