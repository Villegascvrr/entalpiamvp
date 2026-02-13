import type { CustomerRepository } from "./CustomerRepository";
import type { Customer } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

const MOCK_CUSTOMERS: Customer[] = [
    {
        id: "mock-1",
        tenant_id: "entalpia-demo",
        name: "Instalaciones López S.L.",
        province: "Sevilla",
        cif: "B91234567",
        contact_name: "Antonio López",
        email: "compras@instalacioneslopez.es",
        phone: "954123456",
        sales_points: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-2",
        tenant_id: "entalpia-demo",
        name: "Climatización Sur",
        province: "Cádiz",
        cif: "B34567891",
        contact_name: "María Torres",
        email: "m.torres@climasur.com",
        phone: "956987654",
        sales_points: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "mock-3",
        tenant_id: "entalpia-demo",
        name: "Distribuciones Andalucía",
        province: "Málaga",
        cif: "B56789123",
        contact_name: "Javier Ruiz",
        email: "j.ruiz@distribucionesand.es",
        phone: "952456789",
        sales_points: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

export class MockCustomerRepository implements CustomerRepository {
    private customers: Customer[] = [...MOCK_CUSTOMERS];

    async getCustomers(session: ActorSession): Promise<Customer[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        return this.customers;
    }

    async getCustomerById(session: ActorSession, id: string): Promise<Customer | null> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return this.customers.find(c => c.id === id) || null;
    }

    async createCustomer(session: ActorSession, data: Partial<Customer>): Promise<Customer> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newCustomer: Customer = {
            id: `mock-${Date.now()}`,
            tenant_id: session.tenantId || "entalpia-demo",
            name: data.name || "Nuevo Cliente",
            cif: data.cif,
            province: data.province,
            contact_name: data.contact_name,
            email: data.email,
            phone: data.phone,
            sales_points: data.sales_points || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...data
        } as Customer;

        this.customers.unshift(newCustomer);
        return newCustomer;
    }

    async updateCustomer(session: ActorSession, id: string, data: Partial<Customer>): Promise<Customer> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) throw new Error("Customer not found");

        const updated = { ...this.customers[index], ...data, updated_at: new Date().toISOString() };
        this.customers[index] = updated;
        return updated;
    }
}
