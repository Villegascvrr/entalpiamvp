import type { QuickProduct, LmeData } from "./types";

// ─────────────────────────────────────────────────────────────
// Dashboard-specific mock data
// When backend is ready, replace with API calls.
// ─────────────────────────────────────────────────────────────

/** LME copper market data */
export const lmeData: LmeData = {
    price: 8432.50,
    change: 2.3,
    updated: "08:30 CET"
};

/** Quick product pricing for dashboard */
export const quickProducts: QuickProduct[] = [
    { id: "ENT-CU-15", name: "Tubo 15mm Rollo", price: 245.80, change: 2.3, stock: "disponible" },
    { id: "ENT-CU-18", name: "Tubo 18mm Rollo", price: 312.50, change: 1.8, stock: "disponible" },
    { id: "ENT-CU-22", name: "Tubo 22mm Rollo", price: 198.90, change: 2.1, stock: "disponible" },
    { id: "ENT-CU-28", name: "Tubo 28mm Barra", price: 89.40, change: 1.5, stock: "bajo" },
    { id: "ENT-CU-35", name: "Tubo 35mm Barra", price: 142.60, change: -0.5, stock: "bajo" },
];
