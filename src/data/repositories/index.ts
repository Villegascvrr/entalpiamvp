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
            getActiveOrders: async (s) => { await ready; return impl ? impl.getActiveOrders(s) : []; },
            getArchivedOrders: async (s) => { await ready; return impl ? impl.getArchivedOrders(s) : []; },
            getOrderTimeline: async (s, id) => { await ready; return impl ? impl.getOrderTimeline(s, id) : []; },
        };
    }
    return new MockOrderRepository();
}

import type { CustomerRepository } from "./CustomerRepository";
import type { LMERepository } from "./LMERepository";
import type { FXRateRepository } from "./FXRateRepository";

import { MockCustomerRepository } from "./MockCustomerRepository";
import { MockLMERepository } from "./MockLMERepository";
import { MockFXRateRepository } from "./FXRateRepository";

function createCustomerRepository(): CustomerRepository {
    try {
        if (appConfig.mode !== "demo") {
            let impl: CustomerRepository | null = null;
            const ready = import("./SupabaseCustomerRepository").then(m => {
                impl = new m.SupabaseCustomerRepository();
            }).catch(err => {
                console.error("[RepoFactory] Failed to load SupabaseCustomerRepository:", err);
            });

            return {
                getCustomers: async (s) => { await ready; return impl ? impl.getCustomers(s) : []; },
                getCustomerById: async (s, id) => { await ready; return impl ? impl.getCustomerById(s, id) : null; },
                createCustomer: async (s, d) => { await ready; if (!impl) throw new Error("Repo not loaded"); return impl.createCustomer(s, d); },
                updateCustomer: async (s, id, d) => { await ready; if (!impl) throw new Error("Repo not loaded"); return impl.updateCustomer(s, id, d); },
            };
        }

        // Use Mock implementation for demo mode
        return new MockCustomerRepository();
    } catch (error) {
        console.error("CRITICAL: Failed to initialize CustomerRepository:", error);
        // Fallback to avoid app crash
        return new MockCustomerRepository();
    }
}

function createLMERepository(): LMERepository {
    try {
        if (appConfig.mode !== "demo") {
            let impl: LMERepository | null = null;
            const ready = import("./SupabaseLMERepository").then(m => {
                impl = new m.SupabaseLMERepository();
            }).catch(err => {
                console.error("[RepoFactory] Failed to load SupabaseLMERepository:", err);
            });

            return {
                getLatestPrice: async (s) => { await ready; return impl ? impl.getLatestPrice(s) : null; },
                getPriceByDate: async (s, d) => { await ready; return impl ? impl.getPriceByDate(s, d) : null; },
                setManualPrice: async (s, p) => { await ready; if (!impl) throw new Error("Repo not loaded"); return impl.setManualPrice(s, p); },
                getHistory: async (s, l) => { await ready; return impl ? impl.getHistory(s, l) : []; },
            };
        }
        return new MockLMERepository();
    } catch (error) {
        console.error("CRITICAL: Failed to initialize LMERepository:", error);
        return new MockLMERepository();
    }
}

function createFXRateRepository(): FXRateRepository {
    // For now only Mock is implemented as per MVP requirements
    // In future this can switch like others
    return new MockFXRateRepository();
}

export const productRepository: ProductRepository = createProductRepository();
export const orderRepository: OrderRepository = createOrderRepository();
export const customerRepository: CustomerRepository = createCustomerRepository();
export const lmeRepository: LMERepository = createLMERepository();
export const fxRateRepository: FXRateRepository = createFXRateRepository();
