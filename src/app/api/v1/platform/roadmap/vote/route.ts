import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 500 });
    }

    const body = await req.json();
    const { id, delta } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Roadmap item ID required' }, { status: 400 });
    }

    const voteIncrement = delta === -1 ? -1 : 1;

    const collection = db.collection('platform_roadmap');
    const result = await collection.findOneAndUpdate(
      { id: id },
      { $inc: { votes: voteIncrement } },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      votes: result?.votes || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
