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
  Minus
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
}

const initialStock: StockEntry[] = [
  { id: "CU-T-15", name: "Copper Tube 15mm", category: "Copper Tubing", quantity: 2450, unit: "meters", minStock: 500, location: "Warehouse A", lastReceived: "2024-01-10" },
  { id: "CU-T-22", name: "Copper Tube 22mm", category: "Copper Tubing", quantity: 1820, unit: "meters", minStock: 500, location: "Warehouse A", lastReceived: "2024-01-12" },
  { id: "CU-T-28", name: "Copper Tube 28mm", category: "Copper Tubing", quantity: 890, unit: "meters", minStock: 300, location: "Warehouse A", lastReceived: "2024-01-08" },
  { id: "CU-S-1.5", name: "Copper Sheet 1.5mm", category: "Copper Sheets", quantity: 45, unit: "sheets", minStock: 50, location: "Warehouse B", lastReceived: "2024-01-05" },
  { id: "CU-S-2.0", name: "Copper Sheet 2.0mm", category: "Copper Sheets", quantity: 8, unit: "sheets", minStock: 20, location: "Warehouse B", lastReceived: "2024-01-02" },
  { id: "AL-T-20", name: "Aluminum Tube 20mm", category: "Aluminum Tubing", quantity: 3200, unit: "meters", minStock: 1000, location: "Warehouse C", lastReceived: "2024-01-14" },
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
    <AppLayout userRole="admin" userName="Sarah Admin" companyName="Industrial Corp">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Management</h1>
            <p className="text-muted-foreground">Monitor and update inventory levels</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Stock
            </Button>
            <Button className="gap-2" disabled={!hasChanges}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-status-low/10 text-status-low border border-status-low/30">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{lowStockCount} product(s) have low or no stock. Consider reordering.</span>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stock Table */}
        <DataCard title="Inventory Levels" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Product</th>
                  <th>Category</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Min. Stock</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Last Received</th>
                  <th>Quick Adjust</th>
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
                            {entry.quantity.toLocaleString()} {entry.unit}
                          </span>
                        )}
                      </td>
                      <td className="text-right font-mono text-muted-foreground">
                        {entry.minStock.toLocaleString()} {entry.unit}
                      </td>
                      <td>
                        <StockBadge status={status} />
                      </td>
                      <td className="text-muted-foreground">{entry.location}</td>
                      <td className="text-muted-foreground">{entry.lastReceived}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => adjustStock(entry.id, -100)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => adjustStock(entry.id, 100)}
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
