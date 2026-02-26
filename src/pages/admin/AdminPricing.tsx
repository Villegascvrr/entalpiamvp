import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@/contexts/ActorContext";
import { fxRateRepository, lmeRepository } from "@/data/repositories";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Calculator,
  Check,
  Edit2,
  RefreshCw,
  Save,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PriceEntry {
  id: string;
  name: string;
  category: string;
  basePrice: number; // Now in USD
  marketIndex: number;
  margin: number;
  finalPrice: number; // In EUR
  lastUpdated: string;
  change: number;
}

// Adjusted Base Prices (USD) to keep Final Price (EUR) similar with ~0.92 FX Rate
// Old Base (EUR) -> New Base (USD) ~= Old Base / 0.92
const initialPrices: PriceEntry[] = [
  {
    id: "ENT-CU-15",
    name: "Tubo Cobre 15mm - Rollo 50m",
    category: "Rollos",
    basePrice: 215.76,
    marketIndex: 1.15,
    margin: 1.08,
    finalPrice: 245.8,
    lastUpdated: "08:30",
    change: 2.3,
  },
  {
    id: "ENT-CU-18",
    name: "Tubo Cobre 18mm - Rollo 50m",
    category: "Rollos",
    basePrice: 274.35,
    marketIndex: 1.15,
    margin: 1.08,
    finalPrice: 312.5,
    lastUpdated: "08:30",
    change: 1.8,
  },
  {
    id: "ENT-CU-22",
    name: "Tubo Cobre 22mm - Rollo 25m",
    category: "Rollos",
    basePrice: 174.56,
    marketIndex: 1.15,
    margin: 1.08,
    finalPrice: 198.9,
    lastUpdated: "08:30",
    change: 2.1,
  },
  {
    id: "ENT-CU-28",
    name: "Tubo Cobre 28mm - Barra 5m",
    category: "Barras",
    basePrice: 78.48,
    marketIndex: 1.15,
    margin: 1.08,
    finalPrice: 89.4,
    lastUpdated: "08:30",
    change: 1.5,
  },
  {
    id: "ENT-CU-35",
    name: "Tubo Cobre 35mm - Barra 5m",
    category: "Barras",
    basePrice: 125.21,
    marketIndex: 1.15,
    margin: 1.08,
    finalPrice: 142.6,
    lastUpdated: "08:30",
    change: -0.5,
  },
  {
    id: "ENT-CU-42",
    name: "Tubo Cobre 42mm - Barra 5m",
    category: "Barras",
    basePrice: 156.52,
    marketIndex: 1.15,
    margin: 1.08,
    finalPrice: 178.3,
    lastUpdated: "08:30",
    change: 0.0,
  },
];

export default function AdminPricing() {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<PriceEntry[]>(initialPrices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ margin: number } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Market Data State
  const [lmePrice, setLmePrice] = useState<number | null>(null);
  const [lmeInputValue, setLmeInputValue] = useState("");
  const [lmeHistory, setLmeHistory] = useState<any[]>([]);

  // FX Rate State
  const [fxRate, setFxRate] = useState(0.92);
  const [fxRateInputValue, setFxRateInputValue] = useState("0.92");

  const { session } = useActor();
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Recalculate logic: Base(USD) * FX * MarketIndex * Margin = Final(EUR)
  const recalculatePrices = (
    currentPrices: PriceEntry[],
    rate: number,
  ) => {
    return currentPrices.map((p) => {
      const newFinalPrice = p.basePrice * rate * p.marketIndex * p.margin;
      return {
        ...p,
        finalPrice: newFinalPrice,
      };
    });
  };

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

    setPrices((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // Base(USD) * FX * MarketIndex * NewMargin
          const newFinalPrice =
            p.basePrice * fxRate * p.marketIndex * editValues.margin;
          return { ...p, margin: editValues.margin, finalPrice: newFinalPrice };
        }
        return p;
      }),
    );

    setEditingId(null);
    setEditValues(null);
    setHasChanges(true);
  };

  const handleUpdatePrices = async () => {
    if (!session) return;
    setIsSyncing(true);

    const newFxRate = parseFloat(fxRateInputValue);
    const newLme = parseFloat(lmeInputValue);

    if (isNaN(newFxRate) || newFxRate <= 0 || isNaN(newLme) || newLme <= 0) {
      toast.error(t("adminPricing.invalidValues"), { description: t("adminPricing.invalidValuesDesc") });
      setIsSyncing(false);
      return;
    }

    try {
      // Save LME
      await lmeRepository.setManualPrice(session, newLme);

      // Save FX Rate
      await fxRateRepository.updateRate(session, newFxRate);
      setFxRate(newFxRate);

      // Update Prices
      const newPrices = recalculatePrices(prices, newFxRate);
      setPrices(newPrices);
      setHasChanges(true);

      await loadData(); // Reload history

      toast.success(t("adminPricing.toasts.pricesUpdated"), {
        description: t("adminPricing.toasts.pricesUpdatedDesc"),
      });
    } catch (error) {
      console.error("Error updating prices", error);
      toast.error(t("adminPricing.toasts.updateError"));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportCSV = () => {
    setIsImporting(true);
    toast.info(t("adminPricing.toasts.importStarted"), {
      description: t("adminPricing.toasts.importDesc"),
    });

    setTimeout(() => {
      setIsImporting(false);
      setPrices((prev) =>
        prev.map((p) => ({
          ...p,
          basePrice: p.basePrice * (1 + (Math.random() * 0.05 - 0.025)),
        })),
      );
      setHasChanges(true);
      toast.success(t("adminPricing.toasts.importComplete"), {
        description: t("adminPricing.toasts.importCompleteDesc"),
      });
    }, 1500);
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    if (!session) return;
    try {
      // Load LME
      const latestLme = await lmeRepository.getLatestPrice(session);
      if (latestLme) {
        setLmePrice(latestLme.price);
        setLmeInputValue(latestLme.price.toString());
      }
      const history = await lmeRepository.getHistory(session);
      setLmeHistory(history);

      // Load FX Rate
      const fxData = await fxRateRepository.getCurrentRate(session);
      if (fxData) {
        setFxRate(fxData.rate);
        setFxRateInputValue(fxData.rate.toString());
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };


  const handlePublish = () => {
    toast.success(t("adminPricing.toasts.publishSuccess"), {
      description: t("adminPricing.toasts.publishDesc"),
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
              {t("adminPricing.title")}
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
              <Upload
                className={cn("h-3.5 w-3.5", isImporting && "animate-bounce")}
              />
              {isImporting ? t("adminPricing.importing") : t("adminPricing.importCSV")}
            </Button>

            <Button
              size="sm"
              className="h-8 gap-2 text-xs"
              disabled={!hasChanges}
              onClick={handlePublish}
            >
              <Save className="h-3.5 w-3.5" />
              {t("adminPricing.publishButton")}
            </Button>
          </div>
        </div>

        {/* Sticky LME Section & Alerts */}
        <div className="flex-none flex flex-col gap-2 p-4 pb-0">
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-status-low/10 text-status-low border border-status-low/30 animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {t("adminPricing.pendingChanges")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between bg-card border border-border/60 rounded-sm p-3 shadow-sm">
            <div className="flex items-center gap-6">
              {/* LME Price Section */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">
                  {t("adminPricing.lmeCopperToday")}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-foreground font-bold">
                      $
                    </span>
                    <Input
                      value={lmeInputValue}
                      onChange={(e) => setLmeInputValue(e.target.value)}
                      className="w-24 h-8 font-mono font-bold text-lg px-2"
                      placeholder="0.00"
                    />
                  </div>

                  {lmeHistory.length > 1 && (
                    <div
                      className={cn(
                        "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-sm ml-2",
                        (lmePrice || 0) >= lmeHistory[1].price
                          ? "text-green-600 bg-green-500/10"
                          : "text-red-600 bg-red-500/10",
                      )}
                    >
                      {(lmePrice || 0) >= lmeHistory[1].price ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(
                        (((lmePrice || 0) - lmeHistory[1].price) /
                          lmeHistory[1].price) *
                        100,
                      ).toFixed(1)}
                      %
                    </div>
                  )}
                </div>
              </div>

              <div className="h-8 w-px bg-border/60" />

              {/* FX Rate Section */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">
                  {t("adminPricing.usdEur")}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={fxRateInputValue}
                    onChange={(e) => setFxRateInputValue(e.target.value)}
                    className="w-20 h-8 font-mono font-bold text-lg px-2"
                  />
                </div>
              </div>

              {/* Main Update Button */}
              <div className="flex items-end h-[50px] pb-1 ml-4">
                <Button
                  size="default"
                  className="font-bold px-6 py-2 shadow-sm gap-2"
                  onClick={handleUpdatePrices}
                  disabled={isSyncing}
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                  {t("adminPricing.updatePricesButton")}
                </Button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                {t("adminPricing.lastUpdated")}
              </p>
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
                    <th className="px-3 py-2 font-medium">{t("adminPricing.columns.product")}</th>
                    <th className="px-2 py-2 font-medium">{t("adminPricing.columns.category")}</th>
                    <th className="px-2 py-2 font-medium text-right">
                      {t("adminPricing.columns.basePrice")}
                    </th>
                    <th className="px-2 py-2 font-medium text-right">{t("adminPricing.columns.margin")}</th>
                    <th className="px-2 py-2 font-medium text-right">
                      {t("adminPricing.columns.finalPrice")}
                    </th>
                    <th className="px-2 py-2 font-medium text-right">{t("adminPricing.columns.variation")}</th>
                    <th className="px-2 py-2 font-medium text-center">
                      {t("adminPricing.columns.state")}
                    </th>
                    <th className="px-2 py-2 font-medium text-right w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((entry) => {
                    // Margin Color Logic
                    let marginClass = "text-muted-foreground";
                    if (entry.margin >= 1.1)
                      marginClass = "text-green-600 font-bold bg-green-500/10";
                    else if (entry.margin > 1.05)
                      marginClass =
                        "text-amber-600 font-medium bg-amber-500/10";
                    else marginClass = "text-red-500 font-bold bg-red-500/10";

                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-3 py-1.5 align-middle">
                          <div className="font-medium text-foreground/90 line-clamp-1">
                            {entry.name}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                            {entry.id}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 align-middle">
                          <Badge
                            variant="secondary"
                            className="h-5 text-[10px] px-1.5 font-normal bg-muted text-muted-foreground border-border/50"
                          >
                            {entry.category}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right font-mono text-muted-foreground">
                          ${entry.basePrice.toFixed(2)}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          {editingId === entry.id ? (
                            <div className="flex justify-end">
                              <Input
                                type="number"
                                step="0.01"
                                value={editValues?.margin || entry.margin}
                                onChange={(e) =>
                                  setEditValues({
                                    margin: parseFloat(e.target.value) || 1,
                                  })
                                }
                                className="w-16 font-mono text-right h-6 text-xs"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <span
                                className={cn(
                                  "font-mono px-1.5 py-0.5 rounded-sm inline-block min-w-[3.5rem] text-center",
                                  marginClass,
                                )}
                              >
                                {entry.margin.toFixed(2)}x
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          <span className="font-mono font-bold text-foreground">
                            €{entry.finalPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 align-middle text-right">
                          <span
                            className={cn(
                              "inline-flex items-center justify-end gap-1 font-mono text-xs w-full",
                              entry.change > 0 && "text-green-600",
                              entry.change < 0 && "text-red-500",
                              entry.change === 0 && "text-muted-foreground",
                            )}
                          >
                            {entry.change > 0 && (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {entry.change < 0 && (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {entry.change > 0 ? "+" : ""}
                            {entry.change.toFixed(1)}%
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
