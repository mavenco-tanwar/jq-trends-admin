import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug, x-user-name, X-Store-ID, X-API-Key, X-Tenant-Slug, x-store-id, x-api-key, *',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTenant =
      searchParams.get('tenant') ||
      searchParams.get('store') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('X-Tenant-Slug') ||
      '';

    const tenantSlug = rawTenant.trim().toLowerCase();
    const cleanTenant = tenantSlug.replace(/^(store_|_)/, '').trim().toLowerCase();

    let tenantAliases = new Set<string>();
    if (tenantSlug) tenantAliases.add(tenantSlug);
    if (cleanTenant) tenantAliases.add(cleanTenant);

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: true, data: [] }, { headers: corsHeaders() });
    }

    if (cleanTenant && cleanTenant !== 'all') {
      try {
        const tenantDoc = await db.collection('tenants').findOne({
          $or: [
            { slug: cleanTenant },
            { tenantId: cleanTenant },
            { id: cleanTenant },
            { id: `store_${cleanTenant}` },
            { id: `store__${cleanTenant}` },
            { slug: new RegExp(cleanTenant, 'i') },
            { id: new RegExp(cleanTenant, 'i') },
          ],
        });
        if (tenantDoc) {
          if (tenantDoc.slug) tenantAliases.add(tenantDoc.slug.toLowerCase());
          if (tenantDoc.tenantId) tenantAliases.add(tenantDoc.tenantId.toLowerCase());
          if (tenantDoc.id) {
            const idStr = String(tenantDoc.id).toLowerCase();
            tenantAliases.add(idStr);
            tenantAliases.add(idStr.replace(/^store_/, ''));
            tenantAliases.add(idStr.replace(/^store__/, ''));
          }
        }
      } catch (err) {
        console.warn('[Admin Collections API] Tenant alias resolution warning:', err);
      }
    }

    let query: Record<string, any> = {};
    if (cleanTenant && cleanTenant !== 'all') {
      const aliasList = Array.from(tenantAliases);
      const orConditions: any[] = [];
      for (const a of aliasList) {
        orConditions.push(
          { tenantId: a },
          { tenantId: `store_${a}` },
          { tenantId: `store__${a}` },
          { tenantSlug: a },
          { tenantSlug: `store_${a}` },
          { tenantSlug: `store__${a}` },
          { storeSlug: a },
          { storeSlug: `store_${a}` },
          { storeSlug: `store__${a}` }
        );
      }
      query = { $or: orConditions };
    }

    let docs = await db.collection('collections').find(query).sort({ createdAt: -1 }).toArray();
    if (docs.length === 0 && (!cleanTenant || cleanTenant === 'all' || cleanTenant === 'demo' || cleanTenant === 'jq-trends')) {
      docs = await db.collection('collections').find({}).sort({ createdAt: -1 }).toArray();
    }

    // Enrich collections with real assigned product images if available
    for (const doc of docs) {
      if (Array.isArray(doc.productIds) && doc.productIds.length > 0) {
        try {
          const firstProd = await db.collection('products').findOne({
            $or: [
              { id: { $in: doc.productIds } },
              { slug: { $in: doc.productIds } },
            ],
          });
          if (firstProd) {
            const prodImg =
              Array.isArray(firstProd.images) && firstProd.images.length > 0
                ? (typeof firstProd.images[0] === 'string' ? firstProd.images[0] : firstProd.images[0]?.url)
                : firstProd.image;
            if (prodImg) {
              (doc as any).productImage = prodImg;
              if (!doc.imageUrl || doc.imageUrl.includes('unsplash.com')) {
                doc.imageUrl = prodImg;
              }
            }
          }
        } catch {}
      }
    }

    const clean = docs.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id?.toString(),
    }));

    return NextResponse.json({ success: true, data: clean, count: clean.length }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const rawTenant =
      body.tenantSlug ||
      body.storeSlug ||
      body.tenantId ||
      searchParams.get('tenant') ||
      req.headers.get('x-tenant-slug') ||
      req.headers.get('X-Tenant-Slug') ||
      'jq-trends';

    const tenantSlug = rawTenant.trim().toLowerCase();
    const cleanTenant = tenantSlug.replace(/^(store_|_)/, '').trim().toLowerCase();

    const db = await getDatabase();
    const now = new Date().toISOString();
    const cleanId = body.id || `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanTitle = body.title || body.name || 'New Collection';
    const cleanSlug = body.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newCollection = {
      ...body,
      id: cleanId,
      title: cleanTitle,
      slug: cleanSlug,
      tenantId: `store_${cleanTenant || 'jq-trends'}`,
      tenantSlug: cleanTenant || 'jq-trends',
      storeSlug: cleanTenant || 'jq-trends',
      productIds: Array.isArray(body.productIds) ? body.productIds : [],
      productCount: Array.isArray(body.productIds) ? body.productIds.length : (body.productCount || 0),
      createdAt: body.createdAt || now,
      updatedAt: now,
    };
    delete (newCollection as any)._id;

    if (db) {
      await db.collection('collections').updateOne(
        { $or: [{ id: cleanId }, { slug: cleanSlug, tenantSlug: cleanTenant }] },
        { $set: newCollection },
        { upsert: true }
      );
      try {
        await db.collection('pim_collections').updateOne(
          { $or: [{ id: cleanId }, { slug: cleanSlug, tenantSlug: cleanTenant }] },
          { $set: newCollection },
          { upsert: true }
        );
      } catch {}
    }

    return NextResponse.json({ success: true, data: newCollection, message: 'Collection saved in MongoDB' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
