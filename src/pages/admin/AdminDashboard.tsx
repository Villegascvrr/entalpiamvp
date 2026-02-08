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
  Activity,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Datos simulados - Resumen operativo
const pendingOrders = [
  { id: "PED-2024-0145", customer: "Distribuciones Norte S.L.", time: "hace 15 min", total: 2450.00, items: 3, priority: "high" },
  { id: "PED-2024-0144", customer: "Suministros Este S.A.", time: "hace 45 min", total: 8920.50, items: 5, priority: "medium" },
  { id: "PED-2024-0143", customer: "Comercial Sur", time: "hace 1h 20min", total: 1890.00, items: 2, priority: "low" },
];

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

const recentActivity = [
  { action: "Pedido procesado", detail: "PED-2024-0142 → Distribuciones Norte", time: "09:45" },
  { action: "Stock actualizado", detail: "Tubo Cobre 15mm +500 rollos", time: "09:30" },
  { action: "Precio ajustado", detail: "Margen Rollos → 12.5%", time: "08:45" },
  { action: "Pedido recibido", detail: "PED-2024-0145 desde Distribuciones Norte", time: "08:30" },
];

export default function AdminDashboard() {
  const pendingCount = pendingOrders.length;
  const criticalStock = stockAlerts.filter(s => s.status === "out" || s.status === "critical").length;
  const todayVolume = pendingOrders.reduce((sum, o) => sum + o.total, 0) + 12450.00;
  const lmeChange = lmeHistory[0].change;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Compacto */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Resumen Operativo</h1>
            <p className="text-sm text-muted-foreground">Estado actual de operaciones ENTALPIA</p>
          </div>
          <div className="flex items-center gap-2">
            <PriceTicker label="LME Cobre" value={8432.50} change={2.3} />
            <PriceTicker label="EUR/USD" value={1.0842} change={0.1} />
          </div>
        </div>

        {/* Alert Banner - Urgente */}
        {(pendingCount > 0 || criticalStock > 0) && (
          <div className="flex items-center justify-between gap-4 px-3 py-2 rounded bg-status-low/10 border border-status-low/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-status-low" />
              <span className="text-sm text-status-low font-medium">
                {pendingCount} pedidos pendientes · {criticalStock} alertas de stock crítico
              </span>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/orders">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Ver Pedidos
                </Button>
              </Link>
              <Link to="/admin/stock">
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Ver Stock
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Métricas Principales */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Pedidos Pendientes"
            value={pendingCount}
            icon={<Clock className="h-4 w-4" />}
            className="py-3"
          />
          <MetricCard
            label="Volumen Hoy"
            value={`€${todayVolume.toLocaleString("es-ES", { minimumFractionDigits: 0 })}`}
            icon={<Package className="h-4 w-4" />}
            className="py-3"
          />
          <MetricCard
            label="LME Cobre"
            value={`$${lmeHistory[0].value.toLocaleString("en-US")}`}
            change={{ 
              value: `${lmeChange > 0 ? '+' : ''}${lmeChange}%`, 
              trend: lmeChange > 0 ? "up" : "down" 
            }}
            icon={lmeChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            className="py-3"
          />
          <MetricCard
            label="Alertas Stock"
            value={stockAlerts.length}
            icon={<AlertTriangle className="h-4 w-4" />}
            className="py-3"
          />
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-3 gap-4">
          {/* Pedidos Pendientes - Columna Principal */}
          <DataCard 
            title="Pedidos Pendientes" 
            subtitle="Requieren procesamiento"
            className="col-span-2"
            action={
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                  Ver Todos <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            }
            bodyClassName="p-0"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground text-xs py-2 px-3">Pedido</th>
                  <th className="text-left font-medium text-muted-foreground text-xs py-2 px-3">Cliente</th>
                  <th className="text-left font-medium text-muted-foreground text-xs py-2 px-3">Tiempo</th>
                  <th className="text-right font-medium text-muted-foreground text-xs py-2 px-3">Total</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          order.priority === "high" ? "bg-destructive" :
                          order.priority === "medium" ? "bg-status-low" : "bg-muted-foreground"
                        )} />
                        <span className="font-mono text-xs font-medium">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs">{order.customer}</td>
                    <td className="py-2 px-3 text-xs text-muted-foreground">{order.time}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs font-medium">€{order.total.toFixed(2)}</td>
                    <td className="py-2 px-3">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>

          {/* Sidebar Derecha */}
          <div className="space-y-4">
            {/* Alertas de Stock */}
            <DataCard 
              title="Alertas Stock" 
              subtitle="Productos con disponibilidad limitada"
              action={
                <Link to="/admin/stock">
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                    Gestionar
                  </Button>
                </Link>
              }
            >
              <div className="space-y-2">
                {stockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div>
                      <p className="text-xs font-medium">{item.product}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{item.id}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] h-5",
                        item.status === "out" ? "border-destructive text-destructive" :
                        item.status === "critical" ? "border-destructive text-destructive" :
                        "border-status-low text-status-low"
                      )}
                    >
                      {item.status === "out" ? "Agotado" : `${item.stock} uds`}
                    </Badge>
                  </div>
                ))}
              </div>
            </DataCard>

            {/* Historial LME */}
            <DataCard title="Evolución LME" subtitle="Últimos 5 días">
              <div className="space-y-1.5">
                {lmeHistory.map((day, i) => (
                  <div key={day.date} className={cn(
                    "flex items-center justify-between py-1 px-2 rounded text-xs",
                    i === 0 && "bg-muted/50"
                  )}>
                    <span className="text-muted-foreground">{day.date}</span>
                    <span className="font-mono font-medium">${day.value.toLocaleString("en-US")}</span>
                    <span className={cn(
                      "font-mono text-[10px]",
                      day.change > 0 ? "text-status-available" : day.change < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {day.change > 0 ? "+" : ""}{day.change}%
                    </span>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>
        </div>

        {/* Actividad Reciente - Footer */}
        <DataCard title="Actividad Reciente" subtitle="Últimas operaciones registradas" bodyClassName="py-2">
          <div className="flex gap-6">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Activity className="h-3 w-3 text-primary" />
                <span className="font-medium">{activity.action}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{activity.detail}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground font-mono">{activity.time}</span>
              </div>
            ))}
          </div>
        </DataCard>
      </div>
    </AppLayout>
  );
}
