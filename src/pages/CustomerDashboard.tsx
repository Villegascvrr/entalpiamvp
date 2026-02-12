import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Package,
  ArrowRight,
  Clock,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  RotateCcw,
  Headset,
  Plus
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-2">

        {/* HERO SECTION - Acción Principal Destacada */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-4 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Buenos días, Distribuidor Demo
              </h1>
              <p className="text-muted-foreground mt-1">
                Precios actualizados hoy a las {lmeData.updated}
              </p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-2 py-1 bg-background/80 rounded border">
                  <div className="h-5 w-5 rounded bg-amber-500/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-amber-600">Cu</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LME Cobre</p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold">${lmeData.price.toLocaleString()}</span>
                      <span className={cn(
                        "text-xs font-mono flex items-center",
                        lmeData.change > 0 ? "text-green-600" : "text-red-500"
                      )}>
                        {lmeData.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {lmeData.change > 0 ? "+" : ""}{lmeData.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Principal - ÚNICO PUNTO DE ENTRADA DESTACADO */}
            <div className="flex items-center justify-end w-full md:w-auto">
              <Link to="/order/new" className="w-full md:w-auto">
                <Button size="lg" className="h-12 px-8 text-base gap-3 shadow-lg hover:shadow-xl transition-all duration-200 w-full md:w-auto bg-primary text-primary-foreground group">
                  <Package className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Crear Nuevo Pedido
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA - Precios Rápidos */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <DataCard
              title="Precios del Día"
              subtitle="5 productos más solicitados"
              action={
                <span className="text-[10px] text-muted-foreground italic">Precios sujetos a variación LME</span>
              }
            >
              <div className="space-y-1">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20 hidden md:block" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-5 w-16 ml-auto" />
                        <Skeleton className="h-3 w-10 ml-auto" />
                      </div>
                    </div>
                  ))
                ) : (
                  quickProducts.map(product => (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center justify-between py-3 px-3 md:px-4 rounded-lg hover:bg-muted/50 transition-colors animate-in fade-in duration-300",
                        product.stock === "bajo" && "bg-amber-500/5"
                      )}
                    >
                      <div className="flex items-center gap-2 md:gap-4">
                        <span className="hidden md:inline-block font-mono text-sm text-muted-foreground w-24">{product.id}</span>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                          <span className="font-medium text-sm md:text-base">{product.name}</span>
                          {product.stock === "bajo" && (
                            <Badge variant="outline" className="w-fit text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1 py-0 h-5">
                              Stock Bajo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-base md:text-lg font-semibold">€{product.price.toFixed(2)}</span>
                        <div className={cn(
                          "font-mono text-[10px] md:text-sm",
                          product.change > 0 ? "text-green-600" : product.change < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {product.change > 0 ? "↑" : product.change < 0 ? "↓" : ""}{Math.abs(product.change)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DataCard>

            {/* Ayuda y Guía */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/50 border text-sm">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">¿Cómo empezar?</strong> Haz clic en <span className="text-primary font-semibold">"Crear Nuevo Pedido"</span> en el panel superior para acceder al catálogo técnico completo.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - Estado y Accesos */}
          <div className="space-y-6">
            <DataCard
              title="Mis Pedidos"
              action={
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver Todos
                  </Button>
                </Link>
              }
            >
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="text-right space-y-1.5">
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-5 w-24 ml-auto rounded-full" />
                      </div>
                    </div>
                  ))
                ) : recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border/50 rounded-lg bg-muted/20">
                    <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center mb-3 shadow-sm">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Aún no tienes pedidos</p>
                    <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                      Comienza a añadir productos para realizar tu primera solicitud.
                    </p>
                    <Link to="/order/new">
                      <Button size="sm" variant="outline" className="gap-2 h-8 text-xs border-primary/20 text-primary hover:text-primary hover:bg-primary/5">
                        <Plus className="h-3.5 w-3.5" />
                        Crear Pedido
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {recentOrders.map(order => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0 animate-in fade-in duration-300"
                      >
                        <div>
                          <p className="font-mono text-sm font-medium">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold">€{order.total.toFixed(2)}</p>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] capitalize", statusStyles[order.status as keyof typeof statusStyles])}
                          >
                            {order.status === "pending_validation" && <Clock className="h-2.5 w-2.5 mr-1" />}
                            {order.status === "confirmed" && <CheckCircle className="h-2.5 w-2.5 mr-1" />}
                            {order.status === "preparing" && <Package className="h-2.5 w-2.5 mr-1" />}
                            {order.status === "shipped" && <Truck className="h-2.5 w-2.5 mr-1" />}

                            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground text-center pt-1 font-mono">
                      Mostrando {recentOrders.length} de {recentOrders.length} pedidos recientes
                    </p>
                  </>
                )}
              </div>
            </DataCard>

            <DataCard title="Acciones Rápidas">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => {
                    toast.success("Consultando último pedido...", {
                      description: "Los artículos del pedido PED-2024-0142 se han añadido a tu sesión.",
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Repetir Último Pedido
                </Button>
                <Link to="/orders" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <ClipboardList className="h-4 w-4" />
                    Ver Historial de Pedidos
                  </Button>
                </Link>

                <div className="pt-2">
                  <AssistedContactDialog>
                    <Button variant="secondary" className="w-full justify-start gap-2 h-10 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 hover:border-primary/30">
                      <Headset className="h-4 w-4" />
                      Atención Personalizada
                    </Button>
                  </AssistedContactDialog>
                </div>
              </div>
            </DataCard>

            <DataCard
              title="Próxima Entrega"
              className="bg-primary/5 border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">PED-2024-0138</p>
                  <p className="text-sm text-muted-foreground">Llegada estimada: Mañana</p>
                </div>
              </div>
            </DataCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
