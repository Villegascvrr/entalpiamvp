import type {
  DeliveryDetails,
  Order,
  OrderItem,
  OrderStatus,
} from "@/data/types";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface OrderContextType {
  items: OrderItem[];
  currentStep: number;
  shippingDetails: {
    date: string;
    // Old fields kept compatible or deprecated
    address?: string;
    notes?: string;
    // New delivery object
    delivery: DeliveryDetails;
  };
  addItem: (product: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemNotes: (id: string, notes: string) => void;
  clearOrder: () => void;
  setStep: (step: number) => void;
  updateShipping: (
    details:
      | Partial<OrderContextType["shippingDetails"]>
      | Partial<DeliveryDetails>,
  ) => void;
  orderTotal: number;
  // Metadata for Central State Simulation
  orderReference: string;
  clientName: string;
  commercialName: string;
  lastSaved: Date | null;
  orderStatus: OrderStatus;
  submitOrder: (
    persistFn?: (data: Partial<Order>) => Promise<Order | null>,
  ) => Promise<Order | null>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Default safe values for delivery
  const defaultDelivery: DeliveryDetails = {
    address: "",
    city: "",
    postalCode: "",
    province: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    timeSlot: "all_day",
    type: "standard",
    requiresCallBefore: false,
    hasUnloadingRequirements: false,
    vehicleAccessNotes: "",
    instructions: "",
  };

  const [shippingDetails, setShippingDetails] = useState<
    OrderContextType["shippingDetails"]
  >({
    date: new Date().toISOString().split("T")[0],
    address: "",
    notes: "",
    delivery: defaultDelivery,
  });

  // Central State Data
  const [orderReference] = useState(
    `ENT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  );
  const [clientName] = useState("ENTALPIA Europe"); // Default for internal user
  const [commercialName] = useState("Antonio García");
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("draft");

  // Auto-save simulation on changes
  React.useEffect(() => {
    if (items.length > 0) {
      setLastSaved(new Date());
    }
  }, [items, shippingDetails, currentStep]);

  const submitOrder = async (
    persistFn?: (data: Partial<Order>) => Promise<Order | null>,
  ): Promise<Order | null> => {
    // Build the order payload from context state
    const orderPayload: Partial<Order> = {
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      notes: shippingDetails.notes || undefined,
      address: shippingDetails.address || undefined, // Legacy fallback
      shippingDate: shippingDetails.date || undefined,
      delivery: shippingDetails.delivery, // New structured data
      company: clientName,
    };

    // If a persist function was provided, call it (real Supabase write)
    let result: Order | null = null;
    if (persistFn) {
      result = await persistFn(orderPayload);
    }

    // Update local state regardless
    setOrderStatus("pending_validation");
    setLastSaved(new Date());
    return result;
  };

  const addItem = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        // toast.success(`Cantidad actualizada: ${product.name}`);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      // toast.success(`Producto añadido: ${product.name}`);
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1, // Default quantity
          unit: product.unit,
          category: product.category,
          image: product.image,
          minOrder: product.minOrder,
          notes: "",
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    // toast.info("Producto eliminado del pedido");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const updateItemNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));
  };

  const clearOrder = () => {
    setItems([]);
    setCurrentStep(1);
    setShippingDetails({
      date: new Date().toISOString().split("T")[0],
      address: "",
      notes: "",
      delivery: defaultDelivery,
    });
    // We probably don't clear the reference in this prototype session to simulate persistence,
    // but for a "New Order" flow we might want to reset it.
    // For now, let's keep the reference stable to minimize partial refresh confusion.
    setLastSaved(new Date());
  };

  const updateShipping = (updates: any) => {
    setShippingDetails((prev) => {
      // Handle simple updates (date, notes) vs nested delivery updates
      const isDeliveryUpdate = Object.keys(updates).some(
        (k) => k in defaultDelivery,
      );

      if (isDeliveryUpdate) {
        return {
          ...prev,
          delivery: { ...prev.delivery, ...updates },
        };
      }

      return { ...prev, ...updates };
    });
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  const orderTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <OrderContext.Provider
      value={{
        items,
        currentStep,
        shippingDetails,
        addItem,
        removeItem,
        updateQuantity,
        updateItemNotes,
        clearOrder,
        setStep,
        updateShipping,
        orderTotal,
        orderReference,
        clientName,
        commercialName,
        lastSaved,
        orderStatus,
        submitOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
