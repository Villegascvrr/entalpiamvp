import { useState, useEffect, useCallback } from "react";
import { useActor } from "@/contexts/ActorContext";
import { customerRepository } from "@/data/repositories";
import type { Customer } from "@/data/types";
import { toast } from "sonner";

export function useCustomers() {
    const { session } = useActor();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(() => setRefreshTrigger(prev => prev + 1), []);

    useEffect(() => {
        const fetchCustomers = async () => {
            if (!session) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await customerRepository.getCustomers(session);
                setCustomers(data);
            } catch (err: any) {
                console.error("Failed to fetch customers:", err);
                setError(err.message || "Error cargando clientes");
                toast.error("Error al cargar clientes");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomers();
    }, [session, refreshTrigger]);

    const createCustomer = async (data: Partial<Customer>) => {
        if (!session) return null;
        try {
            const newCustomer = await customerRepository.createCustomer(session, data);
            refresh();
            return newCustomer;
        } catch (err: any) {
            console.error("Failed to create customer:", err);
            toast.error("Error al crear cliente", { description: err.message });
            throw err;
        }
    };

    const updateCustomer = async (id: string, data: Partial<Customer>) => {
        if (!session) return null;
        try {
            const updated = await customerRepository.updateCustomer(session, id, data);
            refresh();
            return updated;
        } catch (err: any) {
            console.error("Failed to update customer:", err);
            toast.error("Error al actualizar cliente", { description: err.message });
            throw err;
        }
    };

    const getCustomerById = async (id: string) => {
        if (!session) return null;
        try {
            return await customerRepository.getCustomerById(session, id);
        } catch (err: any) {
            console.error("Failed to fetch customer by id:", err);
            return null;
        }
    };

    return {
        customers,
        isLoading,
        error,
        refresh,
        createCustomer,
        updateCustomer,
        getCustomerById
    };
}
