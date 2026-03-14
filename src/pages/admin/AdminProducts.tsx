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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PackageSearch,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProductRow | null>(null);

  // Categories — for resolving categoryId → human label
  const { categories } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    return rows.filter((p) => {
      // search
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.code.toLowerCase().includes(term) ||
        categoryLabel(p.categoryId).toLowerCase().includes(term);

      // category
      const matchesCategory = categoryFilter === "all" || p.categoryId === categoryFilter;

      // status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? p.isActive : !p.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, searchTerm, categories, categoryFilter, statusFilter]);

  // ── Price formatter ──────────────────────────────────────────
  // Use i18n.language so decimal/thousands separators match the UI language
  const formatPrice = (price: number) => {
    const locale = i18n.language === "es" ? "es-ES" : "en-GB";
    return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(price);
  };

  // ── Delete Handler ───────────────────────────────────────────
  const confirmDelete = (product: AdminProductRow) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!session || !productToDelete) return;

    setIsDeletingId(productToDelete.id);
    try {
      await adminProductRepository.deleteProduct(session, productToDelete.id);
      toast.success(t("adminProducts.toasts.deleted", { code: productToDelete.code }));
      setRows((prev) => prev.filter((r) => r.id !== productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      console.error("[AdminProducts] Delete failed:", err);
      toast.error(err.message || t("common.error"));
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden animate-in fade-in duration-300">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <PackageSearch className="h-5 w-5 text-indigo-600" />
              {t("adminProducts.title")}
            </h1>
            {!isLoading && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-5 font-normal bg-indigo-500/10 text-indigo-700 border-indigo-200"
              >
                {t(
                  filteredRows.length === 1
                    ? "adminProducts.productCount_one"
                    : "adminProducts.productCount_other",
                  { count: filteredRows.length }
                )}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t("adminProducts.subtitle")}</p>
        </div>
        <Button
          id="btn-create-product"
          onClick={() => navigate("/admin/products/new")}
          size="sm"
          className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" />
          {t("adminProducts.createProduct")}
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex-none px-6 py-3 border-b bg-white">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="input-product-search"
              placeholder={t("adminProducts.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm w-full"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ver todas las familias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[170px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ver todos los estados</SelectItem>
              <SelectItem value="active">{t("adminProducts.status.active")}</SelectItem>
              <SelectItem value="inactive">{t("adminProducts.status.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table Content ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden min-h-[400px]">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[40%]">Product</TableHead>
                <TableHead className="w-[10%]">{t("adminProducts.columns.price")}</TableHead>
                <TableHead className="w-[10%]">{t("adminProducts.columns.unit")}</TableHead>
                <TableHead className="w-[20%]">{t("adminProducts.columns.category")}</TableHead>
                <TableHead className="w-[10%]">{t("adminProducts.columns.status")}</TableHead>
                <TableHead className="w-[10%] text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">{t("common.loading")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {t("adminProducts.noProducts")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50 transition-colors group">
                    {/* Product (Image + Code) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md overflow-hidden bg-white border border-border/50 flex-shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.code}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PackageSearch className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {product.code}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {product.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-mono text-xs tabular-nums text-foreground/80">
                      {formatPrice(product.price)}
                    </TableCell>

                    {/* Unit */}
                    <TableCell className="text-xs text-muted-foreground">
                      {product.unit}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-medium px-2 h-5">
                        {categoryLabel(product.categoryId)}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {product.isActive ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[10px] h-5 px-1.5 font-normal shadow-none whitespace-nowrap">
                          {t("adminProducts.status.active")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 opacity-60 font-normal shadow-none whitespace-nowrap">
                          {t("adminProducts.status.inactive")}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/products/${product.code}/edit`)}
                            className="gap-2"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => confirmDelete(product)}
                            className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Global Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adminProducts.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete && t("adminProducts.deleteDialog.description", { code: productToDelete.code })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingId !== null}>
              {t("adminProducts.deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingId === productToDelete?.id
                ? t("adminProducts.deleteDialog.deleting")
                : t("adminProducts.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
