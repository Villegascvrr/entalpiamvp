import { useActor } from "@/contexts/ActorContext";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appConfig } from "@/config/appConfig";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  customer_id?: string;
  customer_name?: string;
  created_at: string;
}

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
          // Mock data for demo UI
          setTimeout(() => {
            setUsers([
              {
                id: "usr_1",
                name: "Antonio Resines",
                email: "antonio@entalpia.eu",
                role: "admin",
                created_at: new Date().toISOString(),
              },
              {
                id: "usr_2",
                name: "Maria García",
                email: "mgarcia@instalacionesg.com",
                role: "customer",
                customer_id: "cust_1",
                customer_name: "Instalaciones García",
                created_at: new Date(Date.now() - 86400000).toISOString(),
              },
            ]);
            setIsLoading(false);
          }, 600);
          return;
        }

        const { data, error } = await supabase
          .from("actors")
          .select(`
            id,
            name,
            email,
            role,
            customer_id,
            created_at,
            customers (
              name
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped: UserRow[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
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

  const createUser = async (data: { name: string; email: string; role: string; customer_id?: string }) => {
    if (!session) return null;
    
    // In demo mode, just mock it
    if (appConfig.mode === "demo") {
      toast.success("Usuario creado (Demo Mode)");
      refresh();
      return true;
    }

    try {
      // 1. Create Identity via Supabase Auth (Invite Flow)
      // NOTE: This will only work if the auth API allows anon/authenticated users to invite,
      // or if there's an RLS policy granting this. Since Supabase client block admin by default, 
      // we use signUp to mimic identity creation for prototype purposes or fail gracefully.
      const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: tempPassword,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const authUserId = authData.user?.id;
      if (!authUserId) throw new Error("No se pudo obtener la identidad de Auth");

      // 2. Insert into actors table
      const { error: insertError } = await supabase.from("actors").insert({
        auth_user_id: authUserId,
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

  return {
    users,
    isLoading,
    refresh,
    createUser,
  };
}
