import React, { createContext, useContext, useState, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// Actor Session — Logic & Permissions
// Defines "Who is doing this" for RLS preparation.
// ─────────────────────────────────────────────────────────────

export type ActorRole = "customer" | "commercial" | "logistics" | "admin";

export interface ActorSession {
    actorId: string;
    role: ActorRole;
    tenantId: string;
    name: string;
    email: string;
}

interface ActorContextType {
    session: ActorSession | null;
    setSession: (session: ActorSession) => void;
    isAuthenticated: boolean;
    hasRole: (role: ActorRole | ActorRole[]) => boolean;
}

const ActorContext = createContext<ActorContextType | undefined>(undefined);

// Mock initial session for Dev Mode
const defaultSession: ActorSession = {
    actorId: "usr_mock_123",
    role: "admin", // Defaulting to Admin for dev flow comfort, can switch in UI later
    tenantId: "tnt_entalpia_eu",
    name: "Demo Admin",
    email: "admin@entalpia.com"
};

export function ActorProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<ActorSession | null>(defaultSession);

    const hasRole = (role: ActorRole | ActorRole[]) => {
        if (!session) return false;
        if (Array.isArray(role)) {
            return role.includes(session.role);
        }
        return session.role === role;
    };

    const value = {
        session,
        setSession,
        isAuthenticated: !!session,
        hasRole
    };

    return (
        <ActorContext.Provider value={value}>
            {children}
        </ActorContext.Provider>
    );
}

export function useActor() {
    const context = useContext(ActorContext);
    if (context === undefined) {
        throw new Error("useActor must be used within an ActorProvider");
    }
    return context;
}
