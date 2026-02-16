import type { ActorSession } from "@/contexts/ActorContext";
import type { LMEPrice } from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import type { LMERepository } from "./LMERepository";

export class SupabaseLMERepository implements LMERepository {
  async getLatestPrice(session: ActorSession): Promise<LMEPrice | null> {
    // Get the most recent price entry
    const { data, error } = await supabase
      .from("lme_prices")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // It's normal to have no rows initially
      if (error.code === "PGRST116") return null;
      console.error(
        "[SupabaseLMERepo] Error fetching latest price:",
        error.message,
      );
      return null;
    }

    return data as LMEPrice;
  }

  async getPriceByDate(
    session: ActorSession,
    date: string,
  ): Promise<LMEPrice | null> {
    const { data, error } = await supabase
      .from("lme_prices")
      .select("*")
      .eq("date", date)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error(
        "[SupabaseLMERepo] Error fetching price by date:",
        error.message,
      );
      return null;
    }

    return data as LMEPrice;
  }

  async setManualPrice(
    session: ActorSession,
    price: number,
  ): Promise<LMEPrice> {
    if (!session.tenantId) throw new Error("Tenant ID required");

    const today = new Date().toISOString().split("T")[0];

    // UPSERT logic based on (tenant_id, date) constraint
    const payload = {
      tenant_id: session.tenantId,
      date: today,
      price: price,
      source: "manual",
      created_by: session.actorId,
    };

    const { data, error } = await supabase
      .from("lme_prices")
      .upsert(payload, { onConflict: "tenant_id, date" })
      .select()
      .single();

    if (error) {
      console.error(
        "[SupabaseLMERepo] Error setting manual price:",
        error.message,
      );
      throw new Error(`Error guardando precio LME: ${error.message}`);
    }

    return data as LMEPrice;
  }

  async getHistory(
    session: ActorSession,
    limit: number = 7,
  ): Promise<LMEPrice[]> {
    const { data, error } = await supabase
      .from("lme_prices")
      .select("*")
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[SupabaseLMERepo] Error fetching history:", error.message);
      return [];
    }

    return data as LMEPrice[];
  }
}
