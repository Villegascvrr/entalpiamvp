import { supabase } from "@/lib/supabaseClient";
import type { ProductRepository } from "./ProductRepository";
import type { Product, Category } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

// ─────────────────────────────────────────────────────────────
// Supabase Product Repository — READ ONLY
// Products and categories are global (no RLS).
// Queries use the anon key — safe for public catalog reads.
// ─────────────────────────────────────────────────────────────

export class SupabaseProductRepository implements ProductRepository {

    async getProducts(_session: ActorSession): Promise<Product[]> {
        const { data, error } = await supabase
            .from("products")
            .select("id, name, category_id, price, stock, unit, specs, image_url")
            .eq("is_active", true)
            .order("category_id")
            .order("name");

        if (error) {
            console.error("[SupabaseProductRepo] Error fetching products:", error.message);
            return [];
        }

        // Map DB columns → frontend Product shape
        return (data ?? []).map(row => ({
            id: row.id,
            name: row.name,
            category: row.category_id,   // DB: category_id → frontend: category
            price: Number(row.price),
            stock: row.stock,
            unit: row.unit,
            specs: row.specs,
            image: row.image_url ?? undefined,
        }));
    }

    async getCategories(_session: ActorSession): Promise<Category[]> {
        const { data, error } = await supabase
            .from("product_categories")
            .select("id, label, icon_key, description, image_url, detailed_text, sort_order")
            .order("sort_order");

        if (error) {
            console.error("[SupabaseProductRepo] Error fetching categories:", error.message);
            return [];
        }

        // Map DB columns → frontend Category shape
        return (data ?? []).map(row => ({
            id: row.id,
            label: row.label,
            iconKey: row.icon_key,           // DB: icon_key → frontend: iconKey
            description: row.description,
            image: row.image_url ?? undefined,
            detailedText: row.detailed_text ?? undefined,
        }));
    }

    async getProductsByCategory(_session: ActorSession, categoryId: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from("products")
            .select("id, name, category_id, price, stock, unit, specs, image_url")
            .eq("category_id", categoryId)
            .eq("is_active", true)
            .order("name");

        if (error) {
            console.error("[SupabaseProductRepo] Error fetching by category:", error.message);
            return [];
        }

        return (data ?? []).map(row => ({
            id: row.id,
            name: row.name,
            category: row.category_id,
            price: Number(row.price),
            stock: row.stock,
            unit: row.unit,
            specs: row.specs,
            image: row.image_url ?? undefined,
        }));
    }
}
