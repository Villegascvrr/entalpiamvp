import type { ActorSession } from "@/contexts/ActorContext";
import { categories, mockProducts } from "@/data/mock-products";
import type { Category, Product } from "@/data/types";

// ─────────────────────────────────────────────────────────────
// Product Repository Interface
// Defines the contract for product data access.
// Implementation switching is handled by repositories/index.ts
// ─────────────────────────────────────────────────────────────

export interface ProductRepository {
  getProducts(session: ActorSession): Promise<Product[]>;
  getCategories(session: ActorSession): Promise<Category[]>;
  getProductsByCategory(
    session: ActorSession,
    categoryId: string,
  ): Promise<Product[]>;
}

// ─────────────────────────────────────────────────────────────
// Mock Implementation
// Uses static mock data. Simulates tenant-scoped reads.
// ─────────────────────────────────────────────────────────────

export class MockProductRepository implements ProductRepository {
  async getProducts(session: ActorSession): Promise<Product[]> {
    await this._delay(300);
    console.log(
      `[MockProductRepo] READ products for ${session.role} @ ${session.tenantId}`,
    );

    // Simulate Tier 2 (5%) for demo customers
    const simulatedDiscount = session.role === "customer" ? 0.05 : 0;
    const isAdmin = session.role === "admin";

    return mockProducts.map((p) => {
      const basePrice = p.price;
      const finalPrice = basePrice * (1 - simulatedDiscount);
      return {
        ...p,
        price: finalPrice,
        basePrice: isAdmin ? basePrice : undefined,
        discountPercentage: isAdmin ? simulatedDiscount : undefined,
      };
    });
  }

  async getCategories(session: ActorSession): Promise<Category[]> {
    await this._delay(150);
    return [...categories];
  }

  async getProductsByCategory(
    session: ActorSession,
    categoryId: string,
  ): Promise<Product[]> {
    await this._delay(250);
    const filtered = mockProducts.filter((p) => p.category === categoryId);

    // Simulate Tier 2 (5%) for demo customers
    const simulatedDiscount = session.role === "customer" ? 0.05 : 0;
    const isAdmin = session.role === "admin";

    return filtered.map((p) => {
      const basePrice = p.price;
      const finalPrice = basePrice * (1 - simulatedDiscount);
      return {
        ...p,
        price: finalPrice,
        basePrice: isAdmin ? basePrice : undefined,
        discountPercentage: isAdmin ? simulatedDiscount : undefined,
      };
    });
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
