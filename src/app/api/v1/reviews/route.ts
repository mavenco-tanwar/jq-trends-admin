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

const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    author: 'Priya Sharma',
    location: 'Mumbai, India',
    rating: 5,
    store: 'Muskan Clothing',
    storeSlug: 'muskan-clothing',
    product: 'Pure Mulberry Silk Banarasi Saree',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    comment: 'The saree drape and antique zari craftsmanship are out of this world! Checkout was under 3 seconds on mobile.',
    badge: 'Verified Buyer',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_2',
    author: 'Kavita Mehta',
    location: 'Delhi NCR',
    rating: 5,
    store: 'Muskan Clothing',
    storeSlug: 'muskan-clothing',
    product: 'Artisanal Embroidered Velvet Blazer',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    comment: 'Super fast delivery and flawless fit. The velvet has a rich luster that received endless compliments at the wedding.',
    badge: 'Verified Buyer',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_3',
    author: 'Astrid Lindqvist',
    location: 'Stockholm, Sweden',
    rating: 5,
    store: 'Aura Living',
    storeSlug: 'auraliving',
    product: 'Handcrafted Fluted Ceramic Vase',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=800&auto=format&fit=crop',
    comment: 'The matte chalk texture is so soothing. Packaged with zero plastic and arrived in pristine condition.',
    badge: 'Verified Buyer',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_4',
    author: 'Vikram Rajput',
    location: 'Bengaluru, India',
    rating: 5,
    store: 'Apex Athletics',
    storeSlug: 'apexathletics',
    product: 'Apex Pro Seamless High-Waist Leggings',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    comment: '100% squat proof and holds shape after 20+ intense training washes. Best activewear brand in India right now.',
    badge: 'Verified Athlete',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeSlug = searchParams.get('store') || searchParams.get('tenant');
  const status = searchParams.get('status') || 'all';

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection('reviews');
      const count = await collection.countDocuments();

      if (count === 0) {
        await collection.insertMany(INITIAL_REVIEWS);
      }

      const query: Record<string, any> = {};
      if (status !== 'all') {
        query.status = status;
      }
      if (storeSlug) {
        query.$or = [{ storeSlug: storeSlug.toLowerCase() }, { store: { $regex: storeSlug, $options: 'i' } }];
      }

      const reviews = await collection.find(query).sort({ createdAt: -1 }).toArray();
      const clean = reviews.map(({ _id, ...rest }) => rest);
      return NextResponse.json({ data: clean, count: clean.length, source: 'mongodb_atlas' }, { headers: corsHeaders() });
    }
  } catch (err) {
    console.error('MongoDB admin reviews fetch error:', err);
  }

  return NextResponse.json({ data: INITIAL_REVIEWS, count: INITIAL_REVIEWS.length, source: 'fallback' }, { headers: corsHeaders() });
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
      id: body.id || `rev_${Date.now()}`,
      status: body.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('reviews').insertOne(doc);

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
    const result = await db.collection('reviews').updateOne(
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

    const result = await db.collection('reviews').deleteOne({ id });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
