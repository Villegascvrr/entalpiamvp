import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/ui/stock-indicator";
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
  Package,
  Upload,
  Save,
  Edit2,
  Check,
  X,
  Search,
  AlertCircle,
  Plus,
  Minus,
  Truck,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StockEntry {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  location: string;
  lastReceived: string;
  inTransit?: number;
  transitArrival?: string;
}

const initialStock: StockEntry[] = [
  { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", category: "Rollos", quantity: 1250, unit: "rollos", minStock: 200, location: "Almacén A", lastReceived: "10/01/2024" },
  { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", category: "Rollos", quantity: 890, unit: "rollos", minStock: 150, location: "Almacén A", lastReceived: "12/01/2024" },
  { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", category: "Rollos", quantity: 420, unit: "rollos", minStock: 100, location: "Almacén A", lastReceived: "08/01/2024" },
  { id: "ENT-CU-28", name: "Tubo Cobre 28mm - Barra 5m", category: "Barras", quantity: 85, unit: "barras", minStock: 100, location: "Almacén B", lastReceived: "05/01/2024" },
  { id: "ENT-CU-35", name: "Tubo Cobre 35mm - Barra 5m", category: "Barras", quantity: 12, unit: "barras", minStock: 50, location: "Almacén B", lastReceived: "02/01/2024", inTransit: 150, transitArrival: "20/01/2024" },
  { id: "ENT-CU-42", name: "Tubo Cobre 42mm - Barra 5m", category: "Barras", quantity: 0, unit: "barras", minStock: 30, location: "Almacén B", lastReceived: "28/12/2023", inTransit: 200, transitArrival: "18/01/2024" },
];

export default function AdminStock() {
  const [stock, setStock] = useState<StockEntry[]>(initialStock);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<StockEntry | null>(null);

  const getStockStatus = (entry: StockEntry): "available" | "low" | "out" => {
    if (entry.quantity <= 0) return "out";
    if (entry.quantity < entry.minStock) return "low";
    return "available";
  };

  const lowStockCount = stock.filter(s => getStockStatus(s) !== "available").length;

  const filteredStock = stock.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (entry: StockEntry) => {
    setEditingId(entry.id);
    setEditValues({ quantity: entry.quantity });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const saveEdit = (id: string) => {
    if (!editValues) return;

    setStock(stock.map(s =>
      s.id === id ? { ...s, quantity: editValues.quantity } : s
    ));

    setEditingId(null);
    setEditValues(null);
    setHasChanges(true);
  };

  const adjustStock = (id: string, delta: number) => {
    setStock(stock.map(s =>
      s.id === id ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s
    ));
    setHasChanges(true);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      setStock(stock.filter(s => s.id !== deletingProduct.id));
      setDeletingProduct(null);
      setHasChanges(true);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">

        {/* Header - Compact */}
        <div className="flex-none flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/60">
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight text-foreground/90 uppercase flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Gestión de Stock
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Upload className="h-3.5 w-3.5" />
              Importar
            </Button>
            <Button size="sm" className="h-8 gap-2 text-xs" disabled={!hasChanges}>
              <Save className="h-3.5 w-3.5" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Main Content - Flex-1 for One Page View */}
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">

          {/* Toolbar & Alerts */}
          <div className="flex-none flex items-center justify-between gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs bg-background"
              />
            </div>

            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-red-500/10 text-red-700 border border-red-500/20 animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{lowStockCount} alertas de stock</span>
              </div>
            )}
          </div>

          {/* Table Container - Scrollable */}
          <div className="flex-1 bg-card border border-border/60 rounded-sm flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0 z-10">
                  <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-2 py-2 font-medium">Categoría</th>
                    <th className="px-2 py-2 font-medium text-right">Cantidad</th>
                    <th className="px-2 py-2 font-medium text-right">Mínimo</th>
                    <th className="px-2 py-2 font-medium text-center">Estado</th>
                    <th className="px-2 py-2 font-medium">En Tránsito</th>
                    <th className="px-2 py-2 font-medium">Ubicación</th>
                    <th className="px-2 py-2 font-medium">Últ. Rec.</th>
                    <th className="px-2 py-2 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map(entry => {
                    const status = getStockStatus(entry);
                    let rowClass = "hover:bg-muted/30";
                    let badgeClass = "text-muted-foreground border-border";
                    let label = "OK";

                    if (status === "out") {
                      rowClass = "bg-red-50/60 dark:bg-red-900/10 hover:bg-red-100/60 dark:hover:bg-red-900/20";
                      badgeClass = "bg-red-100 text-red-700 border-red-200";
                      label = "Agotado";
                    } else if (status === "low") {
                      rowClass = "bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20";
                      badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                      label = "Bajo";
                    }

                    return (
                      <tr key={entry.id} className={cn("border-b border-border/40 last:border-0 transition-colors", rowClass)}>
                        <td className="px-3 py-1.5 align-middle">
                          <div className="font-medium text-foreground/90 line-clamp-1">{entry.name}</div>
                          <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{entry.id}</div>
                        </td>
                        <td className="px-2 py-1.5 align-middle">
                          <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-normal bg-muted text-muted-foreground border-border/50">
                            {entry.category}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          {editingId === entry.id ? (
                            <Input
                              type="number"
                              value={editValues?.quantity || entry.quantity}
                              onChange={(e) => setEditValues({ quantity: parseInt(e.target.value) || 0 })}
                              className="w-20 font-mono text-right h-6 text-xs"
                              autoFocus
                            />
                          ) : (
                            <span className={cn(
                              "font-mono font-bold",
                              status === "out" ? "text-red-600" : status === "low" ? "text-amber-600" : "text-foreground/80"
                            )}>
                              {entry.quantity.toLocaleString("es-ES")} <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{entry.unit}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right font-mono text-muted-foreground">
                          {entry.minStock}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-center">
                          <Badge variant="outline" className={cn("h-4 px-1 text-[9px] rounded-sm uppercase tracking-wider justify-center min-w-[60px]", badgeClass)}>
                            {label}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 align-middle">
                          {entry.inTransit ? (
                            <div className="flex items-center gap-1.5">
                              <Truck className="h-3 w-3 text-blue-500" />
                              <span className="font-mono text-blue-700">{entry.inTransit}</span>
                              <span className="text-[9px] text-muted-foreground">({entry.transitArrival})</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-muted-foreground">{entry.location}</td>
                        <td className="px-2 py-1.5 align-middle text-muted-foreground text-[10px]">{entry.lastReceived}</td>

                        {/* Actions */}
                        <td className="px-2 py-1.5 align-middle text-right">
                          {editingId === entry.id ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => saveEdit(entry.id)}>
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={cancelEdit}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => startEdit(entry)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <div className="w-px h-3 bg-border/50 my-auto" />
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => adjustStock(entry.id, 10)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => adjustStock(entry.id, -10)}>
                                <Minus className="h-3 w-3" />
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

      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente <span className="font-semibold text-foreground">{deletingProduct?.name}</span> del inventario. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
