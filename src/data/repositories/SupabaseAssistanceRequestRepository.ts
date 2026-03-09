import type { ActorSession } from "@/contexts/ActorContext";
import type {
    AssistanceRequest,
    AssistanceRequestStatus,
} from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import type {
    AssistanceRequestRepository,
    CreateAssistanceRequestData,
} from "./AssistanceRequestRepository";

// ─────────────────────────────────────────────────────────────
// Supabase Assistance Request Repository
// All queries rely on RLS (get_my_tenant_id()) for tenant isolation.
// No manual tenant_id filtering is needed in selects/updates.
// ─────────────────────────────────────────────────────────────

export class SupabaseAssistanceRequestRepository
    implements AssistanceRequestRepository {
    async createAssistanceRequest(
        session: ActorSession,
        data: CreateAssistanceRequestData,
    ): Promise<AssistanceRequest> {
        const { data: inserted, error } = await supabase
            .from("assistance_requests")
            .insert({
                tenant_id: session.tenantId,
                actor_id: session.actorId ?? null,
                customer_id: data.customer_id ?? session.customerId ?? null,
                name: data.name,
                phone: data.phone ?? null,
                email: data.email ?? null,
                message: data.message,
                status: "NEW",
            })
            .select()
            .single();

        if (error || !inserted) {
            console.error(
                "[SupabaseAssistanceRepo] Error creating request:",
                error?.message,
            );
            throw new Error(error?.message ?? "Failed to create assistance request");
        }

        return this._mapRow(inserted);
    }

    async getAssistanceRequestsByTenant(
        session: ActorSession,
    ): Promise<AssistanceRequest[]> {
        // RLS automatically filters by get_my_tenant_id(); explicit order for listing
        const { data, error } = await supabase
            .from("assistance_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(
                "[SupabaseAssistanceRepo] Error fetching requests:",
                error.message,
            );
            return [];
        }

        return (data ?? []).map(this._mapRow);
    }

    async updateAssistanceRequestStatus(
        session: ActorSession,
        id: string,
        status: AssistanceRequestStatus,
    ): Promise<AssistanceRequest> {
        if (session.role !== "admin" && session.role !== "commercial") {
            throw new Error(
                `[SupabaseAssistanceRepo] DENIED: Role '${session.role}' cannot update request status.`,
            );
        }

        const { data: updated, error } = await supabase
            .from("assistance_requests")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error || !updated) {
            console.error(
                "[SupabaseAssistanceRepo] Error updating status:",
                error?.message,
            );
            throw new Error(error?.message ?? "Failed to update request status");
        }

        return this._mapRow(updated);
    }

    // ── Private ──────────────────────────────────────────────

    private _mapRow(row: any): AssistanceRequest {
        return {
            id: row.id,
            tenant_id: row.tenant_id,
            actor_id: row.actor_id ?? undefined,
            customer_id: row.customer_id ?? undefined,
            name: row.name,
            phone: row.phone ?? undefined,
            email: row.email ?? undefined,
            message: row.message,
            status: row.status as AssistanceRequestStatus,
            created_at: row.created_at,
            updated_at: row.updated_at ?? undefined,
        };
    }
}
