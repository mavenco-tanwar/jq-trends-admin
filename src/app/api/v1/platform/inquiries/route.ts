import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { success: true, data: [], source: 'fallback_empty' },
        { headers: corsHeaders() }
      );
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('mavenco_platform');
    const collection = db.collection('contact_inquiries');

    const inquiries = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    const formatted = inquiries.map((doc: any) => ({
      id: doc._id?.toString() || `inq_${Date.now()}`,
      fullName: doc.fullName || 'Anonymous Prospect',
      email: doc.email || '',
      phone: doc.phone || '',
      brandName: doc.brandName || 'Not specified',
      interestedPlan: doc.interestedPlan || 'Professional Scale',
      message: doc.message || '',
      source: doc.source || 'Storefront Demo Modal',
      status: doc.status || 'new',
      createdAt: doc.createdAt || new Date().toISOString(),
      ipAddress: doc.ipAddress || '127.0.0.1',
    }));

    return NextResponse.json(
      { success: true, data: formatted, total: formatted.length },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('Error fetching platform inquiries:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch inquiries', data: [] },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: 'Database URI not configured' },
        { status: 500, headers: corsHeaders() }
      );
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('mavenco_platform');
    const collection = db.collection('contact_inquiries');

    let query: any = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { createdAt: id };
    }

    const res = await collection.updateOne(query, {
      $set: { status, updatedAt: new Date().toISOString() },
    });

    await client.close();

    return NextResponse.json(
      { success: true, modifiedCount: res.modifiedCount },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('Error updating inquiry status:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update inquiry status' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: 'Database URI not configured' },
        { status: 500, headers: corsHeaders() }
      );
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('mavenco_platform');
    const collection = db.collection('contact_inquiries');

    let query: any = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { createdAt: id };
    }

    const res = await collection.deleteOne(query);
    await client.close();

    return NextResponse.json(
      { success: true, deletedCount: res.deletedCount },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('Error deleting inquiry:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete inquiry' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
