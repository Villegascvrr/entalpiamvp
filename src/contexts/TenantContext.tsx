import React, { createContext, useContext, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// Tenant Context
// Provides tenant identity throughout the application.
// Currently static; will be dynamic after auth integration.
// ─────────────────────────────────────────────────────────────

export interface Tenant {
    id: string;
    name: string;
    slug: string;
}

interface TenantContextType {
    tenant: Tenant;
    tenantId: string;
}

const DEFAULT_TENANT: Tenant = {
    id: "tenant_entalpia",
    name: "ENTALPIA Europe",
    slug: "entalpia",
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    // Static for now — will be resolved from auth/subdomain later
    const tenant = DEFAULT_TENANT;

    return (
        <TenantContext.Provider value={{ tenant, tenantId: tenant.id }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}
