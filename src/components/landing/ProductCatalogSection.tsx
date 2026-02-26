import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { categories as mockCategories } from "@/data/mock-products";
import { supabase } from "@/lib/supabaseClient";
import { isDemoMode } from "@/config/appConfig";
import { useTranslation } from "react-i18next";
import type { Category } from "@/data/types";

export function ProductCatalogSection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === "es";

    const getCategoryDisplay = (cat: Category) => {
        if (isEs) return { label: cat.label, description: cat.description };

        switch (cat.label) {
            case "Refrigerantes":
                return {
                    label: "Refrigerants",
                    description: "Legal refrigerants (F-GAS 517/2014) with ISO certificate. Unique cylinder tracking system and laboratory with high quality gas chromatograph."
                };
            case "Cobre para refrigeración":
                return {
                    label: "Copper for Refrigeration",
                    description: "Insulated and bare copper pipes for assembly of high precision refrigeration systems."
                };
            case "Ventilación y accesorios":
                return {
                    label: "Ventilation and Accessories",
                    description: "Air transport solutions, industrial grilles and extractors."
                };
            case "Climatización y accesorios":
                return {
                    label: "Air Conditioning and Accessories",
                    description: "Supports, pumps and mounting elements for air conditioning equipment."
                };
            default:
                return { label: cat.label, description: cat.description };
        }
    };

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
                        {t("landing.catalog.badge")}
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        {t("landing.catalog.title")}
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        {t("landing.catalog.desc")}
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
                        {categories.map((cat) => {
                            const display = getCategoryDisplay(cat);
                            return (
                                <div
                                    key={cat.id}
                                    className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                                >
                                    {/* Image (Top, natural, no overlay) */}
                                    <div className="h-48 overflow-hidden bg-gray-100 border-b border-gray-100">
                                        <img
                                            src={cat.image || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=75"}
                                            alt={display.label}
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
                                            {display.label}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-1">
                                            {display.description}
                                        </p>

                                        {/* CTA Button (Outline Green) */}
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-700 text-green-700 text-sm font-semibold hover:bg-green-700 hover:text-white transition-all w-full"
                                        >
                                            <Lock size={14} />
                                            {t("landing.catalog.viewCatalog")}
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Bottom note */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-400">
                        {t("landing.catalog.footer")}
                    </p>
                </div>
            </div>
        </section>
    );
}
