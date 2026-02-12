import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard, MetricCard } from "@/components/ui/data-card";
import { PriceTicker } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  Eye,
  Truck,
  ArrowRight,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Datos simulados - Resumen operativo
// Datos simulados - Resumen operativo
// const pendingOrders = []; // Moved to Repository

const stockAlerts = [
  { product: "Tubo Cobre 42mm - Barra 5m", id: "ENT-CU-42", stock: 0, status: "out" as const },
  { product: "Tubo Cobre 35mm - Barra 5m", id: "ENT-CU-35", stock: 12, status: "critical" as const },
  { product: "Tubo Cobre 28mm - Barra 5m", id: "ENT-CU-28", stock: 85, status: "low" as const },
];

const lmeHistory = [
  { date: "15/01", value: 8432.50, change: 2.3 },
  { date: "14/01", value: 8243.00, change: -0.5 },
  { date: "13/01", value: 8284.40, change: 1.2 },
  { date: "12/01", value: 8186.15, change: 0.8 },
  { date: "11/01", value: 8121.25, change: -1.1 },
];

import { useOrders } from "@/hooks/useOrders";

export default function AdminDashboard() {
  const { recentOrders: pendingOrders, isLoading } = useOrders();

  // Use mock data for critical stock since we haven't created a ProductRepository yet
  const criticalStock = stockAlerts.filter(s => s.status === "out" || s.status === "critical").length;

  // Calculate volume from orders if loaded, otherwise 0
  const todayVolume = pendingOrders.reduce((sum, o) => sum + o.total, 0) + 12450.00;

  const lmeChange = lmeHistory[0].change;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 py-2">
        {/* Header con Contexto Global */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
            <p className="text-sm text-muted-foreground">Vista general operativa • Domingo, 8 de Febrero</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LME Cobre</span>
              <span className="font-mono font-semibold">${lmeHistory[0].value.toLocaleString("en-US")}</span>
              <span className={cn(
                "text-xs font-mono flex items-center",
                lmeChange > 0 ? "text-green-600" : "text-red-500"
              )}>
                {lmeChange > 0 ? "↑" : "↓"}{Math.abs(lmeChange)}%
              </span>
            </div>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Pedidos Pendientes"
            value={pendingOrders.length}
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800"
          />
          <MetricCard
            label="Volumen Hoy"
            value={`€${todayVolume.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`}
            icon={<Activity className="h-4 w-4 text-blue-600" />}
          />
          <MetricCard
            label="Alertas Stock"
            value={criticalStock}
            icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
            className={criticalStock > 0 ? "border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800" : ""}
          />
          <MetricCard
            label="Envíos en Ruta"
            value="12"
            icon={<Truck className="h-4 w-4 text-green-600" />}
          />
        </div>

        {/* Grid de Contenido */}
        <div className="grid grid-cols-3 gap-6">

          {/* Columna Izquierda (2/3) - Operaciones */}
          <div className="col-span-2 space-y-6">

            {/* Pedidos Pendientes */}
            <DataCard
              title="Cola de Procesamiento"
              subtitle="Pedidos que requieren atención inmediata"
              action={
                <Link to="/admin/orders">
                  <Button size="sm" className="gap-2">
                    Gestionar Pedidos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            >
              <div className="space-y-1">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors bg-card">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        order.priority === "high" ? "bg-red-500 animate-pulse" :
                          order.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                      )} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">{order.id}</span>
                          <span className="text-xs text-muted-foreground">• {order.time}</span>
                        </div>
                        <p className="text-sm font-medium">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold">€{order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.items} items</p>
                      </div>
                      <Link to="/admin/orders">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>

          </div>

          {/* Columna Derecha (1/3) - Resumen & Alertas */}
          <div className="space-y-6">

            {/* Stock Crítico */}
            <DataCard
              title="Stock Crítico"
              subtitle="Inventario bajo mínimos"
              className="border-red-200 dark:border-red-900"
              headerClassName="bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400"
            >
              <div className="space-y-3">
                {stockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-red-100 last:border-0 dark:border-red-900/30">
                    <div>
                      <p className="text-sm font-medium">{item.product}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "font-mono text-xs",
                      item.status === "out" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"
                    )}>
                      {item.stock} uds
                    </Badge>
                  </div>
                ))}
                <Link to="/admin/stock" className="block mt-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    Ver todo el inventario
                  </Button>
                </Link>
              </div>
            </DataCard>

            {/* Accesos Rápidos */}
            <DataCard title="Accesos Rápidos">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <span className="block text-xs font-semibold">Reportes</span>
                    <span className="block text-[10px] text-muted-foreground">Ventas Mensuales</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div className="text-left">
                    <span className="block text-xs font-semibold">Catálogo</span>
                    <span className="block text-[10px] text-muted-foreground">Gestionar Productos</span>
                  </div>
                </Button>
              </div>
            </DataCard>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
