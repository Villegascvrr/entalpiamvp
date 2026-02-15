import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Headset,
  ChevronRight,
  Package,
  ArrowRight
} from "lucide-react";
import { AssistedContactDialog } from "@/components/layout/AssistedContactDialog";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { ORDER_STATUS_LABELS } from "@/data/types";
import { lmeData } from "@/data/mock-dashboard";
import { statusStyles } from "@/data/mock-orders";
import { CategoryGrid } from "@/components/dashboard/CategoryGrid";

export default function CustomerDashboard() {
  const { recentOrders, isLoading: isLoadingOrders } = useOrders();
  const { categories, isLoading: isLoadingProducts } = useProducts();

  // Max 3 items for strict layout compliance
  const compactOrders = recentOrders.slice(0, 3);

  return (
    <AppLayout>
      <div className="h-full bg-background p-4 lg:p-8 overflow-hidden">

        {/* Header Section - minimal */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Catálogo de Productos</h1>
            <p className="text-muted-foreground">Seleccione una categoría para comenzar su pedido</p>
          </div>
        </div>

        {/* MAIN GRID LAYOUT: Left (Categories) | Right (Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-[calc(100%-4rem)]">

          {/* LEFT COLUMN: Categories (Main Focus) */}
          <div className="lg:col-span-8 h-full overflow-y-auto pr-2 pb-10">
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
              </div>
            ) : (
              <CategoryGrid categories={categories} />
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Tools & Status) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0 overflow-y-auto pb-10 pr-1">

            {/* 1. LME Price Card (Compact & High Visibility) */}
            <div className="flex-none bg-gradient-to-br from-muted/50 to-muted/20 border border-border/60 rounded-xl p-5 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  LME Cobre
                </p>
                <Badge variant="outline" className={cn(
                  "font-mono text-[10px] px-1.5 py-0 h-5 border-0",
                  lmeData.change > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                )}>
                  {lmeData.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(lmeData.change)}%
                </Badge>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tighter text-foreground">
                  ${lmeData.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">/ton</span>
              </div>
            </div>

            {/* 2. Primary Actions */}
            <div className="grid gap-3">
              <Link to="/order/new" className="w-full group">
                <Button className="w-full h-14 text-lg font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Pedido Rápido
                </Button>
              </Link>

              <AssistedContactDialog>
                <Button variant="outline" className="w-full h-12 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                  <Headset className="h-4 w-4 mr-2" />
                  Atención Personalizada
                </Button>
              </AssistedContactDialog>
            </div>

            {/* 3. Recent Orders (Compact List) */}
            <div className="flex-1 bg-card border border-border/40 rounded-xl flex flex-col min-h-0 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Últimos Pedidos
                </h3>
                <Link to="/orders" className="text-[10px] uppercase font-bold text-primary hover:underline">
                  Ver Todo
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoadingOrders ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : compactOrders.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Sin pedidos recientes
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {compactOrders.map(order => (
                      <div key={order.id} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium text-foreground">{order.id}</span>
                            {statusStyles[order.status as keyof typeof statusStyles] && (
                              <div className={cn("w-1.5 h-1.5 rounded-full", statusStyles[order.status as keyof typeof statusStyles].replace("bg-", "bg-").replace("text-", "").split(" ")[0].replace("/10", ""))} />
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{order.date}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium">€{order.total.toFixed(0)}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
