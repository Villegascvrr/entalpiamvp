import { useState, useEffect } from "react";
import { productRepository } from "@/data/repositories/ProductRepository";
import { useActor } from "@/contexts/ActorContext";
import type { Product, Category } from "@/data/types";

// ─────────────────────────────────────────────────────────────
// useProducts — Data provider hook
// All product reads go through ProductRepository + ActorSession.
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
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

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
    }, [session, refreshTrigger]);

    return { products, categories, isLoading, error, refresh };
}
