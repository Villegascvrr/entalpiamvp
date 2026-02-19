import type { ActorSession } from "@/contexts/ActorContext";
import type { Category, Product } from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import type { ProductRepository } from "./ProductRepository";

// ─────────────────────────────────────────────────────────────
// Supabase Product Repository — READ ONLY
// Products and categories are global (no RLS).
// Queries use the anon key — safe for public catalog reads.
// ─────────────────────────────────────────────────────────────

export class SupabaseProductRepository implements ProductRepository {
  async getProducts(session: ActorSession): Promise<Product[]> {
    const discountPercentage = await this._resolveDiscount(session);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category_id, price, unit, specs, image_url")
      .eq("is_active", true)
      .order("category_id")
      .order("name");

    if (error) {
      console.error(
        "[SupabaseProductRepo] Error fetching products:",
        error.message,
      );
      return [];
    }

    return this._mapProducts(data, session, discountPercentage);
  }

  async getCategories(_session: ActorSession): Promise<Category[]> {
    const { data, error } = await supabase
      .from("product_categories")
      .select(
        "id, label, icon_key, description, image_url, detailed_text, sort_order",
      )
      .order("sort_order");

    if (error) {
      console.error(
        "[SupabaseProductRepo] Error fetching categories:",
        error.message,
      );
      return [];
    }

    // Map DB columns → frontend Category shape
    return (data ?? []).map((row) => ({
      id: row.id,
      label: row.label,
      iconKey: row.icon_key, // DB: icon_key → frontend: iconKey
      description: row.description,
      image: row.image_url ?? undefined,
      detailedText: row.detailed_text ?? undefined,
    }));
  }

  async getProductsByCategory(
    session: ActorSession,
    categoryId: string,
  ): Promise<Product[]> {
    const discountPercentage = await this._resolveDiscount(session);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category_id, price, unit, specs, image_url")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error(
        "[SupabaseProductRepo] Error fetching by category:",
        error.message,
      );
      return [];
    }

    return this._mapProducts(data, session, discountPercentage);
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private async _resolveDiscount(session: ActorSession): Promise<number> {
    if (
      session.role === "customer" ||
      session.role === "commercial" ||
      session.role === "admin"
    ) {
      let query = supabase.from("customers").select("discount_tier_id");

      // 1. If we have a direct link to the customer profile, use it (Best Practice)
      if (session.customerId) {
        query = query.eq("id", session.customerId);
      }
      // 2. Fallback: Find by Tenant ID (Legacy / Admin viewing own tenant?)
      // Note: customers.tenant_id is TEXT (legacy issue).
      else {
        query = query.eq("tenant_id", session.tenantId);
      }

      const { data: customerData } = await query.maybeSingle();

      if (customerData?.discount_tier_id) {
        const { data: tierData } = await supabase
          .from("discount_tiers")
          .select("discount_percentage")
          .eq("id", customerData.discount_tier_id)
          .single();

        if (tierData) {
          return Number(tierData.discount_percentage);
        }
      }
    }
    return 0;
  }

  private _mapProducts(
    data: any[],
    session: ActorSession,
    discountPercentage: number,
  ): Product[] {
    const isAdmin = session.role === "admin";
    return (data ?? []).map((row) => {
      const basePrice = Number(row.price);
      const finalPrice = basePrice * (1 - discountPercentage);

      return {
        id: row.id,
        name: row.name,
        category: row.category_id,
        price: finalPrice,
        unit: row.unit,
        specs: row.specs,
        image: row.image_url ?? undefined,
        basePrice: isAdmin ? basePrice : undefined,
        discountPercentage: isAdmin ? discountPercentage : undefined,
      };
    });
  }
}
