import { useActor } from "@/contexts/ActorContext";
import { productRepository } from "@/data/repositories";
import type { Category, Product } from "@/data/types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────
// useProducts — Data provider hook
// All product reads go through ProductRepository + ActorSession.
// Re-fetches automatically when the UI language switcher changes.
// ─────────────────────────────────────────────────────────────

interface UseProductsResult {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProducts(): UseProductsResult {
  const { session } = useActor();
  // Subscribe to i18n so we re-fetch when the LanguageToggle changes language.
  // This makes the UI language switcher the single source of truth.
  const { i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      setIsLoading(true);
      setError(null);

      try {
        const [prods, cats] = await Promise.all([
          productRepository.getProducts(session),
          productRepository.getCategories(session),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Error loading product data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // i18n.language is included so products re-fetch when the UI language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, refreshTrigger, i18n.language]);

  return { products, categories, isLoading, error, refresh };
}
