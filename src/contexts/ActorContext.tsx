import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { appConfig } from "@/config/appConfig";
import type { Session } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Actor Session — Identity & Permissions
// In demo mode: uses a static mock session.
// In development/production: resolves from Supabase auth + actors table.
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
    isLoading: boolean;
    hasRole: (role: ActorRole | ActorRole[]) => boolean;
    login: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const ActorContext = createContext<ActorContextType | undefined>(undefined);

// ── Mock session for demo mode ──
const MOCK_SESSION: ActorSession = {
    actorId: "usr_mock_123",
    role: "admin",
    tenantId: "tnt_entalpia_eu",
    name: "Demo Admin",
    email: "admin@entalpia.com",
};

// ── Resolve actor row from Supabase after auth ──
// Has its own timeout to prevent hanging on slow DB queries.
async function resolveActor(authUserId: string, email: string): Promise<ActorSession | null> {
    console.log("[ActorContext] 🔍 resolveActor called");
    console.log("[ActorContext]   auth_user_id:", authUserId);
    console.log("[ActorContext]   email:", email);

    // Race between the actual query and a 2.5s timeout
    const queryPromise = supabase
        .from("actors")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "Actor query timed out (2.5s)" } }), 2500)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    console.log("[ActorContext] 📋 Actor query response:", {
        data: data ? { id: data.id, role: data.role, name: data.name, tenant_id: data.tenant_id } : null,
        error: error ? error : null,
    });

    if (error) {
        console.error("[ActorContext] ❌ Actor query error:", error);
        return null;
    }

    if (!data) {
        // RLS might be returning empty — log explicitly
        console.error("[ActorContext] ⚠️ EMPTY RESULT — Authenticated but actor profile NOT found.");
        console.error("[ActorContext]   This means either:");
        console.error("[ActorContext]   1. No row in 'actors' table with auth_user_id =", authUserId);
        console.error("[ActorContext]   2. RLS policy is blocking the SELECT (actor can't read their own row)");
        console.error("[ActorContext]   3. The auth_user_id column doesn't match auth.uid()");
        return null;
    }

    console.log("[ActorContext] ✅ Actor resolved:", data.name, "role:", data.role);

    // Force tenant separation based on Data Mode (Dev Tool)
    let effectiveTenantId = data.tenant_id;

    if (appConfig.mode === "development") {
        effectiveTenantId = "entalpia-demo";
    } else if (appConfig.mode === "production") {
        effectiveTenantId = "entalpia-real-dev";
    }

    console.log(`[ActorContext] 🌍 Tenant Override: ${data.tenant_id} -> ${effectiveTenantId} (Mode: ${appConfig.mode})`);

    return {
        actorId: data.id,
        role: data.role as ActorRole,
        tenantId: effectiveTenantId,
        name: data.name,
        email,
    };
}

export function ActorProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<ActorSession | null>(null); // Start unauthenticated even in demo
    const [isLoading, setIsLoading] = useState(true);
    const initCompleteRef = useRef(false);
    const mountedRef = useRef(true);
    const loginInProgressRef = useRef(false);

    useEffect(() => {
        // In demo mode, we just stop loading.
        if (appConfig.mode === "demo") {
            setIsLoading(false);
            return;
        }

        mountedRef.current = true;

        // ... (rest of useEffect logic unchanged) ...

        // ═══════════════════════════════════════════════════════
        // SAFETY TIMEOUT — absolute maximum wait of 3 seconds.
        // After this, isLoading WILL be false no matter what.
        // ═══════════════════════════════════════════════════════
        const safetyTimer = setTimeout(() => {
            if (mountedRef.current) {
                console.warn("[ActorContext] ⚠️ Safety timeout (3s) — forcing isLoading=false");
                setIsLoading(false);
                initCompleteRef.current = true;
            }
        }, 3000);

        // ═══════════════════════════════════════════════════════
        // STEP 1: Explicit session check (single source of truth)
        // ═══════════════════════════════════════════════════════
        const initAuth = async () => {
            console.log("[ActorContext] 🔄 initAuth started");
            try {
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();

                console.log("[ActorContext] getSession result:", {
                    hasSession: !!initialSession,
                    uid: initialSession?.user?.id,
                    email: initialSession?.user?.email,
                    error: error?.message,
                });

                if (error) throw error;

                if (initialSession?.user) {
                    console.log("[ActorContext] auth.uid() =", initialSession.user.id);
                    const actor = await resolveActor(
                        initialSession.user.id,
                        initialSession.user.email ?? ""
                    );
                    if (mountedRef.current) {
                        if (actor) {
                            setSession(actor);
                            console.log("[ActorContext] ✅ Session set from getSession:", actor.role);
                        } else {
                            console.error("[ActorContext] ❌ Authenticated but actor profile not found — showing login with error");
                            setSession(null);
                        }
                    }
                } else {
                    console.log("[ActorContext] No initial session — showing login");
                }
            } catch (err) {
                console.error("[ActorContext] ❌ Init error:", err);
                if (mountedRef.current) setSession(null);
            } finally {
                if (mountedRef.current) {
                    setIsLoading(false);
                    initCompleteRef.current = true;
                    console.log("[ActorContext] ✅ initAuth complete — isLoading=false");
                }
            }
        };

        initAuth();

        // ═══════════════════════════════════════════════════════
        // STEP 2: Auth state change listener (subsequent events only)
        // Only processes events AFTER init is complete to avoid
        // race conditions with getSession.
        // ═══════════════════════════════════════════════════════
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, authSession) => {
                if (!mountedRef.current) return;

                console.log("[ActorContext] Auth event:", event, "initComplete:", initCompleteRef.current);

                // Ignore INITIAL_SESSION — we handle it via getSession above
                if (event === "INITIAL_SESSION") {
                    console.log("[ActorContext] Skipping INITIAL_SESSION (handled by getSession)");
                    return;
                }

                if (event === "SIGNED_OUT") {
                    console.log("[ActorContext] SIGNED_OUT — clearing session");
                    setSession(null);
                    setIsLoading(false);
                    return;
                }

                if (event === "SIGNED_IN" && authSession?.user) {
                    // Skip if login() is handling this directly
                    if (loginInProgressRef.current) {
                        console.log("[ActorContext] SIGNED_IN — skipping (login() is handling it)");
                        return;
                    }
                    // Skip if init hasn't completed yet (getSession handles it)
                    if (!initCompleteRef.current) {
                        console.log("[ActorContext] SIGNED_IN before init complete — skipping (getSession handles it)");
                        return;
                    }

                    console.log("[ActorContext] SIGNED_IN event — resolving actor");
                    setIsLoading(true);
                    try {
                        const actor = await resolveActor(
                            authSession.user.id,
                            authSession.user.email ?? ""
                        );
                        if (mountedRef.current) setSession(actor);
                    } catch (err) {
                        console.error("[ActorContext] ❌ SIGNED_IN resolve error:", err);
                        if (mountedRef.current) setSession(null);
                    } finally {
                        if (mountedRef.current) setIsLoading(false);
                    }
                }

                if (event === "TOKEN_REFRESHED") {
                    console.log("[ActorContext] TOKEN_REFRESHED — no action needed");
                }
            }
        );

        return () => {
            mountedRef.current = false;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, []);

    // ═══════════════════════════════════════════════════════
    // LOGIN — called directly from Login.tsx form submission.
    // Resolves actor inline. ALWAYS sets isLoading=false.
    // ═══════════════════════════════════════════════════════
    const login = async (email: string, password: string) => {
        console.log("[ActorContext] 🔑 login() called for:", email);
        loginInProgressRef.current = true;
        setIsLoading(true);

        // MOCK MODE LOGIN
        if (appConfig.mode === "demo") {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 800));

            // Simple mock logic based on email
            let role: ActorRole = "customer";
            if (email.includes("admin")) role = "admin";
            if (email.includes("comercial")) role = "commercial";
            if (email.includes("logistica")) role = "logistics";

            const mockSession: ActorSession = {
                actorId: "usr_mock_" + role,
                role: role,
                tenantId: "tnt_mock",
                name: "Mock " + role.toUpperCase(),
                email: email
            };

            setSession(mockSession);
            setIsLoading(false);
            loginInProgressRef.current = false;
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            console.log("[ActorContext] signInWithPassword result:", {
                hasSession: !!data?.session,
                uid: data?.session?.user?.id,
                email: data?.session?.user?.email,
                error: error?.message,
            });

            if (error) {
                throw error;
            }

            if (data.session?.user) {
                const actor = await resolveActor(data.session.user.id, data.session.user.email ?? "");
                if (actor) {
                    setSession(actor);
                    console.log("[ActorContext] ✅ login() success:", actor.role);
                } else {
                    // Actor not found — sign out and show error
                    console.error("[ActorContext] ❌ login() — no actor row found, signing out");
                    await supabase.auth.signOut();
                    setSession(null);
                    throw new Error("Authenticated but actor profile not found. Contacta al administrador.");
                }
            }
        } catch (err) {
            throw err;
        } finally {
            loginInProgressRef.current = false;
            setIsLoading(false);
            console.log("[ActorContext] login() complete — isLoading=false, loginInProgress=false");
        }
    };

    const hasRole = (role: ActorRole | ActorRole[]) => {
        if (!session) return false;
        if (Array.isArray(role)) return role.includes(session.role);
        return session.role === role;
    };

    const signOut = async () => {
        console.log("[ActorContext] 🚪 signOut() called");
        if (appConfig.mode === "demo") {
            window.location.reload();
            return;
        }
        await supabase.auth.signOut();
        setSession(null);
    };

    const value: ActorContextType = {
        session,
        setSession,
        isAuthenticated: !!session,
        isLoading,
        hasRole,
        login,
        signOut,
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
