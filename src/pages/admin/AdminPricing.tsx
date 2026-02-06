import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Save, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Edit2,
  Check,
  X,
  AlertCircle,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceEntry {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  marketIndex: number;
  margin: number;
  finalPrice: number;
  lastUpdated: string;
  change: number;
}

const initialPrices: PriceEntry[] = [
  { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", category: "Rollos", basePrice: 198.50, marketIndex: 1.15, margin: 1.08, finalPrice: 245.80, lastUpdated: "08:30", change: 2.3 },
  { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", category: "Rollos", basePrice: 252.40, marketIndex: 1.15, margin: 1.08, finalPrice: 312.50, lastUpdated: "08:30", change: 1.8 },
  { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", category: "Rollos", basePrice: 160.60, marketIndex: 1.15, margin: 1.08, finalPrice: 198.90, lastUpdated: "08:30", change: 2.1 },
  { id: "ENT-CU-28", name: "Tubo Cobre 28mm - Barra 5m", category: "Barras", basePrice: 72.20, marketIndex: 1.15, margin: 1.08, finalPrice: 89.40, lastUpdated: "08:30", change: 1.5 },
  { id: "ENT-CU-35", name: "Tubo Cobre 35mm - Barra 5m", category: "Barras", basePrice: 115.20, marketIndex: 1.15, margin: 1.08, finalPrice: 142.60, lastUpdated: "08:30", change: -0.5 },
  { id: "ENT-CU-42", name: "Tubo Cobre 42mm - Barra 5m", category: "Barras", basePrice: 144.00, marketIndex: 1.15, margin: 1.08, finalPrice: 178.30, lastUpdated: "08:30", change: 0.0 },
];

export default function AdminPricing() {
  const [prices, setPrices] = useState<PriceEntry[]>(initialPrices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ margin: number } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lmeIndex, setLmeIndex] = useState("1.15");

  const startEdit = (entry: PriceEntry) => {
    setEditingId(entry.id);
    setEditValues({ margin: entry.margin });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const saveEdit = (id: string) => {
    if (!editValues) return;
    
    setPrices(prices.map(p => {
      if (p.id === id) {
        const newFinalPrice = p.basePrice * p.marketIndex * editValues.margin;
        return { ...p, margin: editValues.margin, finalPrice: newFinalPrice };
      }
      return p;
    }));
    
    setEditingId(null);
    setEditValues(null);
    setHasChanges(true);
  };

  const applyMarketIndex = () => {
    const index = parseFloat(lmeIndex) || 1.15;
    setPrices(prices.map(p => {
      const newFinalPrice = p.basePrice * index * p.margin;
      return { ...p, marketIndex: index, finalPrice: newFinalPrice };
    }));
    setHasChanges(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Precios</h1>
            <p className="text-muted-foreground">Configura los precios diarios y márgenes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sincronizar LME
            </Button>
            <Button className="gap-2" disabled={!hasChanges}>
              <Save className="h-4 w-4" />
              Publicar Precios
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-status-low/10 text-status-low border border-status-low/30">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Tienes cambios de precios sin publicar. Haz clic en "Publicar Precios" para hacerlos visibles a los clientes.</span>
          </div>
        )}

        {/* Market Index Controls */}
        <DataCard title="Índice de Mercado LME" subtitle="Aplicar ajuste global de mercado">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cotización LME Cobre</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-lg">$8,432.50 USD/t</span>
                <Badge variant="outline" className="text-market-up bg-market-up/10 border-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.3%
                </Badge>
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Factor de Índice</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={lmeIndex}
                  onChange={(e) => setLmeIndex(e.target.value)}
                  className="w-24 font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={applyMarketIndex}
                  className="gap-1"
                >
                  <Calculator className="h-4 w-4" />
                  Aplicar a Todos
                </Button>
              </div>
            </div>
          </div>
        </DataCard>

        {/* Pricing Table */}
        <DataCard title="Tabla de Precios" subtitle="Edita márgenes y visualiza precios calculados" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th className="text-right">Precio Base</th>
                  <th className="text-right">Índice LME</th>
                  <th className="text-right">Margen</th>
                  <th className="text-right">Precio Final</th>
                  <th className="text-right">Variación</th>
                  <th className="text-center">Actualizado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prices.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <div>
                        <p className="font-medium">{entry.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{entry.id}</p>
                      </div>
                    </td>
                    <td>
                      <Badge variant="secondary">{entry.category}</Badge>
                    </td>
                    <td className="text-right font-mono">€{entry.basePrice.toFixed(2)}</td>
                    <td className="text-right font-mono">{entry.marketIndex.toFixed(2)}x</td>
                    <td className="text-right">
                      {editingId === entry.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues?.margin || entry.margin}
                          onChange={(e) => setEditValues({ margin: parseFloat(e.target.value) || 1 })}
                          className="w-20 font-mono text-right h-8"
                          autoFocus
                        />
                      ) : (
                        <span className="font-mono">{entry.margin.toFixed(2)}x</span>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="font-mono font-semibold">€{entry.finalPrice.toFixed(2)}</span>
                    </td>
                    <td className="text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-mono text-sm",
                        entry.change > 0 && "text-market-up",
                        entry.change < 0 && "text-market-down",
                        entry.change === 0 && "text-muted-foreground"
                      )}>
                        {entry.change > 0 && <TrendingUp className="h-3 w-3" />}
                        {entry.change < 0 && <TrendingDown className="h-3 w-3" />}
                        {entry.change >= 0 ? "+" : ""}{entry.change.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center text-muted-foreground text-sm">
                      {entry.lastUpdated}
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
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>
      </div>
    </AppLayout>
  );
}
