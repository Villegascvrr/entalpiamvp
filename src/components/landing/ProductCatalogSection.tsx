import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { categories as mockCategories } from "@/data/mock-products";
import { supabase } from "@/lib/supabaseClient";
import { isDemoMode } from "@/config/appConfig";
import type { Category } from "@/data/types";

export function ProductCatalogSection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                if (isDemoMode()) {
                    setCategories(mockCategories);
                } else {
                    const { data, error } = await supabase
                        .from("product_categories")
                        .select("id, label, icon_key, description, image_url, detailed_text, sort_order")
                        .order("sort_order");

                    if (error) throw error;

                    const mapped: Category[] = (data || []).map((row) => ({
                        id: row.id,
                        label: row.label,
                        iconKey: row.icon_key,
                        description: row.description,
                        image: row.image_url ?? undefined,
                        detailedText: row.detailed_text ?? undefined,
                    }));

                    setCategories(mapped);
                }
            } catch (err) {
                console.error("Error loading categories for landing:", err);
                setCategories(mockCategories);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return (
        <section id="catalogo" className="py-24 bg-[#f7f7f7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-green-700 text-xs font-semibold uppercase tracking-widest mb-3">
                        Catálogo Profesional
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Gama de Productos
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Accede a nuestro catálogo completo con precios actualizados, stock
                        disponible y condiciones personalizadas para tu empresa.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                ) : (
                    /* Cards grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                            >
                                {/* Image (Top, natural, no overlay) */}
                                <div className="h-48 overflow-hidden bg-gray-100 border-b border-gray-100">
                                    <img
                                        src={cat.image || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=75"}
                                        alt={cat.label}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=75";
                                        }}
                                    />
                                </div>

                                {/* Body (Bottom, text below image) */}
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                        {cat.label}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-1">
                                        {cat.description}
                                    </p>

                                    {/* CTA Button (Outline Green) */}
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-700 text-green-700 text-sm font-semibold hover:bg-green-700 hover:text-white transition-all w-full"
                                    >
                                        <Lock size={14} />
                                        Ver catálogo
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom note */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-400">
                        El catálogo completo con precios, stock y fichas técnicas está disponible
                        exclusivamente para clientes registrados.
                    </p>
                </div>
            </div>
        </section>
    );
}
