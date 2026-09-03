import { vi } from 'vitest';

export interface MockCollectionRecord {
  [key: string]: any;
}

export class MockMongoCollection {
  public data: MockCollectionRecord[] = [];

  constructor(initialData: MockCollectionRecord[] = []) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  public find(query: any = {}) {
    let results = this.data.filter((doc) => this.matchQuery(doc, query));
    const cursor = {
      sort: vi.fn().mockImplementation((sortObj: any) => cursor),
      limit: vi.fn().mockImplementation((n: number) => {
        results = results.slice(0, n);
        return cursor;
      }),
      toArray: vi.fn().mockResolvedValue(results),
    };
    return cursor;
  }

  public async createIndex(spec: any, options?: any) {
    return 'index_created';
  }

  public async findOne(query: any = {}) {
    const match = this.data.find((doc) => this.matchQuery(doc, query));
    return match ? JSON.parse(JSON.stringify(match)) : null;
  }

  public async insertOne(doc: any) {
    const newDoc = { _id: `id_${Date.now()}_${Math.random()}`, ...doc };
    this.data.push(newDoc);
    return { acknowledged: true, insertedId: newDoc._id };
  }

  public async insertMany(docs: any[]) {
    const insertedIds: string[] = [];
    for (const doc of docs) {
      const newDoc = { _id: `id_${Date.now()}_${Math.random()}`, ...doc };
      this.data.push(newDoc);
      insertedIds.push(newDoc._id);
    }
    return { acknowledged: true, insertedCount: docs.length, insertedIds };
  }

  public async updateOne(filter: any, update: any, options: { upsert?: boolean } = {}) {
    const idx = this.data.findIndex((doc) => this.matchQuery(doc, filter));
    if (idx !== -1) {
      const current = this.data[idx];
      const setFields = update.$set || {};
      this.data[idx] = { ...current, ...setFields };
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    } else if (options.upsert) {
      const setFields = update.$set || {};
      const setOnInsert = update.$setOnInsert || {};
      const newDoc = { _id: `id_${Date.now()}`, ...filter, ...setFields, ...setOnInsert };
      this.data.push(newDoc);
      return { acknowledged: true, matchedCount: 0, upsertedCount: 1, upsertedId: newDoc._id };
    }
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }

  public async deleteOne(filter: any) {
    const idx = this.data.findIndex((doc) => this.matchQuery(doc, filter));
    if (idx !== -1) {
      this.data.splice(idx, 1);
      return { acknowledged: true, deletedCount: 1 };
    }
    return { acknowledged: true, deletedCount: 0 };
  }

  public async deleteMany(filter: any) {
    const before = this.data.length;
    this.data = this.data.filter((doc) => !this.matchQuery(doc, filter));
    return { acknowledged: true, deletedCount: before - this.data.length };
  }

  public async countDocuments(query: any = {}) {
    return this.data.filter((doc) => this.matchQuery(doc, query)).length;
  }

  private matchQuery(doc: any, query: any): boolean {
    if (!query || Object.keys(query).length === 0) return true;

    for (const [key, value] of Object.entries(query)) {
      if (key === '$or' && Array.isArray(value)) {
        const matchesAny = value.some((condition) => this.matchQuery(doc, condition));
        if (!matchesAny) return false;
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const docVal = doc[key];
        if ('$ne' in value && docVal === (value as any).$ne) return false;
        if ('$gte' in value && !(docVal >= (value as any).$gte)) return false;
        if ('$lte' in value && !(docVal <= (value as any).$lte)) return false;
        if ('$gt' in value && !(docVal > (value as any).$gt)) return false;
        if ('$lt' in value && !(docVal < (value as any).$lt)) return false;
        continue;
      }

      if (key.includes('.')) {
        const parts = key.split('.');
        let nested = doc;
        for (const p of parts) {
          nested = nested ? nested[p] : undefined;
        }
        if (nested !== value) return false;
        continue;
      }

      if (doc[key] !== value) return false;
    }
    return true;
  }
}

export class MockMongoDb {
  public collections: Map<string, MockMongoCollection> = new Map();

  public collection(name: string): MockMongoCollection {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockMongoCollection());
    }
    return this.collections.get(name)!;
  }

  public seed(name: string, data: MockCollectionRecord[]) {
    this.collections.set(name, new MockMongoCollection(data));
  }

  public reset() {
    this.collections.clear();
  }
}

export const mockDbInstance = new MockMongoDb();

export function getMockDatabase() {
  return mockDbInstance;
}
