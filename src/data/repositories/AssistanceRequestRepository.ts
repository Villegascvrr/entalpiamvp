import type { ActorSession } from "@/contexts/ActorContext";
import type {
    AssistanceRequest,
    AssistanceRequestStatus,
} from "@/data/types";

// ─────────────────────────────────────────────────────────────
// Assistance Request Repository Interface
// All implementations (Mock, Supabase) must satisfy this contract.
// Switching logic lives in repositories/index.ts
// ─────────────────────────────────────────────────────────────

export interface CreateAssistanceRequestData {
    name: string;
    phone?: string;
    email?: string;
    message: string;
    customer_id?: string;
}

export interface AssistanceRequestRepository {
    /** Submit a new assistance request (any authenticated actor). */
    createAssistanceRequest(
        session: ActorSession,
        data: CreateAssistanceRequestData,
    ): Promise<AssistanceRequest>;

    /** Fetch all requests for the session's tenant, newest first. */
    getAssistanceRequestsByTenant(
        session: ActorSession,
    ): Promise<AssistanceRequest[]>;

    /** Update the status of a request (admin / commercial only). */
    updateAssistanceRequestStatus(
        session: ActorSession,
        id: string,
        status: AssistanceRequestStatus,
    ): Promise<AssistanceRequest>;
}

// ─────────────────────────────────────────────────────────────
// DEMO UI SEED DATA
// ⚠️  Only active when appConfig.mode === "demo" (Demo UI login mode).
// Completely isolated from Supabase — no tenant IDs, no real UUIDs.
// ─────────────────────────────────────────────────────────────
const MOCK_SEED: AssistanceRequest[] = [
    {
        id: "mock-ar-001",
        tenant_id: "mock-tenant",
        name: "Carlos García",
        phone: "+34 612 345 678",
        email: "carlos.garcia@constructora-norte.es",
        message:
            "Buenos días, necesito presupuesto para tubo de cobre 22mm y 28mm en grandes cantidades. Somos una constructora con obra en Bilbao. Si pudieran llamarme esta tarde, perfecto.",
        status: "NEW",
        created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
        id: "mock-ar-002",
        tenant_id: "mock-tenant",
        name: "Marta Sánchez",
        phone: "+34 699 876 543",
        email: "marta@fontaneria-ms.com",
        message:
            "Hola, ¿tenéis stock de rollos 15mm para entrega esta semana? Necesito al menos 50 rollos urgente para una instalación en Madrid.",
        status: "NEW",
        created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    {
        id: "mock-ar-003",
        tenant_id: "mock-tenant",
        name: "Javier Romero",
        phone: "+34 655 112 233",
        email: "javier.romero@klimatec.es",
        message:
            "Somos instaladores de climatización. Queremos abrir cuenta de cliente y establecer condiciones de compra habitual. ¿Con quién puedo hablar del departamento comercial?",
        status: "NEW",
        created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
        id: "mock-ar-004",
        tenant_id: "mock-tenant",
        name: "Ana López",
        phone: "+34 620 998 001",
        email: "ana.lopez@grupoconstruye.com",
        message:
            "Estamos comparando proveedores de cobre para nuestra red de suministro. Me gustaría recibir una tarifa actualizada con los precios LME + margen aplicado para nuestro segmento.",
        status: "IN_PROGRESS",
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
        id: "mock-ar-005",
        tenant_id: "mock-tenant",
        name: "Roberto Fernández",
        phone: "+34 666 500 200",
        email: "rfernandez@instalacionesrf.net",
        message:
            "Buen día. Tengo un pedido bloqueado desde hace tres días y no recibo respuesta del equipo de logística. Referencia PED-2025-1234. ¿Pueden decirme el estado?",
        status: "IN_PROGRESS",
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: "mock-ar-006",
        tenant_id: "mock-tenant",
        name: "Sofía Ruiz",
        phone: "+34 634 777 888",
        email: "sofia.ruiz@reformasruiz.es",
        message:
            "Solicito información sobre descuentos por volumen para compras superiores a 500 barras de cobre mensuales. Tenemos una promotora inmobiliaria con proyectos continuos en Valencia.",
        status: "CLOSED",
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
        id: "mock-ar-007",
        tenant_id: "mock-tenant",
        name: "David Torres",
        phone: "+34 600 321 654",
        email: "david.torres@tecnicogas.com",
        message:
            "¿Podéis hacer entrega en Sevilla? Necesito codos de cobre 90° 15mm y manguitos 18mm. Unas 200 y 150 unidades respectivamente para una instalación de gas.",
        status: "CLOSED",
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        id: "mock-ar-008",
        tenant_id: "mock-tenant",
        name: "Pilar Navarro",
        phone: "+34 688 012 345",
        email: "pilar.navarro@calefaccionpn.es",
        message:
            "Me interesa el tubo de cobre 54mm para un proyecto de calefacción centralizada. ¿Cuál es el precio actual y el plazo de entrega para 30 barras?",
        status: "CLOSED",
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: "mock-ar-009",
        tenant_id: "mock-tenant",
        name: "Miguel Herrera",
        phone: "+34 643 456 789",
        email: "miguel@fontaneria-herrera.com",
        message:
            "Somos empresa familiar con 20 años en el sector. Queremos empezar a trabajar con vosotros. ¿Cómo puedo registrarme como cliente y acceder a la plataforma?",
        status: "CLOSED",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
];



export class MockAssistanceRequestRepository
    implements AssistanceRequestRepository {
    private _requests: AssistanceRequest[] = [...MOCK_SEED];

    async createAssistanceRequest(
        session: ActorSession,
        data: CreateAssistanceRequestData,
    ): Promise<AssistanceRequest> {
        const newRequest: AssistanceRequest = {
            id: `mock-ar-${Date.now()}`,
            tenant_id: session.tenantId,
            actor_id: session.actorId,
            customer_id: data.customer_id ?? session.customerId,
            name: data.name,
            phone: data.phone,
            email: data.email,
            message: data.message,
            status: "NEW",
            created_at: new Date().toISOString(),
        };

        this._requests = [newRequest, ...this._requests];
        console.log(
            `[MockAssistanceRepo] WRITE createAssistanceRequest by ${session.actorId}`,
        );
        return newRequest;
    }

    async getAssistanceRequestsByTenant(
        session: ActorSession,
    ): Promise<AssistanceRequest[]> {
        console.log(
            `[MockAssistanceRepo] READ requests for tenant ${session.tenantId}`,
        );
        // In demo mode the session tenant_id differs from "mock-tenant" (seed data),
        // so we return all seed records to make the demo inbox fully visible.
        // In real Supabase mode this repo is never loaded — separation is guaranteed.
        return [...this._requests];
    }

    async updateAssistanceRequestStatus(
        session: ActorSession,
        id: string,
        status: AssistanceRequestStatus,
    ): Promise<AssistanceRequest> {
        if (session.role !== "admin" && session.role !== "commercial") {
            throw new Error(
                `[MockAssistanceRepo] DENIED: Role '${session.role}' cannot update request status.`,
            );
        }

        const index = this._requests.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new Error(`[MockAssistanceRepo] Request ${id} not found.`);
        }

        const updated: AssistanceRequest = {
            ...this._requests[index],
            status,
            updated_at: new Date().toISOString(),
        };
        this._requests[index] = updated;

        console.log(
            `[MockAssistanceRepo] WRITE updateStatus ${id} → ${status} by ${session.actorId}`,
        );
        return updated;
    }
}
