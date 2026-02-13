import type { Customer } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

export interface CustomerRepository {
    getCustomers(session: ActorSession): Promise<Customer[]>;
    getCustomerById(session: ActorSession, id: string): Promise<Customer | null>;
    createCustomer(session: ActorSession, data: Partial<Customer>): Promise<Customer>;
    updateCustomer(session: ActorSession, id: string, data: Partial<Customer>): Promise<Customer>;
}
