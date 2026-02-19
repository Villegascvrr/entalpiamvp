import type { LmeData, QuickProduct } from "./types";

// ─────────────────────────────────────────────────────────────
// Dashboard-specific mock data
// When backend is ready, replace with API calls.
// ─────────────────────────────────────────────────────────────

/** LME copper market data */
export const lmeData: LmeData = {
  price: 8432.5,
  change: 2.3,
  updated: "08:30 CET",
};

/** Quick product pricing for dashboard */
export const quickProducts: QuickProduct[] = [
  {
    id: "ENT-CU-15",
    name: "Tubo 15mm Rollo",
    price: 245.8,
    change: 2.3,
  },
  {
    id: "ENT-CU-18",
    name: "Tubo 18mm Rollo",
    price: 312.5,
    change: 1.8,
  },
  {
    id: "ENT-CU-22",
    name: "Tubo 22mm Rollo",
    price: 198.9,
    change: 2.1,
  },
  {
    id: "ENT-CU-28",
    name: "Tubo 28mm Barra",
    price: 89.4,
    change: 1.5,
  },
  {
    id: "ENT-CU-35",
    name: "Tubo 35mm Barra",
    price: 142.6,
    change: -0.5,
  },
];
