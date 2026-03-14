import type { ActorSession } from "@/contexts/ActorContext";
import type {
  AdminOrderItem,
  Order,
  OrderStatus,
  OrderSummary,
  OrderTimelineEvent,
  RecentOrder,
} from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import type { OrderRepository } from "./OrderRepository";

// ─────────────────────────────────────────────────────────────
// Supabase Order Repository — Full CRUD
// RLS filters by tenant via get_my_tenant_id(). Orders carry tenant_id;
// order_items, order_documents, order_state_history are isolated via order_id.
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

  async getAdminOrders(session: ActorSession): Promise<Order[]> {
    console.log("[getAdminOrders] querying with tenant_id:", session.tenantId);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
                id,
                reference,
                created_at,
                status,
                total,
                notes,
                actor_id,
                shipping_address,
                shipping_date,
                shipping_city,
                shipping_postal_code,
                shipping_province,
                contact_name,
                contact_phone,
                contact_email,
                shipping_time_slot,
                delivery_type,
                actors (
                  id,
                  name,
                  customers (
                    name
                  )
                ),
                order_items ( id )
            `,
      )
      .eq("tenant_id", session.tenantId)
      .order("created_at", { ascending: false });

    console.log("[getAdminOrders] supabase error:", error);
    console.log("[getAdminOrders] supabase data count:", data?.length ?? 0);

    if (error) {
      console.error(
        "[SupabaseOrderRepo] Error fetching admin orders:",
        error.message,
      );
      return [];
    }

    return (data ?? []).map((row) => {
      const actors = row.actors as { id?: string; name?: string; customers?: { name?: string } } | null | undefined;
      const orderItems = (row.order_items ?? []) as Array<{ id: string }>;

      const deliveryDetails = {
        address: (row.shipping_address as string) || "",
        city: (row.shipping_city as string) || "",
        postalCode: (row.shipping_postal_code as string) || "",
        province: (row.shipping_province as string) || "",
        contactName: (row.contact_name as string) || "",
        contactPhone: (row.contact_phone as string) || "",
        contactEmail: (row.contact_email as string) || "",
        timeSlot: (row.shipping_time_slot as any) || "all_day",
        type: (row.delivery_type as any) || "standard",
        instructions: "",
        requiresCallBefore: false,
        hasUnloadingRequirements: false,
        vehicleAccessNotes: "",
      };

      return {
        id: row.reference as string,
        customer: {
          id: (row.actor_id as string) ?? "",
          name: actors?.name ?? "Unknown",
        },
        company: actors?.customers?.name ?? "Unknown",
        date: new Date(row.created_at as string).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        status: row.status as OrderStatus,
        total: Number(row.total),
        notes: (row.notes as string) ?? undefined,
        address: (row.shipping_address as string) ?? undefined,
        shippingDate: (row.shipping_date as string) ?? undefined,
        delivery: deliveryDetails,
        // Item list for the admin table — only id available (no product details)
        items: orderItems.map((item) => ({
          id: item.id,
          name: "",
          quantity: 0,
          price: 0,
          total: 0,
        })),
      } as Order;
    });
  }

  async getActiveOrders(session: ActorSession): Promise<Order[]> {
    const allOrders = await this.getAdminOrders(session);
    return allOrders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    );
  }

  async getArchivedOrders(session: ActorSession): Promise<Order[]> {
    const allOrders = await this.getAdminOrders(session);
    return allOrders.filter(
      (o) => o.status === "delivered" || o.status === "cancelled",
    );
  }

  async getOrderTimeline(
    _session: ActorSession,
    orderId: string,
  ): Promise<OrderTimelineEvent[]> {
    const { data: orderData } = await supabase
      .from("orders")
      .select("id")
      .eq("reference", orderId)
      .single();

    if (!orderData) return [];

    const { data, error } = await supabase
      .from("order_state_history")
      .select(`
        *,
        actors ( name )
      `)
      .eq("order_id", orderData.id)
      .order("created_at", { ascending: true });

    if (error) {
       console.error("[SupabaseOrderRepo] Error fetching order timeline:", error.message);
       return [];
    }

    return (data || []).map((row) => {
      const actorName = row.actors?.name || row.changed_by;
      
      return {
        to_status: row.to_status as OrderStatus,
        changed_by: actorName,
        notes: row.notes || undefined,
        created_at: new Date(row.created_at).toLocaleString("es-ES", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
        }),
      };
    });
  }

  async getRecentOrders(session: ActorSession): Promise<RecentOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
                reference, 
                created_at, 
                status, 
                total,
                actors ( name ),
                order_items ( id )
            `,
      )
      .eq("tenant_id", session.tenantId)
      .order("created_at", { ascending: false })
      .limit(10); // Increased limit for Ops Queue

    if (error) {
      console.error(
        "[SupabaseOrderRepo] Error fetching recent orders:",
        error.message,
      );
      return [];
    }

    return (data ?? []).map((row) => {
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
          day: "2-digit",
          month: "2-digit",
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
        status: row.status as OrderStatus,
        total: total,
        // New fields for Ops Dashboard
        customer: (row.actors as any)?.name ?? "Desconocido",
        time: dateLabel, // Reusing logic
        items: (row.order_items ?? []).length,
        priority: priority,
      };
    });
  }

  async getCustomerHistory(
    session: ActorSession,
    _customerId: string,
  ): Promise<OrderSummary[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("reference, created_at, status, total, order_items(id)")
      .eq("tenant_id", session.tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "[SupabaseOrderRepo] Error fetching customer history:",
        error.message,
      );
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.reference,
      date: new Date(row.created_at).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      status: row.status as OrderStatus,
      items: (row.order_items ?? []).length,
      total: Number(row.total),
    }));
  }

  // ── Writes ─────────────────────────────────────────────

  async createOrder(
    session: ActorSession,
    orderData: Partial<Order>,
  ): Promise<Order> {
    console.log("[SupabaseOrderRepo] 🔄 createOrder called by:", session.name);

    // ── DEBUG: Task 2 — log session and incoming orderData
    console.log("CREATE ORDER SESSION", session);
    console.log("CREATE ORDER DATA", orderData);

    // 1. Generate a collision-safe reference
    const year = new Date().getFullYear();
    const uid = crypto.randomUUID().slice(0, 8).toUpperCase();
    const reference = `PED-${year}-${uid}`;

    // 2. Compute total from items
    const items = orderData.items ?? [];
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 3. Insert order row — tenant_id comes from session, NOT from frontend data
    const delivery = orderData.delivery;

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        tenant_id: session.tenantId,
        actor_id: session.actorId,
        reference,
        status: "pending_validation",
        total,
        notes: orderData.notes ?? null,
        // Shipping / delivery fields — matched exactly to the DB schema
        shipping_address: delivery?.address ?? orderData.address ?? null,
        shipping_date: orderData.shippingDate === "asap" ? null : orderData.shippingDate ?? null,
        shipping_city: delivery?.city ?? null,
        shipping_postal_code: delivery?.postalCode ?? null,
        shipping_province: delivery?.province ?? null,
        contact_name: delivery?.contactName ?? null,
        contact_phone: delivery?.contactPhone ?? null,
        contact_email: delivery?.contactEmail ?? null,
        shipping_time_slot: delivery?.timeSlot ?? null,
        delivery_type: delivery?.type ?? null,
      })
      .select(
        `
                id, reference, status, total, notes, created_at, actor_id,
                shipping_address, shipping_date,
                shipping_city, shipping_postal_code, shipping_province,
                contact_name, contact_phone, contact_email,
                shipping_time_slot, delivery_type,
                actors ( name, customers ( name ) )
            `,
      )
      .single();

    // ── DEBUG: Task 3 — log orders insert result
    console.log("ORDERS INSERT RESULT", orderRow, orderError);

    if (orderError || !orderRow) {
      console.error("SUPABASE ORDER ERROR", orderError);
      console.error(
        "[SupabaseOrderRepo] ❌ Insert order failed:",
        orderError?.message,
      );
      throw new Error(
        `Error creando pedido: ${orderError?.message ?? "Sin datos devueltos"}`,
      );
    }

    console.log(
      "[SupabaseOrderRepo] ✅ Order created:",
      orderRow.reference,
      "id:",
      orderRow.id,
    );

    // 4. Batch-insert order_items
    let insertedItems: AdminOrderItem[] = [];

    if (items.length > 0) {
      const itemRows = items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.id,
        unit_price: item.price,
        quantity: item.quantity,
        discount_percentage: (item as any).discountPercentage ?? 0,
      }));

      // ── DEBUG: Task 4 — log order_items payload before insert
      console.log("ORDER ITEMS PAYLOAD", itemRows);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .insert(itemRows)
        .select("id, quantity, unit_price, line_total");

      // ── DEBUG: Task 4 — log order_items insert result
      console.log("ORDER ITEMS INSERT RESULT", itemsData, itemsError);

      if (itemsError) {
        console.error("SUPABASE ORDER ERROR", itemsError);
        console.error(
          "[SupabaseOrderRepo] ❌ Insert items failed:",
          itemsError.message,
        );
        await supabase.from("orders").delete().eq("id", orderRow.id);
        throw new Error(`Error insertando items: ${itemsError.message}`);
      } else {
        insertedItems = (itemsData ?? []).map((row, i) => ({
          id: row.id,
          name: items[i].name,
          quantity: row.quantity,
          price: Number(row.unit_price),
          total: Number(row.line_total),
        }));
      }
    }

    // Insert first event into order_state_history
    await supabase.from("order_state_history").insert({
      order_id: orderRow.id,
      from_status: null,
      to_status: "pending_validation",
      changed_by: session.actorId,
    });

    // 5. Return full Order mapped to frontend shape
    return this._mapRowToOrder(orderRow, insertedItems);
  }

  async validateOrder(session: ActorSession, orderId: string): Promise<Order> {
    console.log(
      "[SupabaseOrderRepo] 🔄 validateOrder:",
      orderId,
      "by:",
      session.name,
    );

    // Permission check — only admin and commercial can validate
    if (session.role !== "admin" && session.role !== "commercial") {
      throw new Error(
        `Sin permisos: el rol '${session.role}' no puede validar pedidos.`,
      );
    }

    // Fetch current order to preserve notes
    const { data: current } = await supabase
      .from("orders")
      .select("id, status, notes")
      .eq("reference", orderId)
      .single();

    if (!current) throw new Error("Pedido no encontrado");

    const previousStatus = current.status;
    const internalOrderId = current.id;
    const existingNotes = current.notes ?? "";
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
      .select(
        `
                id, reference, status, total, notes, shipping_address, shipping_date, created_at, actor_id,
                actors ( name, customers ( name ) ),
                order_items ( id, product_id, quantity, unit_price, line_total, products ( name, unit, category_id ) )
            `,
      )
      .single();

    if (error || !updated) {
      console.error(
        "[SupabaseOrderRepo] ❌ validateOrder failed:",
        error?.message,
      );
      throw new Error(
        `Error validando pedido: ${error?.message ?? "Pedido no encontrado"}`,
      );
    }
    
    // Insert into order_state_history
    await supabase.from("order_state_history").insert({
      order_id: internalOrderId,
      from_status: previousStatus,
      to_status: "confirmed",
      changed_by: session.actorId,
      notes: validationNote
    });

    if (error || !updated) {
      console.error(
        "[SupabaseOrderRepo] ❌ validateOrder failed:",
        error?.message,
      );
      throw new Error(
        `Error validando pedido: ${error?.message ?? "Pedido no encontrado"}`,
      );
    }

    console.log("[SupabaseOrderRepo] ✅ Order validated:", updated.reference);

    return this._mapRowToOrder(updated);
  }

  async updateOrderStatus(
    session: ActorSession,
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    console.log(
      "[SupabaseOrderRepo] 🔄 updateOrderStatus:",
      orderId,
      "→",
      status,
      "by:",
      session.name,
    );

    // Validate transition
    const { data: currentRow } = await supabase
      .from("orders")
      .select("id, status")
      .eq("reference", orderId)
      .single();

    let previousStatus: string | null = null;
    let internalOrderId = "";

    if (currentRow) {
      internalOrderId = currentRow.id;
      previousStatus = currentRow.status;
      const currentStatus = currentRow.status as OrderStatus;
      const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
      if (!allowed.includes(status)) {
        throw new Error(
          `Transición no permitida: ${currentStatus} → ${status}. ` +
            `Transiciones válidas: ${allowed.join(", ") || "ninguna"}`,
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
      .select(
        `
                id, reference, status, total, notes, shipping_address, shipping_date, created_at, actor_id,
                actors ( name, customers ( name ) ),
                order_items ( id, product_id, quantity, unit_price, line_total, products ( name, unit, category_id ) )
            `,
      )
      .single();

    if (error || !updated) {
      console.error(
        "[SupabaseOrderRepo] ❌ updateOrderStatus failed:",
        error?.message,
      );
      throw new Error(
        `Error actualizando estado: ${error?.message ?? "Pedido no encontrado"}`,
      );
    }

    if (internalOrderId) {
      await supabase.from("order_state_history").insert({
        order_id: internalOrderId,
        from_status: previousStatus,
        to_status: status,
        changed_by: session.actorId,
      });
    }

    console.log(
      "[SupabaseOrderRepo] ✅ Status updated:",
      updated.reference,
      "→",
      status,
    );

    return this._mapRowToOrder(updated);
  }

  // ── Private Helpers ────────────────────────────────────

  /** Maps a DB row (with nested order_items) to the frontend Order type */
  private _mapRowToOrder(
    row: Record<string, unknown>,
    itemsOverride?: AdminOrderItem[],
  ): Order {
    const items =
      itemsOverride ??
      ((row.order_items ?? []) as Array<Record<string, unknown>>);

    // Construct DeliveryDetails from DB columns
    const deliveryDetails = {
      address: (row.shipping_address as string) || "",
      city: (row.shipping_city as string) || "",
      postalCode: (row.shipping_postal_code as string) || "",
      province: (row.shipping_province as string) || "",
      contactName: (row.contact_name as string) || "",
      contactPhone: (row.contact_phone as string) || "",
      contactEmail: (row.contact_email as string) || "",
      timeSlot: (row.shipping_time_slot as any) || "all_day",
      type: (row.delivery_type as any) || "standard",
      instructions: "",
      requiresCallBefore: false,
      hasUnloadingRequirements: false,
      vehicleAccessNotes: "",
    };

    const actors = row.actors as { name?: string; customers?: { name?: string } } | null | undefined;
    return {
      id: row.reference as string,
      customer: {
        id: row.actor_id as string,
        name: actors?.name ?? "",
      },
      company: actors?.customers?.name ?? "",
      date: new Date(row.created_at as string).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      status: row.status as OrderStatus,
      total: Number(row.total),
      notes: (row.notes as string) ?? undefined,
      address: (row.shipping_address as string) ?? undefined,
      shippingDate: (row.shipping_date as string) ?? undefined,
      delivery: deliveryDetails,
      items: items.map((item) => {
        const product = item.products as Record<string, unknown> | null | undefined;
        const name = (item.name as string) ?? (product?.name as string) ?? "";
        return {
          id: item.id as string,
          name,
          quantity: item.quantity as number,
          price: Number(item.unit_price),
          total: Number(
            item.line_total || Number(item.unit_price) * Number(item.quantity),
          ),
        };
      }),
    };
  }
}
