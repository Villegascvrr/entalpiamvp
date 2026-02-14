import type { RecentOrder, Order, OrderSummary, OrderStatus } from "./types";

// ─────────────────────────────────────────────────────────────
// Mock Orders — simulated data
// Status keys use canonical English from OrderStatus type.
// When backend is ready, replace with Supabase queries.
// ─────────────────────────────────────────────────────────────

/** Recent orders shown on customer dashboard */
export const recentOrders: RecentOrder[] = [
    { id: "ENT-2024-0146", date: "Hace 10 min", status: "pending_validation", total: 4250.00 },
    { id: "ENT-2024-0142", date: "Hoy 09:45", status: "confirmed", total: 1250.50 },
    { id: "ENT-2024-0138", date: "Ayer", status: "preparing", total: 8920.50 },
    { id: "ENT-2024-0135", date: "12/01", status: "shipped", total: 3400.00 },
];

/** Admin orders (full detail) */
export const adminOrders: Order[] = [
    {
        id: "PED-2024-0145",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Distribuciones Norte S.L.",
        date: "15/01/2024 09:45",
        status: "pending_validation" as OrderStatus,
        items: [
            { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", quantity: 20, price: 245.80 },
            { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", quantity: 10, price: 312.50 },
            { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", quantity: 200, price: 2.45 },
        ],
        total: 2450.00,
        address: "Pol. Ind. Norte, C/ Principal 45, 28001 Madrid",
        notes: "Entregar por la mañana"
    },
    {
        id: "PED-2024-0144",
        customer: { id: "mock-maria", name: "María López" },
        company: "Suministros Este S.A.",
        date: "15/01/2024 08:30",
        status: "pending_validation" as OrderStatus,
        items: [
            { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", quantity: 50, price: 198.90 },
            { id: "ENT-CU-28", name: "Tubo Cobre 28mm - Barra 5m", quantity: 30, price: 89.40 },
            { id: "ENT-CU-35", name: "Tubo Cobre 35mm - Barra 5m", quantity: 20, price: 142.60 },
            { id: "ENT-ACC-02", name: "Te Cobre 15mm", quantity: 500, price: 3.20 },
            { id: "ENT-ACC-03", name: "Manguito Cobre 18mm", quantity: 400, price: 1.85 },
        ],
        total: 8920.50,
        address: "Av. de la Industria 123, 28850 Torrejón",
    },
    {
        id: "PED-2024-0142",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Distribuciones Norte S.L.",
        date: "15/01/2024 07:15",
        status: "confirmed" as OrderStatus,
        items: [
            { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", quantity: 15, price: 245.80 },
            { id: "ENT-CU-54", name: "Tubo Cobre 54mm - Barra 5m", quantity: 8, price: 234.20 },
        ],
        total: 4250.00,
        address: "Pol. Ind. Norte, C/ Principal 45, 28001 Madrid",
    },
    {
        id: "PED-2024-0138",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Comercial Sur",
        date: "14/01/2024 16:20",
        status: "shipped" as OrderStatus,
        items: [
            { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", quantity: 5, price: 312.50 },
            { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", quantity: 100, price: 2.45 },
        ],
        total: 1890.00,
        address: "C/ del Comercio 78, 29001 Málaga",
    },
    {
        id: "PED-2024-0131",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Instalaciones Oeste",
        date: "14/01/2024 11:00",
        status: "delivered" as OrderStatus,
        items: [
            { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", quantity: 40, price: 245.80 },
            { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", quantity: 20, price: 198.90 },
        ],
        total: 12180.00,
        address: "Pol. Ind. Oeste, Nave 12, 41001 Sevilla",
    },
    {
        id: "PED-2024-0125",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Materiales Centro",
        date: "13/01/2024 14:30",
        status: "cancelled" as OrderStatus,
        items: [
            { id: "ENT-CU-42", name: "Tubo Cobre 42mm - Barra 5m", quantity: 25, price: 178.30 },
        ],
        total: 5640.25,
        address: "C/ Mayor 99, 45001 Toledo",
        notes: "Cancelado por cliente - sin stock"
    },
    // ── Migrated History Orders (to populate "History" view in Demo) ──
    {
        id: "PED-2024-0118",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Instalaciones Oeste",
        date: "08/01/2024 10:00",
        status: "delivered" as OrderStatus,
        items: [
            { id: "ENT-CU-15", name: "Tubo Cobre 15mm", quantity: 50, price: 245.00 }, // Simplified items
        ],
        total: 12450.00,
        address: "Pol. Ind. Oeste, Nave 12, 41001 Sevilla"
    },
    {
        id: "PED-2024-0112",
        customer: { id: "usr_mock_customer", name: "Mock CUSTOMER" },
        company: "Comercial Sur",
        date: "05/01/2024 09:30",
        status: "delivered" as OrderStatus,
        items: [
            { id: "ENT-ACC-01", name: "Codo Cobre 90°", quantity: 100, price: 2.45 },
        ],
        total: 890.50,
        address: "C/ del Comercio 78, 29001 Málaga"
    },
    {
        id: "PED-2023-1250",
        customer: { id: "mock-carlos", name: "Carlos Martínez" },
        company: "Distribuciones Norte S.L.",
        date: "28/12/2023 16:45",
        status: "delivered" as OrderStatus,
        items: [
            { id: "ENT-CU-18", name: "Tubo Cobre 18mm", quantity: 40, price: 312.00 },
        ],
        total: 15600.00,
        address: "Pol. Ind. Norte, C/ Principal 45, 28001 Madrid"
    },
    {
        id: "PED-2023-1248",
        customer: { id: "mock-maria", name: "María López" },
        company: "Suministros Este S.A.",
        date: "26/12/2023 11:20",
        status: "cancelled" as OrderStatus,
        items: [
            { id: "ENT-ACC-05", name: "Válvula Esfera 1/2", quantity: 50, price: 9.00 },
        ],
        total: 450.00,
        address: "Av. de la Industria 123, 28850 Torrejón",
        notes: "Error en direccion"
    },
    {
        id: "PED-2023-1242",
        customer: { id: "mock-roberto", name: "Roberto Sánchez" },
        company: "Materiales Centro",
        date: "20/12/2023 15:10",
        status: "delivered" as OrderStatus,
        items: [
            { id: "ENT-CU-22", name: "Tubo Cobre 22mm", quantity: 20, price: 160.00 },
        ],
        total: 3200.00,
        address: "C/ Mayor 99, 45001 Toledo"
    },
];

/** Order history (customer-facing simplified view) - DEPRECATED: Now derived from adminOrders */
export const historyOrders: OrderSummary[] = [];

// ─────────────────────────────────────────────────────────────
// Status display configuration (uses canonical keys)
// ─────────────────────────────────────────────────────────────

/** Status styles for customer dashboard badges */
export const statusStyles: Record<string, string> = {
    pending_validation: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    preparing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    shipped: "bg-primary/10 text-primary border-primary/20",
    delivered: "bg-green-500/10 text-green-600 border-green-500/20",
};
