import { AppLayout } from "@/components/layout/AppLayout";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  Edit2,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { DataCard } from "@/components/ui/data-card";
import { AlertTriangle, Trash2, Warehouse } from "lucide-react";

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

interface StockEntry {
  id: string;
  name: string;
  category: string;
  quantity: number;
  stock_reservado: number;
  unit: string;
  minStock: number;
  location: string;
  lastReceived: string;
}

// ──────────────────────────────────────────────────────────────────
// Mock Data — all state-local, no Supabase calls
// ──────────────────────────────────────────────────────────────────

const initialStock: StockEntry[] = [
  {
    id: "ENT-CU-15",
    name: "Tubo Cobre 15mm - Rollo 50m",
    category: "Rollos",
    quantity: 1250,
    stock_reservado: 200,
    unit: "rollos",
    minStock: 200,
    location: "Almacén A",
    lastReceived: "10/01/2024",
  },
  {
    id: "ENT-CU-18",
    name: "Tubo Cobre 18mm - Rollo 50m",
    category: "Rollos",
    quantity: 890,
    stock_reservado: 150,
    unit: "rollos",
    minStock: 150,
    location: "Almacén A",
    lastReceived: "12/01/2024",
  },
  {
    id: "ENT-CU-22",
    name: "Tubo Cobre 22mm - Rollo 25m",
    category: "Rollos",
    quantity: 420,
    stock_reservado: 80,
    unit: "rollos",
    minStock: 100,
    location: "Almacén A",
    lastReceived: "08/01/2024",
  },
  {
    id: "ENT-CU-28",
    name: "Tubo Cobre 28mm - Barra 5m",
    category: "Barras",
    quantity: 85,
    stock_reservado: 30,
    unit: "barras",
    minStock: 100,
    location: "Almacén B",
    lastReceived: "05/01/2024",
  },
  {
    id: "ENT-CU-35",
    name: "Tubo Cobre 35mm - Barra 5m",
    category: "Barras",
    quantity: 18,
    stock_reservado: 5,
    unit: "barras",
    minStock: 50,
    location: "Almacén B",
    lastReceived: "02/01/2024",
  },
  {
    id: "ENT-CU-42",
    name: "Tubo Cobre 42mm - Barra 5m",
    category: "Barras",
    quantity: 0,
    stock_reservado: 0,
    unit: "barras",
    minStock: 30,
    location: "Almacén B",
    lastReceived: "28/12/2023",
  },
];

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

type StockStatus = "available" | "low" | "out";

const getStockStatus = (disponible: number): StockStatus => {
  if (disponible <= 0) return "out";
  if (disponible <= 20) return "low";
  return "available";
};

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; badgeClass: string; rowClass: string }
> = {
  available: {
    label: "Disponible",
    badgeClass:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    rowClass: "hover:bg-muted/30",
  },
  low: {
    label: "Stock bajo",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    rowClass:
      "bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20",
  },
  out: {
    label: "Sin stock",
    badgeClass:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    rowClass:
      "bg-red-50/60 dark:bg-red-900/10 hover:bg-red-100/60 dark:hover:bg-red-900/20",
  },
};

// ──────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────

export default function AdminStock() {
  const { t } = useTranslation();
  const { products, isLoading, updateStock, deleteProduct } = useProducts();
  const [stock, setStock] = useState<StockEntry[]>(initialStock);
  const [searchQuery, setSearchQuery] = useState("");

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Añadir stock modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addProductId, setAddProductId] = useState<string>("");
  const [addAmount, setAddAmount] = useState<string>("");
  const [addReason, setAddReason] = useState<string>("");

  // Delete dialog
  const [deletingProduct, setDeletingProduct] = useState<StockEntry | null>(
    null,
  );

  // New state for add/delete modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<StockEntry | null>(
    null,
  );

  // ── Computed ──────────────────────────────────────────────────
  const filteredStock = stock.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const alertCount = stock.filter((e) => {
    const disp = e.quantity - e.stock_reservado;
    return getStockStatus(disp) !== "available";
  }).length;

  const totalDisponible = stock.reduce(
    (sum, e) => sum + Math.max(0, e.quantity - e.stock_reservado),
    0,
  );

  const stockAlertCount = products.filter(
    (p) => (p.available_stock || 0) < 50,
  ).length;

  // ── Inline edit handlers ──────────────────────────────────────
  const startEdit = (entry: StockEntry) => {
    setEditingId(entry.id);
    setEditQuantity(entry.quantity);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    setStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantity: editQuantity } : s)),
    );
    setEditingId(null);
    toast.success("Stock actualizado");
  };

  // ── Add stock modal handlers ──────────────────────────────────
  const openAddModal = (productId?: string) => {
    setAddProductId(productId ?? "");
    setAddAmount("");
    setAddReason("");
    setAddModalOpen(true);
  };

  const confirmAdd = () => {
    const delta = parseInt(addAmount, 10);
    if (!addProductId || isNaN(delta) || delta <= 0) {
      toast.error("Selecciona un producto y una cantidad válida");
      return;
    }
    setStock((prev) =>
      prev.map((s) =>
        s.id === addProductId ? { ...s, quantity: s.quantity + delta } : s,
      ),
    );
    const product = stock.find((s) => s.id === addProductId);
    toast.success("Stock añadido", {
      description: `+${delta} ${product?.unit ?? "uds."} a ${product?.name}`,
    });
    setAddModalOpen(false);
  };

  const handleAddStock = async () => {
    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) {
      toast.error(t("adminStock.toasts.invalidInput"));
      return;
    }
    try {
      const qty = parseInt(quantity);
      await updateStock(selectedProductId, qty);
      toast.success(t("adminStock.toasts.stockAdded"), {
        description: `+${qty} uds`,
      });
      setIsModalOpen(false);
      setSelectedProductId("");
      setQuantity("");
      setReason("");
    } catch {
      toast.error(t("adminStock.toasts.stockUpdated"));
    }
  };

  // ── Delete handler ────────────────────────────────────────────
  const confirmDelete = () => {
    if (deletingProduct) {
      setStock((prev) => prev.filter((s) => s.id !== deletingProduct.id));
      setDeletingProduct(null);
      toast.success("Producto eliminado del inventario");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteProduct(productId);
      toast.success(t("adminStock.toasts.productDeleted"));
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground/90 uppercase flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-primary" />
            {t("adminStock.title")}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
              <Upload className="h-3.5 w-3.5" />
              {t("adminStock.import")}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("adminStock.bulkAdjust")}
            </Button>
            <Button
              size="sm"
              className="gap-2 h-8 text-xs"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("adminStock.addStock")}
            </Button>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* KPI Cards */}
          <div className="flex-none grid grid-cols-3 gap-3">
            <DataCard
              title={t("adminStock.kpis.totalProducts")}
              className="shadow-sm border-border/60"
            >
              <p className="text-3xl font-mono font-bold">{products.length}</p>
            </DataCard>
            <DataCard
              title={t("adminStock.kpis.stockAlerts")}
              className="shadow-sm border-border/60"
            >
              <p className="text-3xl font-mono font-bold text-amber-500">
                {products.filter((p) => (p.available_stock || 0) < 50).length}
              </p>
            </DataCard>
            <DataCard
              title={t("adminStock.kpis.totalAvailable")}
              className="shadow-sm border-border/60"
            >
              <p className="text-3xl font-mono font-bold">
                {products
                  .reduce((acc, p) => acc + (p.available_stock || 0), 0)
                  .toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  uds
                </span>
              </p>
            </DataCard>
          </div>

          {/* Toolbar */}
          <div className="flex-none flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t("adminStock.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs bg-background w-full"
              />
            </div>
            {stockAlertCount > 0 && (
              <Badge
                variant="outline"
                className="gap-1.5 text-amber-600 border-amber-200 bg-amber-50 text-xs whitespace-nowrap"
              >
                <AlertTriangle className="h-3 w-3" />
                {t("adminStock.alertsBadge", { count: stockAlertCount })}
              </Badge>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 bg-card border border-border/60 rounded-sm flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0 z-10">
                  <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-medium">
                      {t("adminStock.columns.product")}
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      {t("adminStock.columns.category")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      {t("adminStock.columns.currentStock")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      {t("adminStock.columns.reserved")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      {t("adminStock.columns.available")}
                    </th>
                    <th className="text-center px-4 py-3 font-medium">
                      {t("adminStock.columns.status")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      {t("adminStock.columns.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((entry) => {
                    const disponible = entry.quantity - entry.stock_reservado;
                    const status = getStockStatus(disponible);
                    const cfg = STATUS_CONFIG[status];

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          "border-b border-border/40 last:border-0 transition-colors group",
                          cfg.rowClass,
                        )}
                      >
                        {/* Producto */}
                        <td className="px-3 py-1.5 align-middle">
                          <div className="font-medium text-foreground/90 line-clamp-1">
                            {entry.name}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            {entry.id}
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className="px-2 py-1.5 align-middle">
                          <Badge
                            variant="secondary"
                            className="h-5 text-[10px] px-1.5 font-normal bg-muted text-muted-foreground border-border/50"
                          >
                            {entry.category}
                          </Badge>
                        </td>

                        {/* Stock actual */}
                        <td className="px-2 py-1.5 align-middle text-right">
                          {editingId === entry.id ? (
                            <Input
                              type="number"
                              value={editQuantity}
                              onChange={(e) =>
                                setEditQuantity(parseInt(e.target.value) || 0)
                              }
                              className="w-20 font-mono text-right h-6 text-xs ml-auto"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={cn(
                                "font-mono font-bold",
                                status === "out"
                                  ? "text-red-600"
                                  : status === "low"
                                    ? "text-amber-700"
                                    : "text-foreground/80",
                              )}
                            >
                              {entry.quantity.toLocaleString("es-ES")}
                              <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                                {" "}
                                {entry.unit}
                              </span>
                            </span>
                          )}
                        </td>

                        {/* Stock reservado */}
                        <td className="px-2 py-1.5 align-middle text-right font-mono text-muted-foreground">
                          {entry.stock_reservado.toLocaleString("es-ES")}
                          <span className="text-[9px] ml-0.5 font-normal">
                            {" "}
                            {entry.unit}
                          </span>
                        </td>

                        {/* Disponible */}
                        <td className="px-2 py-1.5 align-middle text-right">
                          <span
                            className={cn(
                              "font-mono font-semibold",
                              status === "out"
                                ? "text-red-600"
                                : status === "low"
                                  ? "text-amber-700"
                                  : "text-green-700 dark:text-green-400",
                            )}
                          >
                            {Math.max(0, disponible).toLocaleString("es-ES")}
                            <span className="text-[9px] font-normal text-muted-foreground ml-0.5">
                              {" "}
                              {entry.unit}
                            </span>
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-2 py-1.5 align-middle text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-4 px-2 text-[9px] rounded-sm uppercase tracking-wider justify-center min-w-[72px]",
                              cfg.badgeClass,
                            )}
                          >
                            {cfg.label}
                          </Badge>
                        </td>

                        {/* Acciones */}
                        <td className="px-2 py-1.5 align-middle text-right">
                          {editingId === entry.id ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => saveEdit(entry.id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={cancelEdit}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                title="Editar stock"
                                onClick={() => startEdit(entry)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <div className="w-px h-3 bg-border/50 my-auto" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-green-600"
                                title="Añadir stock"
                                onClick={() => openAddModal(entry.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Stock Modal ────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{t("adminStock.modal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("adminStock.modal.product")}
              </Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("adminStock.modal.productPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("adminStock.modal.quantity")}
              </Label>
              <Input
                type="number"
                min="1"
                placeholder={t("adminStock.modal.quantityPlaceholder")}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("adminStock.modal.reason")} <span className="text-muted-foreground/60">{t("adminStock.modal.reasonOptional")}</span>
              </Label>
              <Input
                placeholder={t("adminStock.modal.reasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("adminStock.modal.cancelButton")}
            </Button>
            <Button onClick={handleAddStock}>
              {t("adminStock.modal.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────── */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adminStock.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("adminStock.deleteDialog.description")}{" "}
              <span className="font-semibold text-foreground">
                {deletingProduct?.name}
              </span>{" "}
              {t("adminStock.deleteDialog.fromInventory")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("adminStock.deleteDialog.cancelButton")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("adminStock.deleteDialog.deleteButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
