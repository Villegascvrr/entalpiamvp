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
  AlertCircle
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
  { id: "CU-T-15", name: "Copper Tube 15mm", category: "Copper Tubing", basePrice: 10.20, marketIndex: 1.15, margin: 1.08, finalPrice: 12.45, lastUpdated: "08:30", change: 2.3 },
  { id: "CU-T-22", name: "Copper Tube 22mm", category: "Copper Tubing", basePrice: 15.50, marketIndex: 1.15, margin: 1.06, finalPrice: 18.90, lastUpdated: "08:30", change: 1.8 },
  { id: "CU-T-28", name: "Copper Tube 28mm", category: "Copper Tubing", basePrice: 20.00, marketIndex: 1.15, margin: 1.06, finalPrice: 24.30, lastUpdated: "08:30", change: 2.1 },
  { id: "CU-S-1.5", name: "Copper Sheet 1.5mm", category: "Copper Sheets", basePrice: 38.00, marketIndex: 1.08, margin: 1.04, finalPrice: 42.80, lastUpdated: "08:30", change: -0.5 },
  { id: "CU-S-2.0", name: "Copper Sheet 2.0mm", category: "Copper Sheets", basePrice: 50.00, marketIndex: 1.08, margin: 1.04, finalPrice: 56.20, lastUpdated: "08:30", change: 0.0 },
  { id: "AL-T-20", name: "Aluminum Tube 20mm", category: "Aluminum Tubing", basePrice: 8.00, marketIndex: 1.02, margin: 1.07, finalPrice: 8.75, lastUpdated: "08:30", change: -1.2 },
];

export default function AdminPricing() {
  const [prices, setPrices] = useState<PriceEntry[]>(initialPrices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ margin: number } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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

  const applyMarketIndex = (index: number) => {
    setPrices(prices.map(p => {
      if (p.category.includes("Copper")) {
        const newFinalPrice = p.basePrice * index * p.margin;
        return { ...p, marketIndex: index, finalPrice: newFinalPrice };
      }
      return p;
    }));
    setHasChanges(true);
  };

  return (
    <AppLayout userRole="admin" userName="Sarah Admin" companyName="Industrial Corp">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Management</h1>
            <p className="text-muted-foreground">Configure daily prices and margins</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Market Data
            </Button>
            <Button className="gap-2" disabled={!hasChanges}>
              <Save className="h-4 w-4" />
              Publish Prices
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-status-low/10 text-status-low border border-status-low/30">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">You have unpublished price changes. Click "Publish Prices" to make them visible to customers.</span>
          </div>
        )}

        {/* Market Index Controls */}
        <DataCard title="Market Index" subtitle="Apply global market adjustments">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">LME Copper Index</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  defaultValue="1.15"
                  className="w-24 font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyMarketIndex(1.15)}
                >
                  Apply to Copper
                </Button>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">LME Aluminum Index</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  defaultValue="1.02"
                  className="w-24 font-mono"
                />
                <Button variant="outline" size="sm">
                  Apply to Aluminum
                </Button>
              </div>
            </div>
          </div>
        </DataCard>

        {/* Pricing Table */}
        <DataCard title="Product Prices" subtitle="Edit margins and view calculated prices" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Product</th>
                  <th>Category</th>
                  <th className="text-right">Base Price</th>
                  <th className="text-right">Market Index</th>
                  <th className="text-right">Margin</th>
                  <th className="text-right">Final Price</th>
                  <th className="text-right">Change</th>
                  <th className="text-center">Last Updated</th>
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
