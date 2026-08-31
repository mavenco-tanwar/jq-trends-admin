import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || searchParams.get('tenantSlug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Tenant slug is required' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'MongoDB database connection unavailable' }, { status: 500 });
    }

    // Query all isolated collections for this store
    const tenantConfig = await db.collection('tenants').findOne({ slug });
    const products = await db.collection('products').find({ $or: [{ storeSlug: slug }, { tenantId: tenantConfig?.id }] }).toArray();
    const categories = await db.collection('categories').find({ $or: [{ storeSlug: slug }, { tenantId: tenantConfig?.id }] }).toArray();
    const orders = await db.collection('orders').find({ $or: [{ storeSlug: slug }, { tenantId: tenantConfig?.id }] }).toArray();
    const reviews = await db.collection('reviews').find({ $or: [{ storeSlug: slug }, { tenantId: tenantConfig?.id }] }).toArray();

    const snapshotPayload = {
      _meta: {
        platform: 'Mavenco Multi-Tenant Commerce',
        version: '3.4.0',
        exportedAt: new Date().toISOString(),
        cluster: 'MongoDB Atlas Dedicated Partition',
        tenantSlug: slug,
        tenantName: tenantConfig?.name || slug,
        stats: {
          productsCount: products.length,
          categoriesCount: categories.length,
          ordersCount: orders.length,
          reviewsCount: reviews.length,
        },
      },
      tenant: tenantConfig,
      products,
      categories,
      orders,
      reviews,
    };

    const fileName = `mavenco_snapshot_${slug}_${new Date().toISOString().split('T')[0]}.json`;

    return new Response(JSON.stringify(snapshotPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Database snapshot generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
