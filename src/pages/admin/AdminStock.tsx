import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/ui/stock-indicator";
import { 
  Upload, 
  Save, 
  Edit2,
  Check,
  X,
  Search,
  AlertCircle,
  Plus,
  Minus,
  Truck
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Stock</h1>
            <p className="text-muted-foreground">Monitoriza y actualiza niveles de inventario</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar Stock
            </Button>
            <Button className="gap-2" disabled={!hasChanges}>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-status-low/10 text-status-low border border-status-low/30">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{lowStockCount} producto(s) tienen stock bajo o agotado. Considera realizar un pedido de reposición.</span>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stock Table */}
        <DataCard title="Niveles de Inventario" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Stock Mín.</th>
                  <th>Estado</th>
                  <th>En Tránsito</th>
                  <th>Ubicación</th>
                  <th>Última Recepción</th>
                  <th>Ajuste Rápido</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map(entry => {
                  const status = getStockStatus(entry);
                  
                  return (
                    <tr key={entry.id} className={status === "out" ? "bg-destructive/5" : status === "low" ? "bg-status-low/5" : ""}>
                      <td>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{entry.id}</p>
                        </div>
                      </td>
                      <td>
                        <Badge variant="secondary">{entry.category}</Badge>
                      </td>
                      <td className="text-right">
                        {editingId === entry.id ? (
                          <Input
                            type="number"
                            value={editValues?.quantity || entry.quantity}
                            onChange={(e) => setEditValues({ quantity: parseInt(e.target.value) || 0 })}
                            className="w-24 font-mono text-right h-8"
                            autoFocus
                          />
                        ) : (
                          <span className={cn(
                            "font-mono font-semibold",
                            status === "out" && "text-destructive",
                            status === "low" && "text-status-low"
                          )}>
                            {entry.quantity.toLocaleString("es-ES")} {entry.unit}
                          </span>
                        )}
                      </td>
                      <td className="text-right font-mono text-muted-foreground">
                        {entry.minStock.toLocaleString("es-ES")} {entry.unit}
                      </td>
                      <td>
                        <StockBadge status={status} />
                      </td>
                      <td>
                        {entry.inTransit ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4 text-primary" />
                            <div>
                              <span className="font-mono">{entry.inTransit}</span>
                              <span className="text-xs text-muted-foreground ml-1">({entry.transitArrival})</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="text-muted-foreground">{entry.location}</td>
                      <td className="text-muted-foreground">{entry.lastReceived}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => adjustStock(entry.id, -10)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => adjustStock(entry.id, 10)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td>
                        {editingId === entry.id ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-status-available"
                              onClick={() => saveEdit(entry.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(entry)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataCard>
      </div>
    </AppLayout>
  );
}
