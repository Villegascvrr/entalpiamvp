// ─────────────────────────────────────────────────────────────
// Repository Factory
// Resolves the correct implementation based on appConfig.mode.
// ─────────────────────────────────────────────────────────────

import { appConfig } from "@/config/appConfig";
import type { ProductRepository } from "./ProductRepository";
import type { OrderRepository } from "./OrderRepository";
import { MockProductRepository } from "./ProductRepository";
import { MockOrderRepository } from "./OrderRepository";

function createProductRepository(): ProductRepository {
    if (appConfig.mode !== "demo") {
        // Lazy-load Supabase implementation to avoid importing
        // @supabase/supabase-js when in demo mode.
        // The proxy delegates all calls after the async import resolves.
        let impl: ProductRepository | null = null;
        const ready = import("./SupabaseProductRepository").then(m => {
            impl = new m.SupabaseProductRepository();
        }).catch(err => {
            console.error("[RepoFactory] Failed to load SupabaseProductRepository, falling back to mock:", err);
            impl = new MockProductRepository();
        });

        return {
            getProducts: async (s) => { await ready; return impl!.getProducts(s); },
            getCategories: async (s) => { await ready; return impl!.getCategories(s); },
            getProductsByCategory: async (s, c) => { await ready; return impl!.getProductsByCategory(s, c); },
        };
    }
    return new MockProductRepository();
}

function createOrderRepository(): OrderRepository {
    if (appConfig.mode !== "demo") {
        let impl: OrderRepository | null = null;
        const ready = import("./SupabaseOrderRepository").then(m => {
            impl = new m.SupabaseOrderRepository();
        }).catch(err => {
            console.error("[RepoFactory] Failed to load SupabaseOrderRepository, falling back to mock:", err);
            impl = new MockOrderRepository();
        });

        return {
            getAdminOrders: async (s) => { await ready; return impl!.getAdminOrders(s); },
            getRecentOrders: async (s) => { await ready; return impl!.getRecentOrders(s); },
            getCustomerHistory: async (s, c) => { await ready; return impl!.getCustomerHistory(s, c); },
            createOrder: async (s, d) => { await ready; return impl!.createOrder(s, d); },
            validateOrder: async (s, id) => { await ready; return impl!.validateOrder(s, id); },
            updateOrderStatus: async (s, id, st) => { await ready; return impl!.updateOrderStatus(s, id, st); },
        };
    }
    return new MockOrderRepository();
}

export const productRepository: ProductRepository = createProductRepository();
export const orderRepository: OrderRepository = createOrderRepository();
