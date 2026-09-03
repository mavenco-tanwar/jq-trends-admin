export const mockCommerceModulesFixture = {
  pim: {
    sku: 'JQT-PIM-991',
    attributes: [
      { code: 'material', label: 'Material', value: '100% Mulberry Silk', type: 'text' },
      { code: 'care_instructions', label: 'Care Instructions', value: 'Dry Clean Only', type: 'text' },
      { code: 'country_of_origin', label: 'Country of Origin', value: 'India', type: 'select' },
    ],
    completenessScore: 95,
  },
  subscription: {
    id: 'sub_vip_001',
    plan: 'Atelier Couture Club',
    interval: 'monthly',
    price: 4999,
    status: 'active',
    currentPeriodEnd: '2026-10-01T00:00:00Z',
  },
  loyalty: {
    tier: 'Platinum Elite',
    pointsBalance: 12500,
    multiplier: 1.5,
    cashbackPercentage: 5,
  },
  giftCard: {
    code: 'JQT-GIFT-5000-XYZ',
    initialValue: 5000,
    currentBalance: 3500,
    currency: 'INR',
    expiresAt: '2027-12-31T23:59:59Z',
  },
  taxRule: {
    country: 'IN',
    state: 'KA',
    standardRate: 18,
    gstBreakdown: { cgst: 9, sgst: 9, igst: 18 },
    taxInclusivePrices: true,
  },
  shippingZone: {
    name: 'India Domestic Priority Express',
    countries: ['IN'],
    carriers: ['BlueDart Express', 'Delhivery Priority'],
    freeShippingThreshold: 5000,
    flatRate: 250,
  },
  aiIntelligence: {
    sentimentScore: 0.94,
    recommendedTags: ['silk', 'luxury', 'eveningwear'],
    suggestedCrossSells: ['prod_002'],
    predictedRestockDate: '2026-09-25',
  },
  headlessExperience: {
    channel: 'mobile_app_ios',
    apiVersion: '2026-01',
    graphqlEndpoint: '/api/graphql',
    cacheTtlSeconds: 300,
  },
};
