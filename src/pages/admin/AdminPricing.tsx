import { useState } from "react";
import { toast } from "sonner";
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
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleImportCSV = () => {
    setIsImporting(true);
    toast.info("Importando archivo...", { description: "Analizando precios_2024.csv" });

    setTimeout(() => {
      setIsImporting(false);
      setPrices(prev => prev.map(p => ({
        ...p,
        basePrice: p.basePrice * (1 + (Math.random() * 0.05 - 0.025))
      })));
      setHasChanges(true);
      toast.success("Importación completada", { description: "Se han actualizado 6 productos." });
    }, 1500);
  };

  const handleSyncLME = () => {
    setIsSyncing(true);
    toast.info("Conectando con LME...", { description: "Obteniendo últimas cotizaciones" });

    setTimeout(() => {
      setIsSyncing(false);
      const newIndex = (parseFloat(lmeIndex) + (Math.random() * 0.02 - 0.01)).toFixed(2);
      setLmeIndex(newIndex);
      applyMarketIndex(); // Re-apply with new index
      toast.success("Sincronización LME completada", {
        description: `Nuevo índice de mercado: ${newIndex}x`
      });
    }, 2000);
  };

  const handlePublish = () => {
    toast.success("Precios publicados correctamente", {
      description: "Los clientes verán las nuevas tarifas inmediatamente."
    });
    setHasChanges(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* Header - Compact */}
        <div className="flex-none flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/60">
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight text-foreground/90 uppercase flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Gestión de Precios
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleImportCSV}
              disabled={isImporting}
            >
              <Upload className={cn("h-3.5 w-3.5", isImporting && "animate-bounce")} />
              {isImporting ? "Importando..." : "Importar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleSyncLME}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
              {isSyncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
            <Button
              size="sm"
              className="h-8 gap-2 text-xs"
              disabled={!hasChanges}
              onClick={handlePublish}
            >
              <Save className="h-3.5 w-3.5" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Sticky LME Section & Alerts */}
        <div className="flex-none flex flex-col gap-2 p-4 pb-0">
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-status-low/10 text-status-low border border-status-low/30 animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Cambios pendientes de publicar</span>
            </div>
          )}

          <div className="flex items-center justify-between bg-card border border-border/60 rounded-sm p-3 shadow-sm">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">LME Cobre (Hoy)</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-foreground">$8,432.50</span>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.3%
                  </div>
                </div>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Indice Global</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={lmeIndex}
                      onChange={(e) => setLmeIndex(e.target.value)}
                      className="w-16 h-7 font-mono text-sm text-right px-2"
                    />
                    <span className="text-xs text-muted-foreground font-mono">x</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={applyMarketIndex}
                      className="h-7 text-xs px-2"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Última Act.</p>
              <p className="text-xs font-mono">08:30 AM</p>
            </div>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-card border border-border/60 rounded-sm flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0 z-10 shadow-sm">
                  <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-2 py-2 font-medium">Categoría</th>
                    <th className="px-2 py-2 font-medium text-right">Precio Base</th>
                    <th className="px-2 py-2 font-medium text-right">Index</th>
                    <th className="px-2 py-2 font-medium text-right">Margen</th>
                    <th className="px-2 py-2 font-medium text-right">P. Final</th>
                    <th className="px-2 py-2 font-medium text-right">Var.</th>
                    <th className="px-2 py-2 font-medium text-center">Estado</th>
                    <th className="px-2 py-2 font-medium text-right w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map(entry => {
                    // Margin Color Logic
                    let marginClass = "text-muted-foreground";
                    if (entry.margin >= 1.1) marginClass = "text-green-600 font-bold bg-green-500/10";
                    else if (entry.margin > 1.05) marginClass = "text-amber-600 font-medium bg-amber-500/10";
                    else marginClass = "text-red-500 font-bold bg-red-500/10";

                    return (
                      <tr key={entry.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-1.5 align-middle">
                          <div className="font-medium text-foreground/90 line-clamp-1">{entry.name}</div>
                          <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{entry.id}</div>
                        </td>
                        <td className="px-2 py-1.5 align-middle">
                          <Badge variant="secondary" className="h-5 text-[10px] px-1.5 font-normal bg-muted text-muted-foreground border-border/50">
                            {entry.category}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right font-mono text-muted-foreground">
                          €{entry.basePrice.toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right font-mono text-muted-foreground">
                          {entry.marketIndex.toFixed(2)}x
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          {editingId === entry.id ? (
                            <div className="flex justify-end">
                              <Input
                                type="number"
                                step="0.01"
                                value={editValues?.margin || entry.margin}
                                onChange={(e) => setEditValues({ margin: parseFloat(e.target.value) || 1 })}
                                className="w-16 font-mono text-right h-6 text-xs"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <span className={cn("font-mono px-1.5 py-0.5 rounded-sm inline-block min-w-[3.5rem] text-center", marginClass)}>
                                {entry.margin.toFixed(2)}x
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          <span className="font-mono font-bold text-foreground">€{entry.finalPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          <span className={cn(
                            "inline-flex items-center justify-end gap-1 font-mono text-xs w-full",
                            entry.change > 0 && "text-green-600",
                            entry.change < 0 && "text-red-500",
                            entry.change === 0 && "text-muted-foreground"
                          )}>
                            {entry.change > 0 && <TrendingUp className="h-3 w-3" />}
                            {entry.change < 0 && <TrendingDown className="h-3 w-3" />}
                            {entry.change > 0 ? "+" : ""}{entry.change.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-2 py-1.5 align-middle text-center">
                          <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {entry.lastUpdated}
                          </span>
                        </td>
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
                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                onClick={() => startEdit(entry)}
                              >
                                <Edit2 className="h-3 w-3" />
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
    </AppLayout>
  );
}
