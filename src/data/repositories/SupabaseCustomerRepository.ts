import { supabase } from "@/lib/supabaseClient";
import type { CustomerRepository } from "./CustomerRepository";
import type { Customer } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

export class SupabaseCustomerRepository implements CustomerRepository {

    async getCustomers(session: ActorSession): Promise<Customer[]> {
        // RLS handles tenant filtering automatically
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[SupabaseCustomerRepo] Error fetching customers:", error.message);
            return [];
        }

        return data as Customer[];
    }

    async getCustomerById(session: ActorSession, id: string): Promise<Customer | null> {
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("[SupabaseCustomerRepo] Error fetching customer by id:", error.message);
            return null;
        }

        return data as Customer;
    }

    async createCustomer(session: ActorSession, customerData: Partial<Customer>): Promise<Customer> {
        console.log("[SupabaseCustomerRepo] createCustomer called by:", session.name);

        // Inject tenant_id from session (server-side RLS validates it)
        const payload = {
            ...customerData,
            tenant_id: session.tenantId, // Critical for multi-tenancy
        };

        const { data, error } = await supabase
            .from("customers")
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error("[SupabaseCustomerRepo] Error creating customer:", error.message);
            throw new Error(`Error creando cliente: ${error.message}`);
        }

        return data as Customer;
    }

    async updateCustomer(session: ActorSession, id: string, customerData: Partial<Customer>): Promise<Customer> {
        console.log("[SupabaseCustomerRepo] updateCustomer:", id);

        const payload = {
            ...customerData,
            updated_at: new Date().toISOString(),
        };

        // Remove immutable fields if present in partial data
        delete (payload as any).id;
        delete (payload as any).tenant_id;
        delete (payload as any).created_at;

        const { data, error } = await supabase
            .from("customers")
            .update(payload)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("[SupabaseCustomerRepo] Error updating customer:", error.message);
            throw new Error(`Error actualizando cliente: ${error.message}`);
        }

        return data as Customer;
    }
}
