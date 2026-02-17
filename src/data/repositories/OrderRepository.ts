import type { ActorSession } from "@/contexts/ActorContext";
import { adminOrders } from "@/data/mock-orders";
import type {
  Order,
  OrderStatus,
  OrderSummary,
  OrderTimelineEvent,
  RecentOrder,
} from "@/data/types";

// ─────────────────────────────────────────────────────────────
// Order Repository Interface
// Defines the contract for ALL data access (reads + writes).
// Implementation switching is handled by repositories/index.ts
// ─────────────────────────────────────────────────────────────

export interface OrderRepository {
  // ── Reads ──
  getAdminOrders(session: ActorSession): Promise<Order[]>;
  getActiveOrders(session: ActorSession): Promise<Order[]>;
  getArchivedOrders(session: ActorSession): Promise<Order[]>;
  getRecentOrders(session: ActorSession): Promise<RecentOrder[]>;
  getCustomerHistory(
    session: ActorSession,
    customerId: string,
  ): Promise<OrderSummary[]>; // Keeping for backward compat
  getOrderTimeline(
    session: ActorSession,
    orderId: string,
  ): Promise<OrderTimelineEvent[]>;

  // ── Writes ──
  createOrder(session: ActorSession, orderData: Partial<Order>): Promise<Order>;
  validateOrder(session: ActorSession, orderId: string): Promise<Order>;
  updateOrderStatus(
    session: ActorSession,
    orderId: string,
    status: OrderStatus,
  ): Promise<Order>;
}

// ─────────────────────────────────────────────────────────────
// Mock Implementation
// Uses an in-memory store seeded from mock data.
// All writes mutate the store so subsequent reads reflect them.
// ─────────────────────────────────────────────────────────────

export class MockOrderRepository implements OrderRepository {
  // Centralized mutable state — simulates a database table
  private _orders: Order[] = [...adminOrders];

  // ── Reads ──────────────────────────────────────────────

  async getAdminOrders(session: ActorSession): Promise<Order[]> {
    await this._delay(300);
    console.log(
      `[MockRepo] READ admin orders for ${session.role} @ ${session.tenantId}`,
    );

    // Simulate RLS: customers only see their own orders
    if (session.role === "customer") {
      return this._orders.filter((o) => o.customer.name === session.name);
    }
    return [...this._orders];
  }

  async getActiveOrders(session: ActorSession): Promise<Order[]> {
    await this._delay(300);
    // Active = NOT (delivered OR cancelled)
    const allOrders = await this.getAdminOrders(session);
    return allOrders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    );
  }

  async getArchivedOrders(session: ActorSession): Promise<Order[]> {
    await this._delay(300);
    // Archived = delivered OR cancelled
    const allOrders = await this.getAdminOrders(session);
    return allOrders.filter(
      (o) => o.status === "delivered" || o.status === "cancelled",
    );
  }

  async getRecentOrders(session: ActorSession): Promise<RecentOrder[]> {
    await this._delay(200);

    // Derive recent orders from the central mock store instead of static recentOrders
    // This ensures creating a new order visibly updates the Ops Queue
    return this._orders.slice(0, 10).map((o) => {
      const total = o.total;
      let priority: "low" | "medium" | "high" = "low";
      if (total > 5000) priority = "high";
      else if (total > 1000) priority = "medium";

      // Mock time label for demo purposes
      // In a real app we'd parse o.date and diff it, but mock dates are strings like "15/01/2024"
      // So we'll just return a random recent time for the demo effect
      const times = [
        "Hace 2 min",
        "Hace 15 min",
        "Hace 45 min",
        "Hace 2h",
        "Hace 5h",
      ];
      const randomTime = times[Math.floor(Math.random() * times.length)];

      return {
        id: o.id,
        date: o.date,
        status: o.status,
        total: o.total,
        customer: o.customer.name,
        time: randomTime,
        items: o.items.length,
        priority: priority,
      };
    });
  }

  async getCustomerHistory(
    session: ActorSession,
    customerId: string,
  ): Promise<OrderSummary[]> {
    // Deprecated: Alias to getArchivedOrders mapped to summary
    const archived = await this.getArchivedOrders(session);
    return archived.map((o) => ({
      id: o.id,
      date: o.date,
      status: o.status,
      items: o.items.length,
      total: o.total,
    }));
  }

  async getOrderTimeline(
    session: ActorSession,
    orderId: string,
  ): Promise<OrderTimelineEvent[]> {
    await this._delay(400);

    // Find the order
    // We bypass RLS check for timeline for now, or we can use getAdminOrders to be safe
    const order = this._orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`[MockRepo] Order ${orderId} not found.`);
    }

    return this._generateTimeline(order);
  }

  // ── Writes ─────────────────────────────────────────────

  async createOrder(
    session: ActorSession,
    orderData: Partial<Order>,
  ): Promise<Order> {
    await this._delay(600);

    const newOrder: Order = {
      id: `PED-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      status: "draft" as OrderStatus,
      date:
        new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) + " 09:00",
      total: orderData.total ?? 0,
      items: orderData.items ?? [],
      customer: {
        id: session.actorId,
        name: session.name,
      },
      company: orderData.company ?? "Sin empresa",
      notes: orderData.notes ?? "",
      ...orderData,
    } as Order;

    // Mutate in-memory store
    this._orders = [newOrder, ...this._orders];

    console.log(
      `[MockRepo] WRITE createOrder by ${session.actorId}: ${newOrder.id}`,
    );
    return newOrder;
  }

  async validateOrder(session: ActorSession, orderId: string): Promise<Order> {
    await this._delay(500);

    // Permission check simulation
    if (session.role !== "admin" && session.role !== "commercial") {
      throw new Error(
        `[MockRepo] DENIED: Role '${session.role}' cannot validate orders.`,
      );
    }

    const index = this._orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error(`[MockRepo] Order ${orderId} not found.`);
    }

    // Transition: pending_validation → confirmed
    const updated = {
      ...this._orders[index],
      status: "confirmed" as OrderStatus,
      notes: `Validado por ${session.name} el ${new Date().toLocaleString("es-ES")}`,
    };
    this._orders[index] = updated;

    console.log(
      `[MockRepo] WRITE validateOrder ${orderId} by ${session.actorId} → confirmado`,
    );
    return updated;
  }

  async updateOrderStatus(
    session: ActorSession,
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    await this._delay(400);

    const index = this._orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error(`[MockRepo] Order ${orderId} not found.`);
    }

    const updated = { ...this._orders[index], status };
    this._orders[index] = updated;

    console.log(
      `[MockRepo] WRITE updateOrderStatus ${orderId} → ${status} by ${session.actorId}`,
    );
    return updated;
  }

  // ── Helpers ─────────────────────────────────────────────

  private _generateTimeline(order: Order): OrderTimelineEvent[] {
    const events: OrderTimelineEvent[] = [];
    const baseDate = this._parseDate(order.date); // "15/01/2024 10:00" -> Date object

    // 1. DRAFT / CREATED
    events.push({
      from_status: null,
      to_status: "draft",
      changed_by: order.customer.name,
      created_at: this._formatDate(baseDate),
      notes: "Pedido creado",
    });

    if (order.status === "draft") return events;

    // 2. PENDING VALIDATION (Submitted)
    const date2 = new Date(baseDate.getTime() + 15 * 60000); // +15 mins
    events.push({
      from_status: "draft",
      to_status: "pending_validation",
      changed_by: order.customer.name,
      created_at: this._formatDate(date2),
      notes: "Enviado para revisión",
    });

    if (order.status === "pending_validation") return events;

    // 3. CONFIRMED / CANCELLED
    const date3 = new Date(date2.getTime() + 2 * 3600000); // +2 hours
    if (order.status === "cancelled") {
      events.push({
        from_status: "pending_validation",
        to_status: "cancelled",
        changed_by: "Sistema",
        created_at: this._formatDate(date3),
        notes: order.notes || "Cancelado por el administrador",
      });
      return events;
    }

    events.push({
      from_status: "pending_validation",
      to_status: "confirmed",
      changed_by: "Juan Pérez (Comercial)",
      created_at: this._formatDate(date3),
      notes: "Validado comercialmente. Pedido OK.",
    });

    if (order.status === "confirmed") return events;

    // 4. PREPARING
    const date4 = new Date(date3.getTime() + 4 * 3600000); // +4 hours
    events.push({
      from_status: "confirmed",
      to_status: "preparing",
      changed_by: "Almacén Central",
      created_at: this._formatDate(date4),
      notes: "Orden de preparación generada #OP-8821",
    });

    if (order.status === "preparing") return events;

    // 5. SHIPPED
    const date5 = new Date(date4.getTime() + 24 * 3600000); // +1 day
    events.push({
      from_status: "preparing",
      to_status: "shipped",
      changed_by: "Logística",
      created_at: this._formatDate(date5),
      notes:
        "Salida de almacén - Agencia Transportes XYZ. Tracking: 1Z999AA10123",
    });

    if (order.status === "shipped") return events;

    // 6. DELIVERED
    const date6 = new Date(date5.getTime() + 24 * 3600000); // +1 day
    events.push({
      from_status: "shipped",
      to_status: "delivered",
      changed_by: "Transportista",
      created_at: this._formatDate(date6),
      notes:
        "Entregado en destino. Firmado: " + order.customer.name.split(" ")[0],
    });

    return events;
  }

  private _parseDate(dateStr: string): Date {
    // Robust parsing handling "DD/MM/YYYY" and "DD/MM/YYYY HH:mm"
    try {
      const [datePart, timePart] = dateStr.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      let hours = 9,
        minutes = 0;

      if (timePart) {
        const [h, m] = timePart.split(":").map(Number);
        hours = h;
        minutes = m;
      }

      return new Date(year, month - 1, day, hours, minutes);
    } catch (e) {
      console.warn("Date parse error for", dateStr, e);
      return new Date(); // fallback
    }
  }

  private _formatDate(date: Date): string {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
