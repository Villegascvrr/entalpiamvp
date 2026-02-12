import { mockProducts, categories } from "@/data/mock-products";
import type { Product, Category } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

// ─────────────────────────────────────────────────────────────
// Product Repository Interface
// Defines the contract for product data access.
// When Supabase is connected, only the implementation changes.
// ─────────────────────────────────────────────────────────────

export interface ProductRepository {
    getProducts(session: ActorSession): Promise<Product[]>;
    getCategories(session: ActorSession): Promise<Category[]>;
    getProductsByCategory(session: ActorSession, categoryId: string): Promise<Product[]>;
}

// ─────────────────────────────────────────────────────────────
// Mock Implementation
// Uses static mock data. Simulates tenant-scoped reads.
// ─────────────────────────────────────────────────────────────

export class MockProductRepository implements ProductRepository {

    async getProducts(session: ActorSession): Promise<Product[]> {
        await this._delay(300);
        console.log(`[MockProductRepo] READ products for ${session.role} @ ${session.tenantId}`);
        return [...mockProducts];
    }

    async getCategories(session: ActorSession): Promise<Category[]> {
        await this._delay(150);
        return [...categories];
    }

    async getProductsByCategory(session: ActorSession, categoryId: string): Promise<Product[]> {
        await this._delay(250);
        return mockProducts.filter(p => p.category === categoryId);
    }

    private _delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
export const productRepository = new MockProductRepository();
