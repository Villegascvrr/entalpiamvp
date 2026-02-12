import { supabase } from "@/lib/supabaseClient";
import type { OrderRepository } from "./OrderRepository";
import type { Order, RecentOrder, OrderSummary, OrderStatus, AdminOrderItem } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

// ─────────────────────────────────────────────────────────────
// Supabase Order Repository — Full CRUD
// RLS filters automatically by tenant via get_my_tenant_id().
// Writes always inject tenant_id from ActorSession (server-side
// RLS validates it matches auth.uid()'s tenant).
// ─────────────────────────────────────────────────────────────

// Valid status transitions — prevents illegal state changes
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    draft: ["pending_validation", "cancelled"],
    pending_validation: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

export class SupabaseOrderRepository implements OrderRepository {

    // ── Reads ──────────────────────────────────────────────

    async getAdminOrders(_session: ActorSession): Promise<Order[]> {
        const { data, error } = await supabase
            .from("orders")
            .select(`
                id,
                reference,
                customer_name,
                company_name,
                created_at,
                status,
                total,
                notes,
                shipping_address,
                shipping_date,
                actor_id,
                actors (
                    name
                ),
                order_items (
                    id,
                    name,
                    quantity,
                    unit_price,
                    line_total,
                    is_custom
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[SupabaseOrderRepo] Error fetching admin orders:", error.message);
            return [];
        }

        // Map DB rows → frontend Order shape
        return (data ?? []).map(row => ({
            id: row.reference,                        // UI uses reference as display ID
            customer: {
                id: row.actor_id as string,
                name: (row.actors as any)?.name || row.customer_name as string
            },
            company: row.company_name,
            date: new Date(row.created_at).toLocaleDateString("es-ES", {
                day: "2-digit", month: "2-digit", year: "numeric"
            }),
            status: row.status as OrderStatus,
            total: Number(row.total),
            notes: row.notes ?? undefined,
            address: row.shipping_address ?? undefined,
            shippingDate: row.shipping_date ?? undefined,
            items: (row.order_items ?? []).map((item: Record<string, unknown>) => ({
                id: item.id as string,
                name: item.name as string,
                quantity: item.quantity as number,
                price: Number(item.unit_price),
            } as AdminOrderItem)),
        }));
    }

    async getRecentOrders(_session: ActorSession): Promise<RecentOrder[]> {
        const { data, error } = await supabase
            .from("orders")
            .select(`
                reference, 
                created_at, 
                status, 
                total,
                customer_name,
                actors (name),
                order_items (id)
            `)
            .order("created_at", { ascending: false })
            .limit(10); // Increased limit for Ops Queue

        if (error) {
            console.error("[SupabaseOrderRepo] Error fetching recent orders:", error.message);
            return [];
        }

        return (data ?? []).map(row => {
            // Compute relative time label
            const created = new Date(row.created_at);
            const diffMs = Date.now() - created.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            let dateLabel: string;
            if (diffMin < 60) {
                dateLabel = `Hace ${diffMin} min`;
            } else if (diffMin < 1440) {
                dateLabel = `Hace ${Math.floor(diffMin / 60)}h`;
            } else {
                dateLabel = created.toLocaleDateString("es-ES", {
                    day: "2-digit", month: "2-digit"
                });
            }

            // Determine priority based on total or status
            const total = Number(row.total);
            let priority: "low" | "medium" | "high" = "low";
            if (total > 5000) priority = "high";
            else if (total > 1000) priority = "medium";

            return {
                id: row.reference,
                date: dateLabel,
                status: row.status,
                total: total,
                // New fields for Ops Dashboard
                customer: (row.actors as any)?.name || row.customer_name || "Desconocido",
                time: dateLabel, // Reusing logic
                items: (row.order_items ?? []).length,
                priority: priority,
            };
        });
    }

    async getCustomerHistory(_session: ActorSession, _customerId: string): Promise<OrderSummary[]> {
        const { data, error } = await supabase
            .from("orders")
            .select("reference, created_at, status, total, order_items(id)")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[SupabaseOrderRepo] Error fetching customer history:", error.message);
            return [];
        }

        return (data ?? []).map(row => ({
            id: row.reference,
            date: new Date(row.created_at).toLocaleDateString("es-ES", {
                day: "2-digit", month: "2-digit", year: "numeric"
            }),
            status: row.status as OrderStatus,
            items: (row.order_items ?? []).length,
            total: Number(row.total),
        }));
    }

    // ── Writes ─────────────────────────────────────────────

    async createOrder(session: ActorSession, orderData: Partial<Order>): Promise<Order> {
        console.log("[SupabaseOrderRepo] 🔄 createOrder called by:", session.name);

        // 1. Generate a collision-safe reference
        const year = new Date().getFullYear();
        const uid = crypto.randomUUID().slice(0, 8).toUpperCase();
        const reference = `PED-${year}-${uid}`;

        // 2. Compute total from items
        const items = orderData.items ?? [];
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 3. Insert order row — tenant_id comes from session, NOT from frontend data
        const { data: orderRow, error: orderError } = await supabase
            .from("orders")
            .insert({
                tenant_id: session.tenantId,
                actor_id: session.actorId,
                reference,
                customer_name: session.name,
                company_name: orderData.company ?? "",
                status: "pending_validation",
                total,
                notes: orderData.notes ?? null,
                shipping_address: orderData.address ?? null,
                shipping_date: orderData.shippingDate ?? null,
            })
            .select("id, reference, customer_name, company_name, status, total, notes, shipping_address, shipping_date, created_at")
            .single();

        if (orderError || !orderRow) {
            console.error("[SupabaseOrderRepo] ❌ Insert order failed:", orderError?.message);
            throw new Error(`Error creando pedido: ${orderError?.message ?? "Sin datos devueltos"}`);
        }

        console.log("[SupabaseOrderRepo] ✅ Order created:", orderRow.reference, "id:", orderRow.id);

        // 4. Batch-insert order_items
        let insertedItems: AdminOrderItem[] = [];

        if (items.length > 0) {
            const itemRows = items.map(item => ({
                tenant_id: session.tenantId,
                order_id: orderRow.id,
                product_id: item.id || null, // Allow null for custom items if DB permits, or ensure ID exists
                name: item.name,
                unit_price: item.price,
                quantity: item.quantity,
                unit: "Ud",
                // line_total is GENERATED ALWAYS in DB -> DO NOT INSERT
                is_custom: item.isCustom ?? false,
            }));

            const { data: itemsData, error: itemsError } = await supabase
                .from("order_items")
                .insert(itemRows)
                .select("id, name, quantity, unit_price, line_total, is_custom");

            if (itemsError) {
                console.error("[SupabaseOrderRepo] ❌ Insert items failed:", itemsError.message);
                // Atomic: delete the orphan order and throw
                await supabase.from("orders").delete().eq("id", orderRow.id);
                throw new Error(`Error insertando items: ${itemsError.message}`);
            } else {
                insertedItems = (itemsData ?? []).map(row => ({
                    id: row.id,
                    name: row.name,
                    quantity: row.quantity,
                    price: Number(row.unit_price),
                    // line_total comes back from the SELECT
                    total: Number(row.line_total),
                    isCustom: row.is_custom
                }));
                console.log(`[SupabaseOrderRepo] ✅ ${insertedItems.length} items inserted`);
            }
        }

        // 5. Return full Order mapped to frontend shape
        return {
            id: orderRow.reference,
            customer: {
                id: session.actorId,
                name: orderRow.customer_name
            },
            company: orderRow.company_name,
            date: new Date(orderRow.created_at).toLocaleDateString("es-ES", {
                day: "2-digit", month: "2-digit", year: "numeric"
            }),
            status: orderRow.status as OrderStatus,
            total: Number(orderRow.total),
            notes: orderRow.notes ?? undefined,
            address: orderRow.shipping_address ?? undefined,
            shippingDate: orderRow.shipping_date ?? undefined,
            items: insertedItems,
        };
    }

    async validateOrder(session: ActorSession, orderId: string): Promise<Order> {
        console.log("[SupabaseOrderRepo] 🔄 validateOrder:", orderId, "by:", session.name);

        // Permission check — only admin and commercial can validate
        if (session.role !== "admin" && session.role !== "commercial") {
            throw new Error(`Sin permisos: el rol '${session.role}' no puede validar pedidos.`);
        }

        // Fetch current order to preserve notes
        const { data: current } = await supabase
            .from("orders")
            .select("notes")
            .eq("reference", orderId)
            .single();

        const existingNotes = current?.notes ?? "";
        const validationNote = `Validado por ${session.name} el ${new Date().toLocaleString("es-ES")}`;
        const mergedNotes = existingNotes
            ? `${existingNotes}\n---\n${validationNote}`
            : validationNote;

        // Update status: pending_validation → confirmed
        const { data: updated, error } = await supabase
            .from("orders")
            .update({
                status: "confirmed",
                notes: mergedNotes,
                updated_at: new Date().toISOString(),
            })
            .eq("reference", orderId)
            .select(`
                id, reference, customer_name, company_name, status, total,
                notes, shipping_address, shipping_date, created_at,
                order_items (id, name, quantity, unit_price, line_total, is_custom)
            `)
            .single();

        if (error || !updated) {
            console.error("[SupabaseOrderRepo] ❌ validateOrder failed:", error?.message);
            throw new Error(`Error validando pedido: ${error?.message ?? "Pedido no encontrado"}`);
        }

        console.log("[SupabaseOrderRepo] ✅ Order validated:", updated.reference);

        return this._mapRowToOrder(updated);
    }

    async updateOrderStatus(session: ActorSession, orderId: string, status: OrderStatus): Promise<Order> {
        console.log("[SupabaseOrderRepo] 🔄 updateOrderStatus:", orderId, "→", status, "by:", session.name);

        // Validate transition
        const { data: currentRow } = await supabase
            .from("orders")
            .select("status")
            .eq("reference", orderId)
            .single();

        if (currentRow) {
            const currentStatus = currentRow.status as OrderStatus;
            const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
            if (!allowed.includes(status)) {
                throw new Error(
                    `Transición no permitida: ${currentStatus} → ${status}. ` +
                    `Transiciones válidas: ${allowed.join(", ") || "ninguna"}`
                );
            }
        }

        const { data: updated, error } = await supabase
            .from("orders")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("reference", orderId)
            .select(`
                id, reference, customer_name, company_name, status, total,
                notes, shipping_address, shipping_date, created_at,
                order_items (id, name, quantity, unit_price)
            `)
            .single();

        if (error || !updated) {
            console.error("[SupabaseOrderRepo] ❌ updateOrderStatus failed:", error?.message);
            throw new Error(`Error actualizando estado: ${error?.message ?? "Pedido no encontrado"}`);
        }

        console.log("[SupabaseOrderRepo] ✅ Status updated:", updated.reference, "→", status);

        return this._mapRowToOrder(updated);
    }

    // ── Private Helpers ────────────────────────────────────

    /** Maps a DB row (with nested order_items) to the frontend Order type */
    private _mapRowToOrder(row: Record<string, unknown>): Order {
        const items = (row.order_items ?? []) as Array<Record<string, unknown>>;
        return {
            id: row.reference as string,
            customer: {
                id: row.actor_id as string,
                name: (row.actors as any)?.name || row.customer_name as string
            },
            company: row.company_name as string,
            date: new Date(row.created_at as string).toLocaleDateString("es-ES", {
                day: "2-digit", month: "2-digit", year: "numeric"
            }),
            status: row.status as OrderStatus,
            total: Number(row.total),
            notes: (row.notes as string) ?? undefined,
            address: (row.shipping_address as string) ?? undefined,
            shippingDate: (row.shipping_date as string) ?? undefined,
            items: items.map(item => ({
                id: item.id as string,
                name: item.name as string,
                quantity: item.quantity as number,
                price: Number(item.unit_price),
                total: Number(item.line_total),
                isCustom: item.is_custom as boolean,
            })),
        };
    }
}
