import type { ActorSession } from "@/contexts/ActorContext";
import type { Category, Product } from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import i18n from "@/i18n";
import type { ProductRepository } from "./ProductRepository";

// ─────────────────────────────────────────────────────────────
// Supabase Product Repository — READ ONLY
// Products and categories are global (no RLS).
// Queries use the anon key — safe for public catalog reads.
//
// Migration note (2026-03-12):
//   The DB split `name` and `specs` out of `products` into
//   the new `product_details` table (multi-language, 1-N).
//   This repository joins the two tables and maps the result
//   to the legacy Product interface so UI components need zero
//   changes.
// ─────────────────────────────────────────────────────────────

export class SupabaseProductRepository implements ProductRepository {
  async getProducts(session: ActorSession): Promise<Product[]> {
    const discountPercentage = await this._resolveDiscount(session);

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        code,
        price,
        unit,
        image_url,
        category_id,
        lot_size,
        min_lots,
        product_details (
          language,
          description,
          features,
          safety_sheet_url,
          source_url
        )
      `)
      .eq("is_active", true)
      .order("category_id")
      .order("code");

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
      .select(`
        id,
        code,
        price,
        unit,
        image_url,
        category_id,
        lot_size,
        min_lots,
        product_details (
          language,
          description,
          features,
          safety_sheet_url,
          source_url
        )
      `)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("code");

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

  /**
   * Picks the best product_details row for the current UI language.
   * Falls back to the first available record if no language matches.
   */
  private _resolveDetails(
    details: Array<{
      language: string;
      description: string;
      features: Record<string, string>;
      safety_sheet_url: string;
      source_url: string;
    }> | null,
  ) {
    if (!details || details.length === 0) return null;

    const lang = i18n.language?.split("-")[0] ?? "es"; // e.g. "es", "en", "cs"
    return (
      details.find((d) => d.language === lang) ??
      details[0]
    );
  }

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

      // Resolve best-language product_details record
      const detail = this._resolveDetails(row.product_details ?? null);

      // Compatibility mapping:
      //   name  → code (keeps all UI title rendering working)
      //   specs → description (keeps specs tooltip working)
      const name = row.code ?? "";
      const specs = detail?.description ?? "";

      return {
        // ── Legacy fields (UI compatibility) ──
        id: row.id,
        name,
        category: row.category_id,
        price: finalPrice,
        unit: row.unit,
        specs,
        image: row.image_url ?? undefined,
        basePrice: isAdmin ? basePrice : undefined,
        discountPercentage: isAdmin ? discountPercentage : undefined,

        // ── New fields (available for future UI enhancements) ──
        code: row.code,
        description: detail?.description ?? undefined,
        features: detail?.features ?? undefined,
        safetySheetUrl: detail?.safety_sheet_url ?? undefined,
        lotSize: row.lot_size,
        minLots: row.min_lots,
      };
    });
  }
}
