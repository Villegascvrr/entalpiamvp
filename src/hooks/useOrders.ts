import { useActor } from "@/contexts/ActorContext";
import { orderRepository } from "@/data/repositories";
import type {
  Order,
  OrderStatus,
  OrderSummary,
  RecentOrder,
} from "@/data/types";
import { useCallback, useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────
// useOrders — Data provider hook (reads + writes)
// All data flows through OrderRepository.
// Write actions auto-refresh reads after mutation.
// ─────────────────────────────────────────────────────────────

interface UseOrdersResult {
  // ── Read state ──
  adminOrders: Order[];
  activeOrders: Order[];
  archivedOrders: Order[];
  recentOrders: RecentOrder[];
  historyOrders: OrderSummary[];
  isLoading: boolean;
  error: string | null;

  // ── Read actions ──
  refresh: () => void;

  // ── Write actions ──
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  validateOrder: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
  ) => Promise<Order | null>;
  isMutating: boolean;
}

export function useOrders(): UseOrdersResult {
  const { session } = useActor();
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => setRefreshTrigger((prev) => prev + 1), []);

  // ── Fetch (reads) ─────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("[useOrders] session:", session);
        const admin = await orderRepository.getAdminOrders(session);
        console.log("[useOrders] getAdminOrders returned:", admin.length, "orders");
        setAdminOrders(admin);

        // Derive active and archived using frontend filtering
        const active = admin.filter(o => o.status !== "delivered" && o.status !== "cancelled");
        setActiveOrders(active);

        const archived = admin.filter(o => o.status === "delivered" || o.status === "cancelled");
        setArchivedOrders(archived);

        // Map recent orders (limit to 10 latest)
        setRecentOrders(admin.slice(0, 10).map(o => {
          let priority: "low" | "medium" | "high" = "low";
          if (o.total > 5000) priority = "high";
          else if (o.total > 1000) priority = "medium";
          
          return {
            id: o.id,
            date: o.date,
            status: o.status,
            total: o.total,
            customer: o.company || o.customer.name, // Display company ideally
            time: o.date,
            items: o.items.length,
            priority,
          };
        }));

        // Map customer history
        setHistoryOrders(archived.map(o => ({
          id: o.id,
          date: o.date,
          status: o.status,
          items: o.items.length,
          total: o.total,
        })));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Error loading order data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, refreshTrigger]);

  // ── Write: createOrder ────────────────────────────────

  const createOrder = useCallback(
    async (orderData: Partial<Order>): Promise<Order | null> => {
      if (!session) return null;
      setIsMutating(true);
      setError(null);
      try {
        const created = await orderRepository.createOrder(session, orderData);
        refresh(); // Re-fetch reads to reflect the new order
        return created;
      } catch (err) {
        console.error("Failed to create order:", err);
        setError("Error creating order");
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [session, refresh],
  );

  // ── Write: validateOrder ──────────────────────────────

  const validateOrder = useCallback(
    async (orderId: string): Promise<Order | null> => {
      if (!session) return null;
      setIsMutating(true);
      setError(null);
      try {
        const validated = await orderRepository.validateOrder(session, orderId);
        refresh(); // Re-fetch reads to reflect validated status
        return validated;
      } catch (err) {
        console.error("Failed to validate order:", err);
        setError(err instanceof Error ? err.message : "Error validating order");
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [session, refresh],
  );

  // ── Write: updateOrderStatus ──────────────────────────

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<Order | null> => {
      if (!session) return null;
      setIsMutating(true);
      setError(null);
      try {
        const updated = await orderRepository.updateOrderStatus(
          session,
          orderId,
          status,
        );
        refresh(); // Re-fetch reads to reflect new status
        return updated;
      } catch (err) {
        console.error("Failed to update order status:", err);
        setError("Error updating order status");
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [session, refresh],
  );

  return {
    adminOrders,
    activeOrders,
    archivedOrders,
    recentOrders,
    historyOrders,
    isLoading,
    error,
    refresh,
    createOrder,
    validateOrder,
    updateOrderStatus,
    isMutating,
  };
}
