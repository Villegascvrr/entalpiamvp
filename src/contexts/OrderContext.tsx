import React, { createContext, useContext, useState, ReactNode } from "react";
import type { OrderItem, OrderStatus } from "@/data/types";
// import { toast } from "sonner";

interface OrderContextType {
    items: OrderItem[];
    currentStep: number;
    shippingDetails: {
        date: string;
        address?: string;
        notes?: string;
    };
    addItem: (product: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateItemNotes: (id: string, notes: string) => void;
    clearOrder: () => void;
    setStep: (step: number) => void;
    updateShipping: (details: Partial<OrderContextType["shippingDetails"]>) => void;
    orderTotal: number;
    // Metadata for Central State Simulation
    orderReference: string;
    clientName: string;
    commercialName: string;
    lastSaved: Date | null;
    orderStatus: OrderStatus;
    submitOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [shippingDetails, setShippingDetails] = useState({
        date: new Date().toISOString().split('T')[0],
        address: "",
        notes: ""
    });

    // Central State Data
    const [orderReference] = useState(`ENT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
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

    const submitOrder = () => {
        // Transition: Draft -> Pending Validation (canonical key)
        setOrderStatus("pending_validation");
        setLastSaved(new Date());
        // NOTE: In production, this will call orderRepository.createOrder()
        // For now, it updates local context state.
    };

    const addItem = (product: any) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                // toast.success(`Cantidad actualizada: ${product.name}`);
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            // toast.success(`Producto añadido: ${product.name}`);
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1, // Default quantity
                unit: product.unit,
                category: product.category,
                image: product.image,
                stock: product.stock,
                minOrder: product.minOrder,
                isCustom: product.isCustom || false,
                notes: ""
            }];
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
        // toast.info("Producto eliminado del pedido");
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const updateItemNotes = (id: string, notes: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
    };

    const clearOrder = () => {
        setItems([]);
        setCurrentStep(1);
        setShippingDetails({
            date: new Date().toISOString().split('T')[0],
            address: "",
            notes: ""
        });
        // We probably don't clear the reference in this prototype session to simulate persistence, 
        // but for a "New Order" flow we might want to reset it. 
        // For now, let's keep the reference stable to minimize partial refresh confusion.
        setLastSaved(new Date());
    };

    const updateShipping = (details: Partial<typeof shippingDetails>) => {
        setShippingDetails(prev => ({ ...prev, ...details }));
    };

    const setStep = (step: number) => {
        setCurrentStep(step);
    };

    const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <OrderContext.Provider value={{
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
            submitOrder
        }}>
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
