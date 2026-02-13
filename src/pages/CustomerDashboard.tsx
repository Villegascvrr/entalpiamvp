import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Package,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  ClipboardList,
  Headset,
  Plus,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { AssistedContactDialog } from "@/components/layout/AssistedContactDialog";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { ORDER_STATUS_LABELS } from "@/data/types";
import { lmeData, quickProducts } from "@/data/mock-dashboard";
import { statusStyles } from "@/data/mock-orders";

export default function CustomerDashboard() {
  const { recentOrders, isLoading: ordersLoading } = useOrders();
  const { isLoading: productsLoading } = useProducts();
  const isLoading = ordersLoading || productsLoading;

  // Limit items for compact view
  const compactOrders = recentOrders.slice(0, 5);
  const compactProducts = quickProducts.slice(0, 5);

  return (
    <AppLayout>
      {/* 
        MAIN CONTAINER 
        h-full + overflow-hidden to prevent main scroll 
      */}
      <div className="flex flex-col h-full bg-background overflow-hidden p-4 md:p-6 gap-4">

        {/* 1. HEADER KPI STRIP (Compact) */}
        <div className="flex-none flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-muted/30 border border-border/60 rounded-lg shadow-sm">
          {/* LME Ticker */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="text-xs font-bold text-amber-700">Cu</span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold font-mono tracking-tight">${lmeData.price.toLocaleString()}</span>
                  <span className={cn(
                    "text-xs font-mono font-medium",
                    lmeData.change > 0 ? "text-green-600" : "text-red-500"
                  )}>
                    {lmeData.change > 0 ? "+" : ""}{lmeData.change}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">LME Cobre • {lmeData.updated}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border hidden md:block" />

            {/* Highlight Metric */}
            <div className="hidden md:block">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold font-mono">15 Ene</span>
                <span className="text-[10px] text-muted-foreground uppercase">Próx. Entrega</span>
              </div>
            </div>
          </div>

          {/* Primary Action */}
          <Link to="/order/new" className="w-full md:w-auto">
            <Button size="sm" className="w-full md:w-auto h-9 px-6 font-medium gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nuevo Pedido
            </Button>
          </Link>
        </div>

        {/* 2. MAIN GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">

          {/* LEFT COLUMN: PRICES (Top 4-5) */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Precios del Día</h2>
              <span className="text-[10px] text-muted-foreground italic">Base LME sujeto a variación</span>
            </div>

            <div className="flex-1 bg-card border border-border/60 rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div className="flex-none grid grid-cols-12 gap-4 px-4 py-2 bg-muted/40 border-b border-border/60 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">REF</div>
                <div className="col-span-6">Producto</div>
                <div className="col-span-4 text-right">Precio Actual</div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="grid gap-1">
                    {compactProducts.map(product => (
                      <div key={product.id} className="grid grid-cols-12 gap-4 items-center px-3 py-2.5 rounded hover:bg-muted/40 transition-colors group">
                        <div className="col-span-2">
                          <span className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                            {product.id}
                          </span>
                        </div>
                        <div className="col-span-6 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate text-foreground/90">{product.name}</span>
                            {product.stock === "bajo" && (
                              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                Stock Bajo
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-sm font-bold text-foreground">€{product.price.toFixed(2)}</span>
                            <span className={cn(
                              "text-[10px] font-mono",
                              product.change > 0 ? "text-green-600" : "text-red-500"
                            )}>
                              {product.change > 0 ? "↑" : "↓"}{Math.abs(product.change)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDERS & ACTIONS */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">

            {/* Recent Orders (Mini Cards) */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pedidos Recientes</h2>
                <Link to="/orders" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                  Ver todos <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : compactOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-xs">No hay pedidos recientes</span>
                  </div>
                ) : (
                  compactOrders.map(order => (
                    <div key={order.id} className="p-3 bg-card border border-border/60 rounded-lg hover:border-primary/30 hover:shadow-sm transition-all group relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                            {statusStyles[order.status as keyof typeof statusStyles] && (
                              <Badge variant="outline" className={cn("text-[9px] h-4 px-1", statusStyles[order.status as keyof typeof statusStyles])}>
                                {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{order.date}</span>
                        </div>
                        <span className="font-mono text-sm font-semibold">€{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions & Next Delivery */}
            <div className="flex-none grid grid-cols-2 gap-3">
              {/* Quick Actions Grid */}
              <div className="col-span-2 grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="h-14 flex flex-col gap-1 items-center justify-center border-border/60 hover:border-primary/30 hover:bg-primary/5">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-medium">Repetir</span>
                </Button>
                <Button variant="outline" size="sm" className="h-14 flex flex-col gap-1 items-center justify-center border-border/60 hover:border-primary/30 hover:bg-primary/5">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-medium">Historial</span>
                </Button>
                <AssistedContactDialog>
                  <Button variant="outline" size="sm" className="h-14 w-full flex flex-col gap-1 items-center justify-center border-border/60 hover:border-primary/30 hover:bg-primary/5">
                    <Headset className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-medium">Soporte</span>
                  </Button>
                </AssistedContactDialog>
              </div>

              {/* Next Delivery Card */}
              <div className="col-span-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-blue-100/80 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Próxima Entrega</h3>
                  <p className="text-[10px] text-muted-foreground">Est. Mañana • PED-2024-0138</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
