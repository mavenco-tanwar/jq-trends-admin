import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

const INITIAL_SAAS_REVIEWS = [
  {
    id: 'rev_saas_1',
    author: 'Aarav Singhania',
    role: 'Founder & CEO',
    company: 'Vedic Luxe Botanicals',
    location: 'Bengaluru, India',
    rating: 5,
    highlight: 'Saved ₹3.8L in First 6 Months',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    comment: 'Migrating from Shopify Plus to Mavenco was the best decision for our balance sheet. 0% revenue cut, sub-40ms edge speeds, and our mobile conversion jumped from 1.9% to 3.4%.',
    badge: 'D2C Brand Founder',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_saas_2',
    author: 'Elena Rostova',
    role: 'VP of E-Commerce',
    company: 'Nordic Atelier',
    location: 'London & Dubai',
    rating: 5,
    highlight: 'Instant Visual CMS Freedom',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    comment: 'Our marketing team creates high-converting seasonal lookbooks in minutes without touching code or paying for 8 different Shopify plugins. The multi-currency engine works flawlessly across GCC and Europe.',
    badge: 'Enterprise Scale',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_saas_3',
    author: 'Rohan Deshmukh',
    role: 'Co-Founder & CTO',
    company: 'Apex Athletics',
    location: 'Mumbai, India',
    rating: 5,
    highlight: 'Handled 14,000 Concurrent Drops',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    comment: 'During our festive drop, the flash sale surge mode handled 14k concurrent checkouts on Next.js 16 Edge without a single glitch or timeout. Complete database isolation gives us peace of mind.',
    badge: 'High-Volume D2C',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_saas_4',
    author: 'Meera Nambiar',
    role: 'Creative Director',
    company: 'Samyukta Couture',
    location: 'Delhi NCR',
    rating: 5,
    highlight: 'Bespoke Editorial Aesthetics',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    comment: 'Mavenco gave our luxury brand the couture digital storefront it deserved. The typography, smooth page transitions, and WhatsApp order flow provide a true VIP white-glove experience.',
    badge: 'Luxury Brand Director',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection('saas_reviews');
      const count = await collection.countDocuments();

      if (count === 0) {
        await collection.insertMany(INITIAL_SAAS_REVIEWS);
      }

      const query: Record<string, any> = {};
      if (status !== 'all') {
        query.status = status;
      }

      const reviews = await collection.find(query).sort({ createdAt: -1 }).toArray();
      const clean = reviews.map(({ _id, ...rest }) => rest);
      return NextResponse.json({ data: clean, count: clean.length, source: 'mongodb_atlas' }, { headers: corsHeaders() });
    }
  } catch (err) {
    console.error('MongoDB admin SaaS reviews fetch error:', err);
  }

  return NextResponse.json({ data: INITIAL_SAAS_REVIEWS, count: INITIAL_SAAS_REVIEWS.length, source: 'fallback' }, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const doc = {
      ...body,
      id: body.id || `rev_saas_${Date.now()}`,
      status: body.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('saas_reviews').insertOne(doc);

    return NextResponse.json({ success: true, data: doc, source: 'mongodb_atlas' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    if (!db || !body.id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400, headers: corsHeaders() });
    }

    const { id, _id, ...updates } = body;
    const result = await db.collection('saas_reviews').updateOne(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await getDatabase();
    if (!db || !id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400, headers: corsHeaders() });
    }

    const result = await db.collection('saas_reviews').deleteOne({ id });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
