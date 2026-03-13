import { useState, useMemo, useEffect } from "react";
import { productRepository, adminProductRepository } from "@/data/repositories";
import { useProducts } from "@/hooks/useProducts";
import { useActor } from "@/contexts/ActorContext";
import type { AdminProductRow } from "@/data/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PackageSearch,
  Plus,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// AdminProducts — /admin/products
// Lists ALL products (active + inactive) via productRepository.getAdminProducts()
// UI → productRepository → SupabaseProductRepository → Supabase
// ─────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const navigate = useNavigate();
  const { session } = useActor();
  const { t, i18n } = useTranslation();

  // Admin product rows — full list (no is_active filter)
  const [rows, setRows] = useState<AdminProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Categories — for resolving categoryId → human label
  const { categories } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");

  // ── Data fetch ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await productRepository.getAdminProducts();
        if (!cancelled) setRows(data);
      } catch (err) {
        console.error("[AdminProducts] Failed to fetch products:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Category label resolver ──────────────────────────────────
  const categoryLabel = (categoryId: string): string => {
    return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
  };

  // ── Client-side filtering ─────────────────────────────────────
  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return rows;
    return rows.filter(
      (p) =>
        p.code.toLowerCase().includes(term) ||
        categoryLabel(p.categoryId).toLowerCase().includes(term),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchTerm, categories]);

  // ── Price formatter ──────────────────────────────────────────
  // Use i18n.language so decimal/thousands separators match the UI language
  const formatPrice = (price: number) => {
    const locale = i18n.language === "es" ? "es-ES" : "en-GB";
    return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(price);
  };

  // ── Delete Handler ───────────────────────────────────────────
  const handleDelete = async (productId: string, code: string) => {
    if (!session) return;
    setIsDeletingId(productId);
    try {
      await adminProductRepository.deleteProduct(session, productId);
      toast.success(t("adminProducts.toasts.deleted", { code }));
      setRows((prev) => prev.filter((r) => r.id !== productId));
    } catch (err: any) {
      console.error("[AdminProducts] Delete failed:", err);
      toast.error(err.message || t("common.error"));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <PackageSearch className="w-8 h-8 text-primary" />
            {t("adminProducts.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("adminProducts.subtitle")}
          </p>
        </div>
        <Button
          id="btn-create-product"
          onClick={() => navigate("/admin/products/new")}
          className="shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("adminProducts.createProduct")}
        </Button>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex items-center gap-4 p-4 border border-border/50 bg-card rounded-xl shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="input-product-search"
            placeholder={t("adminProducts.searchPlaceholder")}
            className="pl-9 bg-background/50 border-border/50 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto">
          {t("adminProducts.productCount", { count: filteredRows.length })}
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-5 py-3.5 w-16">{t("adminProducts.columns.img")}</th>
                <th className="px-5 py-3.5">{t("adminProducts.columns.code")}</th>
                <th className="px-5 py-3.5">{t("adminProducts.columns.price")}</th>
                <th className="px-5 py-3.5">{t("adminProducts.columns.unit")}</th>
                <th className="px-5 py-3.5">{t("adminProducts.columns.category")}</th>
                <th className="px-5 py-3.5">{t("adminProducts.columns.status")}</th>
                <th className="px-5 py-3.5 w-[100px] text-center">{t("adminProducts.columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">

              {/* Loading skeletons */}
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3"><Skeleton className="h-10 w-10 rounded-md" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-8 w-16 mx-auto" /></td>
                  </tr>
                ))}

              {/* Empty state */}
              {!isLoading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    {t("adminProducts.noProducts")}
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!isLoading &&
                filteredRows.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Image */}
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-border/50 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.code}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <PackageSearch size={18} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-5 py-3 font-semibold text-foreground tracking-wide">
                      {product.code}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 font-mono text-xs tabular-nums">
                      {formatPrice(product.price)}
                    </td>

                    {/* Unit */}
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {product.unit}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium px-2 h-5"
                      >
                        {categoryLabel(product.categoryId)}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      {product.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 text-[10px] font-semibold h-5 px-1.5">
                          {t("adminProducts.status.active")}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5 opacity-60"
                        >
                          {t("adminProducts.status.inactive")}
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit */}
                        <Button
                          id={`btn-edit-${product.code}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                          onClick={() =>
                            navigate(`/admin/products/${product.code}/edit`)
                          }
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              id={`btn-delete-${product.code}`}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                              title="Eliminar producto"
                              disabled={isDeletingId === product.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("adminProducts.deleteDialog.title")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("adminProducts.deleteDialog.description", { code: product.code })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("adminProducts.deleteDialog.cancel")}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(product.id, product.code)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeletingId === product.id
                                  ? t("adminProducts.deleteDialog.deleting")
                                  : t("adminProducts.deleteDialog.confirm")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
