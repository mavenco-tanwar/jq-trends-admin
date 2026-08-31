import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantSlug = (body.tenantSlug || body.slug || 'jqtrends').toLowerCase().trim();
    const preset = body.preset || 'apparel';

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const sampleProductsMap: Record<string, any[]> = {
      apparel: [
        {
          name: 'Pure Mulberry Silk Banarasi Saree',
          slug: `pure-mulberry-silk-banarasi-saree-${tenantSlug}`,
          sku: `${tenantSlug.substring(0, 3).toUpperCase()}-LUX-SAR-001`,
          department: 'women',
          category: 'sarees',
          categoryName: 'Royal Sarees',
          price: 14999,
          compareAtPrice: 19999,
          discountPercent: 25,
          shortDescription: 'Heirloom handwoven pure Katan silk saree with real gold zari kadwa motifs.',
          description: 'A masterpiece of Banarasi handloom artistry. Woven over 45 days by generational weavers using certified pure mulberry silk and intricate antique gold zari borders.',
          features: ['100% Pure Katan Silk certified SilkMark', 'Intricate floral kadwa zari jaal throughout body', 'Includes unstitched running silk blouse piece (80cm)'],
          fabric: 'Pure Mulberry Silk & Gold Zari',
          careInstructions: ['Strictly Dry Clean Only'],
          images: [
            { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop', alt: 'Royal Silk Saree Front Drape', isPrimary: true },
          ],
          colors: [{ name: 'Imperial Crimson', hex: '#8B0000' }, { name: 'Royal Emerald', hex: '#004B23' }],
          sizes: [{ size: 'Free Size', inStock: true, stockCount: 15 }],
          rating: 5.0,
          reviewCount: 42,
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          isSale: false,
          badge: 'Heirloom Heritage',
        },
        {
          name: 'Artisanal Embroidered Velvet Tuxedo Blazer',
          slug: `artisanal-embroidered-velvet-tuxedo-blazer-${tenantSlug}`,
          sku: `${tenantSlug.substring(0, 3).toUpperCase()}-LUX-BLZ-002`,
          department: 'women',
          category: 'blazers',
          categoryName: 'Atelier Tailoring',
          price: 8999,
          compareAtPrice: 12499,
          discountPercent: 28,
          shortDescription: 'Midnight sapphire plush micro-velvet blazer with hand-zardozi peak lapels.',
          description: 'Statement evening tailoring at its finest. Cut from Italian micro-velvet with a sharp structured shoulder line and opulent hand-embroidered metallic thread work.',
          features: ['Plush Italian cotton micro-velvet', 'Hand-stitched metallic zardozi lapel embroidery'],
          fabric: 'Italian Velvet & Silk Satin Lining',
          careInstructions: ['Specialist Dry Clean Only'],
          images: [
            { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop', alt: 'Velvet Blazer Styled Model', isPrimary: true },
          ],
          colors: [{ name: 'Midnight Sapphire', hex: '#0F1E36' }, { name: 'Wine Velvet', hex: '#4A0E17' }],
          sizes: [{ size: 'S', inStock: true, stockCount: 8 }, { size: 'M', inStock: true, stockCount: 12 }, { size: 'L', inStock: true, stockCount: 6 }],
          rating: 4.9,
          reviewCount: 38,
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: true,
          isSale: true,
          badge: 'Atelier Drop',
        },
      ],
      home: [
        {
          name: 'Handcrafted Fluted Ceramic Vase',
          slug: `handcrafted-fluted-ceramic-vase-${tenantSlug}`,
          sku: `${tenantSlug.substring(0, 3).toUpperCase()}-HOM-VAS-001`,
          department: 'women',
          category: 'decor',
          categoryName: 'Artisanal Decor',
          price: 2499,
          compareAtPrice: 3499,
          discountPercent: 28,
          shortDescription: 'Minimalist Scandinavian ceramic vase with matte chalk glaze finish.',
          description: 'Elevate your living space with this sculptural fluted ceramic vase.',
          features: ['100% High-fire stoneware clay', 'Waterproof interior glaze'],
          fabric: 'Matte Glazed Stoneware',
          careInstructions: ['Wipe with damp microfiber cloth'],
          images: [
            { url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=1000&auto=format&fit=crop', alt: 'Fluted Ceramic Vase', isPrimary: true },
          ],
          colors: [{ name: 'Chalk White', hex: '#F5F5F3' }],
          sizes: [{ size: 'Medium (30cm)', inStock: true, stockCount: 20 }],
          rating: 4.9,
          reviewCount: 64,
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          isSale: true,
          badge: 'Best Seller',
        },
      ],
      activewear: [
        {
          name: 'Apex Pro Seamless High-Waist Leggings',
          slug: `apex-pro-seamless-high-waist-leggings-${tenantSlug}`,
          sku: `${tenantSlug.substring(0, 3).toUpperCase()}-ACT-LEG-001`,
          department: 'women',
          category: 'bottoms',
          categoryName: 'Tights & Leggings',
          price: 2899,
          compareAtPrice: 3999,
          discountPercent: 27,
          shortDescription: 'Squat-proof 4-way stretch compressive tights with ribbed tummy control.',
          description: 'Engineered for intense weightlifting, HIIT, and sprint sessions.',
          features: ['100% Squat-proof ultra-high density knit', 'Core-sculpting ribbed compression waistband'],
          fabric: '78% Recycled Nylon, 22% Elastane',
          careInstructions: ['Machine wash cold inside out'],
          images: [
            { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop', alt: 'Apex Seamless Leggings', isPrimary: true },
          ],
          colors: [{ name: 'Obsidian Black', hex: '#1A1A1A' }],
          sizes: [{ size: 'S', inStock: true, stockCount: 22 }, { size: 'M', inStock: true, stockCount: 30 }],
          rating: 4.9,
          reviewCount: 118,
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true,
          isSale: true,
          badge: 'Pro Tier',
        },
      ],
    };

    const catalogToSeed = sampleProductsMap[preset] || sampleProductsMap.apparel;

    const seededDocs = catalogToSeed.map((p, idx) => ({
      ...p,
      id: `prod_${tenantSlug}_${idx + 1}_${Date.now()}`,
      tenantSlug,
      storeSlug: tenantSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await db.collection('products').deleteMany({
      $or: [{ tenantSlug }, { storeSlug: tenantSlug }],
    });

    const insertResult = await db.collection('products').insertMany(seededDocs);

    await db.collection('tenants').updateOne(
      { slug: tenantSlug },
      {
        $set: {
          'metrics.products': seededDocs.length,
          'metrics.storageUsedMb': 45,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    await db.collection('platform_activities').insertOne({
      event: `Seeded ${seededDocs.length} starter products into ${tenantSlug} partition`,
      actor: 'superadmin@platform.com',
      tenantId: `store_${tenantSlug}`,
      tenantName: tenantSlug,
      ipAddress: '127.0.0.1',
      severity: 'info',
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        count: insertResult.insertedCount,
        tenantSlug,
        source: 'mongodb_atlas',
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('Admin seed products API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
