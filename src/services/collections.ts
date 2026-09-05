import { ApiClient } from "./api";
import type { Collection } from "@/types";

function normalizeCollection(raw: any): Collection {
  return {
    id: raw.id || `col_${Date.now()}`,
    title: raw.title || raw.name || "Collection",
    slug: raw.slug || `collection-${Date.now()}`,
    description: raw.description || "",
    imageUrl: raw.imageUrl || raw.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop",
    type: raw.type || "manual",
    rules: Array.isArray(raw.rules) ? raw.rules : [],
    productIds: Array.isArray(raw.productIds) ? raw.productIds : [],
    productCount: Array.isArray(raw.productIds) ? raw.productIds.length : (typeof raw.productCount === "number" ? raw.productCount : 0),
    isVisible: raw.isVisible !== false,
    displayOrder: raw.displayOrder || 1,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export class CollectionService {
  private static localCollections: Collection[] = [];

  static async getAll(): Promise<Collection[]> {
    try {
      const res = await ApiClient.get<any[]>("/api/v1/collections", { bypassCache: true });
      if (res && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeCollection);
        this.localCollections = normalized;
        return normalized;
      }
    } catch (err) {
      console.warn("[CollectionService] Failed to fetch collections:", err);
    }
    return this.localCollections;
  }

  static async create(collection: Partial<Collection>): Promise<Collection> {
    ApiClient.clearCache("/api/v1/collections");

    const newCol = normalizeCollection({
      id: `col_${Date.now()}`,
      title: collection.title || "New Collection",
      slug: collection.slug || `collection-${Date.now()}`,
      description: collection.description || "",
      imageUrl: collection.imageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop",
      type: collection.type || "manual",
      rules: collection.rules || [],
      productIds: collection.productIds || [],
      productCount: collection.productIds?.length || 0,
      isVisible: collection.isVisible ?? true,
      displayOrder: this.localCollections.length + 1,
      createdAt: new Date().toISOString(),
    });

    try {
      const res = await ApiClient.post<any>("/api/v1/collections", newCol);
      if (res && res.data) {
        const persisted = normalizeCollection(res.data);
        this.localCollections.push(persisted);
        ApiClient.clearCache("/api/v1/collections");
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("collections_updated"));
        return persisted;
      }
    } catch (err) {
      console.error("[CollectionService] Failed to create collection:", err);
    }

    this.localCollections.push(newCol);
    ApiClient.clearCache("/api/v1/collections");
    return newCol;
  }

  static async update(id: string, updates: Partial<Collection>): Promise<Collection> {
    ApiClient.clearCache("/api/v1/collections");
    try {
      await ApiClient.patch(`/api/v1/collections/${encodeURIComponent(id)}`, updates);
    } catch (err) {
      console.error("[CollectionService] Failed to update collection:", err);
    }

    this.localCollections = this.localCollections.map((c) =>
      c.id === id ? normalizeCollection({ ...c, ...updates }) : c
    );
    ApiClient.clearCache("/api/v1/collections");
    const updated = this.localCollections.find((c) => c.id === id);
    if (!updated) throw new Error("Collection not found");
    return updated;
  }

  static async delete(id: string): Promise<void> {
    if (!id || id === "undefined" || id === "null") return;
    ApiClient.clearCache("/api/v1/collections");
    try {
      await ApiClient.delete(`/api/v1/collections/${encodeURIComponent(id)}`);
    } catch (err) {
      console.error("[CollectionService] Failed to delete collection:", err);
    }
    this.localCollections = this.localCollections.filter((c) => c.id !== id && c.slug !== id);
    ApiClient.clearCache("/api/v1/collections");
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("collections_updated"));
  }
}
