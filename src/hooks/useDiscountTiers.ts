import type { DiscountTier } from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useDiscountTiers() {
  const [tiers, setTiers] = useState<DiscountTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from("discount_tiers")
          .select("*")
          .order("discount_percentage", { ascending: true });

        if (error) throw error;
        setTiers(data as DiscountTier[]);
      } catch (err: any) {
        console.error("Error fetching discount tiers:", err);
        toast.error("Error al cargar niveles de descuento");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiers();
  }, []);

  return { tiers, isLoading };
}
