import { appConfig } from "@/config/appConfig";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
  customerId?: string; // Links actor to a specific customer profile
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
// ── Resolve actor row from Supabase after auth ──
async function resolveActor(
  authUserId: string,
  email: string,
): Promise<ActorSession | null> {
  console.log("[ActorContext] 🔍 resolveActor called");
  console.log("[ActorContext]   auth_user_id:", authUserId);

  // Direct query without artificial timeout race condition
  const { data, error } = await supabase
    .from("actors")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("[ActorContext] ❌ Actor query error:", error);
    return null;
  }

  if (!data) {
    console.warn(
      "[ActorContext] ⚠️ Actor not found by ID. Attempting fallback by Email...",
    );

    // FALLBACK: User ID mismatch (common in Sandbox/Seed data)
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("actors")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fallbackData) {
      console.log(
        "[ActorContext] 🔄 Recovered via Email Fallback:",
        fallbackData.name,
      );
      // Optional: Auto-fix ID in background (if RLS allows)
      // supabase.from("actors").update({ auth_user_id: authUserId }).eq("id", fallbackData.id);
      return {
        actorId: fallbackData.id,
        role: fallbackData.role as ActorRole,
        tenantId:
          appConfig.mode === "development"
            ? "entalpia-demo"
            : fallbackData.tenant_id,
        name: fallbackData.name,
        email,
      };
    }

    console.error(
      "[ActorContext] ❌ EMPTY RESULT — Authenticated but actor profile NOT found (ID or Email).",
    );
    return null;
  }

  console.log(
    "[ActorContext] ✅ Actor resolved:",
    data.name,
    "role:",
    data.role,
  );

  // Force tenant separation based on Data Mode (Dev Tool)
  let effectiveTenantId = data.tenant_id;

  if (appConfig.mode === "development") {
    effectiveTenantId = "entalpia-demo";
  } else if (appConfig.mode === "production") {
    effectiveTenantId = "entalpia-real-dev";
  }

  return {
    actorId: data.id,
    role: data.role as ActorRole,
    tenantId: effectiveTenantId,
    name: data.name,
    email,
    customerId: data.customer_id, // Include the linked customer ID
  };
}

export function ActorProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ActorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  // Keep track of auth session separately to unblock UI immediately
  const [authSession, setAuthSession] = useState<Session | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      console.log("[ActorContext] 🔄 init() started");
      try {
        // ═══════════════════════════════════════════════════════
        // PHASE 1: AUTH SESSION (Blocking) - MUST COMPLETE
        // ═══════════════════════════════════════════════════════
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[ActorContext] ❌ getSession error:", error);
        }

        console.log("[AUTH] getSession finished");

        if (!mountedRef.current) return;

        setAuthSession(data.session);

        // ═══════════════════════════════════════════════════════
        // PHASE 2: ACTOR RESOLUTION — keep isLoading=true until done
        // ═══════════════════════════════════════════════════════
        if (data.session?.user) {
          console.log("[AUTH] resolving actor...");
          try {
            const actor = await resolveActor(
              data.session.user.id,
              data.session.user.email ?? "",
            );
            if (mountedRef.current) {
              setSession(actor);
              console.log("[ActorContext] ✅ Actor resolved:", actor?.role);
            }
          } catch (err) {
            console.error("[ActorContext] 💥 Actor resolution failed:", err);
          }
        } else {
          if (mountedRef.current) setSession(null);
        }

        // Only unblock UI after BOTH auth AND actor are ready
        if (mountedRef.current) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[ActorContext] 💥 Init Exception:", err);
        if (mountedRef.current) setIsLoading(false);
      }
    };

    // Initialize immediately
    init();

    // Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mountedRef.current) return;

      console.log("[ActorContext] 🔔 Auth Event:", event);
      setAuthSession(currentSession); // Update auth state immediately

      if (event === "SIGNED_OUT") {
        setSession(null);
        setAuthSession(null);
        return;
      }

      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        currentSession?.user
      ) {
        // Keep the gate blocked while we resolve the actor
        setIsLoading(true);
        resolveActor(
          currentSession.user.id,
          currentSession.user.email ?? "",
        ).then((actor) => {
          if (mountedRef.current) {
            setSession(actor);
            setIsLoading(false);
          }
        }).catch(() => {
          if (mountedRef.current) setIsLoading(false);
        });
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // ═══════════════════════════════════════════════════════
  // LOGIN — called directly from Login.tsx form submission.
  // Resolves actor inline. ALWAYS sets isLoading=false.
  // ═══════════════════════════════════════════════════════
  const login = async (email: string, password: string) => {
    console.log("[ActorContext] 🔑 login() called for:", email);
    setIsLoading(true);

    // MOCK MODE LOGIN
    if (appConfig.mode === "demo") {
      // REMOVED: Artificial delay
      // await new Promise(r => setTimeout(r, 800));

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
        email: email,
      };

      setSession(mockSession);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
        const actor = await resolveActor(
          data.session.user.id,
          data.session.user.email ?? "",
        );
        if (actor) {
          setSession(actor);
          console.log("[ActorContext] ✅ login() success:", actor.role);
        } else {
          // Actor not found — sign out and show error
          console.error(
            "[ActorContext] ❌ login() — no actor row found, signing out",
          );
          await supabase.auth.signOut();
          setSession(null);
          throw new Error(
            "Authenticated but actor profile not found. Contacta al administrador.",
          );
        }
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
      console.log("[ActorContext] login() complete — isLoading=false");
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
    isAuthenticated: appConfig.mode === "demo" ? !!session : !!(authSession && session),
    isLoading,
    hasRole,
    login,
    signOut,
  };

  return (
    <ActorContext.Provider value={value}>{children}</ActorContext.Provider>
  );
}

export function useActor() {
  const context = useContext(ActorContext);
  if (context === undefined) {
    throw new Error("useActor must be used within an ActorProvider");
  }
  return context;
}
