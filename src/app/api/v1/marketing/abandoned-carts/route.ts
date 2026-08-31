import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const SEED_ABANDONED_CARTS = [
  {
    id: 'cart_101',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.s@example.com',
    customerPhone: '9876543210',
    items: [
      { title: 'Hand-Carved Walnut Credenza', quantity: 1, price: 14500, image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200' },
      { title: 'Sculptural Ceramic Pendant', quantity: 2, price: 4200, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200' },
    ],
    totalAmount: 22900,
    abandonedAt: '25m ago',
    recoveryStatus: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cart_102',
    customerName: 'Rohan Mehta',
    customerEmail: 'rohan.mehta@example.com',
    customerPhone: '9823456789',
    items: [
      { title: 'Organic Belgian Linen Duvet Set', quantity: 1, price: 8900, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200' },
    ],
    totalAmount: 8900,
    abandonedAt: '2h ago',
    recoveryStatus: 'email_sent',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'cart_103',
    customerName: 'Priya Sen',
    customerEmail: 'priya.sen@example.com',
    customerPhone: '9765432109',
    items: [
      { title: 'Nordic Minimalist Oak Lounge Chair', quantity: 1, price: 18500, image: 'https://images.unsplash.com/photo-1580481077197-9b2f676f2f2c?w=200' },
    ],
    totalAmount: 18500,
    abandonedAt: '5h ago',
    recoveryStatus: 'recovered',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: true, data: SEED_ABANDONED_CARTS, source: 'fallback' });
    }

    const collection = db.collection('abandoned_carts');
    let carts = await collection.find({}).sort({ createdAt: -1 }).toArray();

    if (carts.length === 0) {
      await collection.insertMany(SEED_ABANDONED_CARTS as any);
      carts = await collection.find({}).sort({ createdAt: -1 }).toArray();
    }

    return NextResponse.json({
      success: true,
      data: carts.map((c: any) => ({
        id: c.id || c._id.toString(),
        customerName: c.customerName,
        customerEmail: c.customerEmail,
        customerPhone: c.customerPhone,
        items: c.items || [],
        totalAmount: c.totalAmount,
        abandonedAt: c.abandonedAt || 'recently',
        recoveryStatus: c.recoveryStatus || 'pending',
      })),
      source: 'mongodb_atlas',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    const body = await req.json();
    const { id, recoveryStatus } = body;

    if (!id || !recoveryStatus) {
      return NextResponse.json({ success: false, error: 'Cart ID and recoveryStatus required' }, { status: 400 });
    }

    await db.collection('abandoned_carts').updateOne(
      { id },
      { $set: { recoveryStatus, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
