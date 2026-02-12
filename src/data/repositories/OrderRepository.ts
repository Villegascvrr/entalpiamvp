import { adminOrders, recentOrders, historyOrders } from "@/data/mock-orders";
import type { Order, RecentOrder, OrderSummary, OrderStatus } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

// ─────────────────────────────────────────────────────────────
// Order Repository Interface
// Defines the contract for ALL data access (reads + writes).
// Implementation switching is handled by repositories/index.ts
// ─────────────────────────────────────────────────────────────

export interface OrderRepository {
    // ── Reads ──
    getAdminOrders(session: ActorSession): Promise<Order[]>;
    getRecentOrders(session: ActorSession): Promise<RecentOrder[]>;
    getCustomerHistory(session: ActorSession, customerId: string): Promise<OrderSummary[]>;

    // ── Writes ──
    createOrder(session: ActorSession, orderData: Partial<Order>): Promise<Order>;
    validateOrder(session: ActorSession, orderId: string): Promise<Order>;
    updateOrderStatus(session: ActorSession, orderId: string, status: OrderStatus): Promise<Order>;
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
        console.log(`[MockRepo] READ admin orders for ${session.role} @ ${session.tenantId}`);

        // Simulate RLS: customers only see their own orders
        if (session.role === "customer") {
            return this._orders.filter(o => o.customer.name === session.name);
        }
        return [...this._orders];
    }

    async getRecentOrders(session: ActorSession): Promise<RecentOrder[]> {
        await this._delay(200);

        // Derive recent orders from the central mock store instead of static recentOrders
        // This ensures creating a new order visibly updates the Ops Queue
        return this._orders
            .slice(0, 10)
            .map(o => {
                const total = o.total;
                let priority: "low" | "medium" | "high" = "low";
                if (total > 5000) priority = "high";
                else if (total > 1000) priority = "medium";

                // Mock time label for demo purposes
                // In a real app we'd parse o.date and diff it, but mock dates are strings like "15/01/2024"
                // So we'll just return a random recent time for the demo effect
                const times = ["Hace 2 min", "Hace 15 min", "Hace 45 min", "Hace 2h", "Hace 5h"];
                const randomTime = times[Math.floor(Math.random() * times.length)];

                return {
                    id: o.id,
                    date: o.date,
                    status: o.status,
                    total: o.total,
                    customer: o.customer.name,
                    time: randomTime,
                    items: o.items.length,
                    priority: priority
                };
            });
    }

    async getCustomerHistory(session: ActorSession, customerId: string): Promise<OrderSummary[]> {
        await this._delay(300);
        return [...historyOrders];
    }

    // ── Writes ─────────────────────────────────────────────

    async createOrder(session: ActorSession, orderData: Partial<Order>): Promise<Order> {
        await this._delay(600);

        const newOrder: Order = {
            id: `PED-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
            status: "draft" as OrderStatus,
            date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
            total: orderData.total ?? 0,
            items: orderData.items ?? [],
            customer: {
                id: session.actorId,
                name: session.name
            },
            company: orderData.company ?? "Sin empresa",
            notes: orderData.notes ?? "",
            ...orderData
        } as Order;

        // Mutate in-memory store
        this._orders = [newOrder, ...this._orders];

        console.log(`[MockRepo] WRITE createOrder by ${session.actorId}: ${newOrder.id}`);
        return newOrder;
    }

    async validateOrder(session: ActorSession, orderId: string): Promise<Order> {
        await this._delay(500);

        // Permission check simulation
        if (session.role !== "admin" && session.role !== "commercial") {
            throw new Error(`[MockRepo] DENIED: Role '${session.role}' cannot validate orders.`);
        }

        const index = this._orders.findIndex(o => o.id === orderId);
        if (index === -1) {
            throw new Error(`[MockRepo] Order ${orderId} not found.`);
        }

        // Transition: pending_validation → confirmed
        const updated = {
            ...this._orders[index],
            status: "confirmed" as OrderStatus,
            notes: `Validado por ${session.name} el ${new Date().toLocaleString("es-ES")}`
        };
        this._orders[index] = updated;

        console.log(`[MockRepo] WRITE validateOrder ${orderId} by ${session.actorId} → confirmado`);
        return updated;
    }

    async updateOrderStatus(session: ActorSession, orderId: string, status: OrderStatus): Promise<Order> {
        await this._delay(400);

        const index = this._orders.findIndex(o => o.id === orderId);
        if (index === -1) {
            throw new Error(`[MockRepo] Order ${orderId} not found.`);
        }

        const updated = { ...this._orders[index], status };
        this._orders[index] = updated;

        console.log(`[MockRepo] WRITE updateOrderStatus ${orderId} → ${status} by ${session.actorId}`);
        return updated;
    }

    // ── Helpers ─────────────────────────────────────────────

    private _delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

