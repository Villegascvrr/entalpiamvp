import { useActor } from "@/contexts/ActorContext";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appConfig } from "@/config/appConfig";

// ─────────────────────────────────────────────────────────────
// Explicit status values stored directly in actors.status
//
// draft          → Created by admin, no invite sent yet
// pending_invite → Invite email sent, user hasn't accepted
// active         → User has logged in and is active
// disabled       → Access disabled by admin
// deleted        → Soft-deleted (hidden from normal views)
// ─────────────────────────────────────────────────────────────
export type UserStatus = "draft" | "pending_invite" | "active" | "disabled" | "deleted";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  auth_user_id?: string | null;
  status: UserStatus;
  customer_id?: string;
  customer_name?: string;
  created_at: string;
  last_login?: string;
}

const DEMO_USERS: UserRow[] = [
  {
    id: "usr_1",
    name: "Antonio Resines",
    email: "antonio@entalpia.eu",
    role: "admin",
    is_active: true,
    status: "active",
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "usr_2",
    name: "Maria García",
    email: "mgarcia@instalacionesg.com",
    role: "customer",
    is_active: true,
    status: "active",
    customer_id: "cust_1",
    customer_name: "Instalaciones García",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_login: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "usr_3",
    name: "Carlos Vega",
    email: "cvega@empresa.com",
    role: "commercial",
    is_active: false,
    status: "disabled",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    last_login: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "usr_4",
    name: "Laura Martín",
    email: "laura@nuevaempresa.com",
    role: "customer",
    is_active: true,
    status: "draft",
    customer_id: "cust_2",
    customer_name: "Nueva Empresa SL",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "usr_5",
    name: "Pedro Sánchez",
    email: "pedro@cliente.com",
    role: "customer",
    is_active: true,
    status: "pending_invite",
    customer_id: "cust_1",
    customer_name: "Instalaciones García",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export function useUsers() {
  const { session } = useActor();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => setRefreshTrigger((prev) => prev + 1), []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        if (appConfig.mode === "demo") {
          setTimeout(() => {
            setUsers([...DEMO_USERS]);
            setIsLoading(false);
          }, 500);
          return;
        }

        const { data, error } = await supabase
          .from("actors")
          .select(`
            id,
            auth_user_id,
            name,
            email,
            role,
            is_active,
            status,
            customer_id,
            created_at,
            customers (
              name
            )
          `)
          .eq("tenant_id", session.tenantId)
          .neq("status", "deleted")          // soft-deleted users are hidden
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped: UserRow[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          is_active: row.is_active ?? true,
          auth_user_id: row.auth_user_id,
          status: (row.status ?? "draft") as UserStatus,
          customer_id: row.customer_id,
          customer_name: row.customers?.name,
          created_at: row.created_at || new Date().toISOString(),
        }));

        setUsers(mapped);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        toast.error("Error al cargar usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [session, refreshTrigger]);

  // ─────────────────────────────────────────────────────────
  // createUser — inserts a new actor record.
  // status = 'draft'  (no invite sent yet)
  // auth_user_id = NULL
  // is_active = true
  // tenant_id scoped from current session
  // ─────────────────────────────────────────────────────────
  const createUser = async (
    data: {
      name: string;
      email: string;
      role: string;
      customer_id?: string;
    },
    mode: "draft" | "invite"
  ) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      const newUser: UserRow = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: true,
        status: mode === "invite" ? "pending_invite" : "draft",
        customer_id: data.customer_id,
        customer_name: data.customer_id ? "Empresa Seleccionada" : undefined,
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      return true;
    }

    try {
      const { error } = await supabase.from("actors").insert({
        tenant_id: session.tenantId,
        name: data.name,
        email: data.email,
        role: data.role,
        customer_id: data.role === "customer" ? (data.customer_id ?? null) : null,
        is_active: true,
        auth_user_id: null,
        status: mode === "invite" ? "pending_invite" : "draft",
      });

      if (error) throw error;
      refresh();
      return true;
    } catch (err: any) {
      console.error("Error creating user:", err);
      throw err;
    }
  };

  // ─────────────────────────────────────────────────────────
  // updateUser — updates editable fields (name, email, role,
  // is_active, customer_id). Does NOT update status.
  // Scoped by id AND tenant_id.
  // ─────────────────────────────────────────────────────────
  const updateUser = async (
    id: string,
    data: { name: string; email: string; role: string; is_active: boolean; customer_id?: string }
  ) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                name: data.name,
                email: data.email,
                role: data.role,
                is_active: data.is_active,
                customer_id: data.role === "customer" ? data.customer_id : undefined,
                customer_name:
                  data.role === "customer" && data.customer_id
                    ? u.customer_id === data.customer_id
                      ? u.customer_name
                      : "Empresa Actualizada"
                    : undefined,
              }
            : u
        )
      );
      toast.success("Usuario actualizado");
      return true;
    }

    try {
      const { error } = await supabase
        .from("actors")
        .update({
          name: data.name,
          email: data.email,
          role: data.role,
          is_active: data.is_active,
          customer_id: data.role === "customer" ? (data.customer_id ?? null) : null,
        })
        .eq("id", id)
        .eq("tenant_id", session.tenantId);

      if (error) throw error;
      refresh();
      return true;
    } catch (err: any) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  // ─────────────────────────────────────────────────────────
  // disableUser — disables access by setting:
  //   status = 'disabled'
  //   is_active = false
  // Scoped by id AND tenant_id.
  // ─────────────────────────────────────────────────────────
  const disableUser = async (id: string) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: false, status: "disabled" } : u
        )
      );
      toast.success("Usuario desactivado");
      return true;
    }

    try {
      const { error } = await supabase
        .from("actors")
        .update({ status: "disabled" })
        .eq("id", id)
        .eq("tenant_id", session.tenantId);

      if (error) throw error;
      refresh();
      toast.success("Usuario desactivado");
      return true;
    } catch (err: any) {
      console.error("Error disabling user:", err);
      toast.error(err.message || "Error al desactivar usuario");
      throw err;
    }
  };

  // ─────────────────────────────────────────────────────────
  // enableUser — re-activates a disabled user:
  //   status = 'active'
  //   is_active = true
  // Scoped by id AND tenant_id.
  // ─────────────────────────────────────────────────────────
  const enableUser = async (id: string) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: true, status: "active" } : u
        )
      );
      toast.success("Usuario activado");
      return true;
    }

    try {
      const { error } = await supabase
        .from("actors")
        .update({ status: "active" })
        .eq("id", id)
        .eq("tenant_id", session.tenantId);

      if (error) throw error;
      refresh();
      toast.success("Usuario activado");
      return true;
    } catch (err: any) {
      console.error("Error enabling user:", err);
      toast.error(err.message || "Error al activar usuario");
      throw err;
    }
  };

  // ─────────────────────────────────────────────────────────
  // deleteUser — hard delete from actors table
  // Scoped by id AND tenant_id. Admin only.
  // ─────────────────────────────────────────────────────────
  const deleteUser = async (id: string) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Usuario eliminado");
      return true;
    }

    try {
      const { error, count } = await supabase
        .from("actors")
        .delete({ count: "exact" })
        .eq("id", id)
        .eq("tenant_id", session.tenantId);

      if (error) throw error;
      if (count === 0) throw new Error("No se pudo eliminar el usuario (no existe o no tienes permisos).");

      refresh();
      toast.success("Usuario eliminado correctamente");
      return true;
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast.error(err.message || "Error al eliminar usuario");
      throw err;
    }
  };

  const resendInvite = async (_id: string) => {
    if (appConfig.mode === "demo") {
      toast.success("Invitación reenviada (Demo Mode)");
      return true;
    }
    toast.info("Función no disponible en este entorno");
    return false;
  };

  const resetPassword = async (email: string) => {
    if (appConfig.mode === "demo") {
      toast.success(`Email de recuperación enviado a ${email} (Demo Mode)`);
      return true;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`Email de recuperación enviado a ${email}`);
      return true;
    } catch (err: any) {
      console.error("Error resetting password:", err);
      toast.error("Error al enviar el email de recuperación");
      return false;
    }
  };

  return {
    users,
    isLoading,
    refresh,
    createUser,
    updateUser,
    disableUser,
    enableUser,
    deleteUser,
    resendInvite,
    resetPassword,
  };
}
