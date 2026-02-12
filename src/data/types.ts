// ─────────────────────────────────────────────────────────────
// Shared TypeScript types for Entalpia MVP
// All data models that will eventually map to backend entities.
// ─────────────────────────────────────────────────────────────

/** Order status lifecycle — canonical keys used everywhere */
export type OrderStatus = "draft" | "pending_validation" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled";

/** Display labels for OrderStatus (Spanish) */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    draft: "Borrador",
    pending_validation: "Pend. Validación",
    confirmed: "Confirmado",
    preparing: "En Preparación",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
};

/** A product in the catalog */
export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
    specs: string;
    image?: string;
}

/** A category in the product catalog */
export interface Category {
    id: string;
    label: string;
    iconKey: string; // lucide icon name, resolved in component
    description: string;
    image?: string;
    detailedText?: string;
}

/** A line item within an order */
export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    notes?: string;
    isCustom?: boolean;
    category?: string;
    image?: string;
}

/** A simplified order item (for admin views without unit) */
export interface AdminOrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total?: number;
    isCustom?: boolean;
}

/** A full order (admin / internal view) */
export interface Order {
    id: string;
    customer: string;
    company: string;
    date: string;
    status: OrderStatus;
    items: AdminOrderItem[];
    total: number;
    notes?: string;
    address?: string;
    shippingDate?: string;
    emails?: string[];
}

/** A simplified order (customer history view) */
export interface OrderSummary {
    id: string;
    date: string;
    status: OrderStatus;
    items: number;
    total: number;
}

/** A recent order for the customer dashboard */
export interface RecentOrder {
    id: string;
    date: string;
    status: string;
    total: number;
}

/** A quick product row for the customer dashboard */
export interface QuickProduct {
    id: string;
    name: string;
    price: number;
    change: number;
    stock: "disponible" | "bajo";
}

/** LME market data */
export interface LmeData {
    price: number;
    change: number;
    updated: string;
}
