// ─────────────────────────────────────────────────────────────
// Shared TypeScript types for Entalpia MVP
// All data models that will eventually map to backend entities.
// ─────────────────────────────────────────────────────────────

/** Order status lifecycle — canonical keys used everywhere */
export type OrderStatus =
  | "draft"
  | "pending_validation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  name: string;        // Mapped from products.code for UI compatibility
  category: string;
  price: number;
  unit: string;
  specs: string;       // Mapped from product_details.description for UI compatibility
  image?: string;
  discountPercentage?: number; // Applied discount (0-1)
  basePrice?: number;
  // New fields from the product_details model (optional – UI components don't break if absent)
  code?: string;
  description?: string;
  features?: Record<string, string>;
  safetySheetUrl?: string;
  lotSize?: number;
  minLots?: number;
}

// ─────────────────────────────────────────────────────────────
// Admin Product Write Types
// ─────────────────────────────────────────────────────────────

/** Input to create a new product (before image upload) */
export interface CreateProductInput {
  code: string;
  categoryId: string;
  price: number;
  unit: string;
  lotSize: number;
  minLots: number;
  isActive: boolean;
  imageFile: File; // Will be uploaded to storage/imgs/{code}.jpg
}

/** Input to update an existing product */
export interface UpdateProductInput {
  price?: number;
  unit?: string;
  lotSize?: number;
  minLots?: number;
  isActive?: boolean;
  imageFile?: File; // If provided, replaces the existing image
}

/** Language-specific product details – used for both insert and upsert */
export interface ProductDetailsInput {
  language: string;
  description: string;
  features: Record<string, string>;
  sourceUrl: string;
  pdfFile?: File; // If provided, will be uploaded to storage/pdfs/{language}/{code}.pdf
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

/** Session actor details */
export interface ActorSession {
  actorId: string;
  role: "admin" | "commercial" | "logistics" | "customer";
  tenantId: string;
  email: string;
  name: string;
  customerId?: string;
}

/** A line item within an order */
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  notes?: string;
  category?: string;
  image?: string;
  minOrder?: number;
}

/** A simplified order item (for admin views without unit) */
export interface AdminOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

/** A full order (admin / internal view) */
export interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  company: string;
  date: string;
  status: OrderStatus;
  items: AdminOrderItem[];
  total: number;
  notes?: string;
  delivery?: DeliveryDetails;
  address?: string; // Kept for backward compatibility
  shippingDate?: string; // Kept for backward compatibility or strict shipping date
  emails?: string[];
}

export interface DeliveryDetails {
  address: string;
  city: string;
  postalCode: string;
  province: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  timeSlot: "morning" | "afternoon" | "all_day" | "custom";
  type: "standard" | "pickup" | "urgent";
  instructions?: string;
  requiresCallBefore: boolean;
  hasUnloadingRequirements: boolean;
  vehicleAccessNotes?: string;
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
  // New fields for Ops Dashboard
  customer?: string;
  time?: string;
  items?: number;
  priority?: "low" | "medium" | "high";
}

/** A quick product row for the customer dashboard */
export interface QuickProduct {
  id: string;
  name: string;
  price: number;
  change: number;
}

/** LME market data */
export interface LmeData {
  price: number;
  change: number;
  updated: string;
}

/** CRM Customer Entity */
export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  province?: string;
  cif?: string;
  address?: string;
  postal_city?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  sales_points: number;
  created_at?: string;
  updated_at?: string;
  discount_tier_id?: string;
  discount_tier?: DiscountTier; // Joined data
}

export interface DiscountTier {
  id: string;
  name: string;
  discount_percentage: number;
}

/** LME Price Entity for manual entry */
export interface LMEPrice {
  id: string;
  tenant_id: string;
  price: number;
  date: string;
  source: string;
  created_by?: string;
  created_at?: string;
}

/** Event in the order timeline */
export interface OrderTimelineEvent {
  to_status: OrderStatus;
  changed_by: string; // Name of the actor
  notes?: string;
  created_at: string;
}

/** USD/EUR Exchange Rate */
export interface FXRate {
  id: string;
  rate: number;
  updated_at: string;
  updated_by: string;
}

/** Status lifecycle for commercial assistance requests */
export type AssistanceRequestStatus = "NEW" | "IN_PROGRESS" | "CLOSED";

/** A commercial assistance request submitted by a customer */
export interface AssistanceRequest {
  id: string;
  tenant_id: string;
  actor_id?: string;
  customer_id?: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  status: AssistanceRequestStatus;
  created_at: string;
  updated_at?: string;
}
