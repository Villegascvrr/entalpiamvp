import { useActor } from "@/contexts/ActorContext";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appConfig } from "@/config/appConfig";

export type UserStatus = "invited" | "active" | "disabled";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
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
    last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
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
    last_login: new Date(Date.now() - 86400000).toISOString(), // yesterday
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
    is_active: false,
    status: "invited",
    customer_id: "cust_2",
    customer_name: "Nueva Empresa SL",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
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
            customer_id,
            created_at,
            customers (
              name
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped: UserRow[] = (data || []).map((row: any) => {
          const isActive = row.is_active ?? true;
          // Derive status: if no auth_user_id, it is invited
          let status: UserStatus = "active";
          if (!isActive) status = "disabled";
          else if (!row.auth_user_id) status = "invited";

          return {
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            is_active: isActive,
            status,
            customer_id: row.customer_id,
            customer_name: row.customers?.name,
            created_at: row.created_at || new Date().toISOString(),
          };
        });

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

  const createUser = async (
    data: {
      name: string;
      email: string;
      role: string;
      customer_id?: string;
    },
    sendInvite: boolean = true
  ) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      toast.success(sendInvite ? "Usuario creado e invitado (Demo Mode)" : "Usuario guardado (Demo Mode)");
      const newUser: UserRow = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: true, // Remains active in DB, but status is "invited" since no auth yet (simulated)
        status: "invited",
        customer_id: data.customer_id,
        customer_name: data.customer_id ? "Empresa Seleccionada" : undefined,
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      return true;
    }

    try {
      let authUserId = null;

      if (sendInvite) {
        // Invite flow: create user in Supabase Auth via signUp
        const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: tempPassword,
        });

        if (authError) throw new Error(authError.message);
        authUserId = authData.user?.id;
        if (!authUserId) throw new Error("No se pudo obtener la identidad de Auth");
      }

      // Insert into actors table
      const { error: insertError } = await supabase.from("actors").insert({
        auth_user_id: authUserId, // null if sendInvite is false
        name: data.name,
        email: data.email,
        role: data.role,
        customer_id: data.role === "customer" ? data.customer_id : null,
        tenant_id: session.tenantId,
      });

      if (insertError) throw insertError;

      refresh();
      return true;
    } catch (err: any) {
      console.error("Error creating user:", err);
      throw err;
    }
  };

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
                ...data,
                status: !data.is_active
                  ? "disabled"
                  : u.status === "invited"
                  ? "invited"
                  : "active",
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
          customer_id: data.role === "customer" ? data.customer_id : null,
        })
        .eq("id", id);

      if (error) throw error;

      refresh();
      return true;
    } catch (err: any) {
      console.error("Error updating user:", err);
      throw err;
    }
  };

  const toggleUserStatus = async (id: string, enable: boolean) => {
    if (!session) return null;

    if (appConfig.mode === "demo") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, is_active: enable, status: enable ? "active" : "disabled" }
            : u
        )
      );
      toast.success(enable ? "Usuario activado" : "Usuario desactivado");
      return true;
    }

    try {
      const { error } = await supabase
        .from("actors")
        .update({ is_active: enable })
        .eq("id", id);

      if (error) throw error;
      refresh();
      return true;
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      throw err;
    }
  };

  const resendInvite = async (id: string) => {
    if (appConfig.mode === "demo") {
      toast.success("Invitación reenviada (Demo Mode)");
      return true;
    }
    // In production: call Supabase admin inviteUserByEmail or similar
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
    toggleUserStatus,
    resendInvite,
    resetPassword,
  };
}
