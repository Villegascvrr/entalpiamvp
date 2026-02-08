import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard, MetricCard } from "@/components/ui/data-card";
import { PriceDisplay, PriceTicker } from "@/components/ui/price-display";
import { StockIndicator, StockBadge } from "@/components/ui/stock-indicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Package, 
  ClipboardList, 
  ArrowRight,
  Clock,
  Truck
} from "lucide-react";
import { Link } from "react-router-dom";

// Datos simulados ENTALPIA - Tubería de cobre
const marketIndicators = [
  { label: "LME Cobre", value: 8432.50, change: 2.3 },
  { label: "EUR/USD", value: 1.0842, change: 0.1 },
];

const products = [
  { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", category: "Rollos", price: 245.80, priceChange: 2.3, stock: 1250, unit: "rollos", status: "available" as const },
  { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", category: "Rollos", price: 312.50, priceChange: 1.8, stock: 890, unit: "rollos", status: "available" as const },
  { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", category: "Rollos", price: 198.90, priceChange: 2.1, stock: 420, unit: "rollos", status: "available" as const },
  { id: "ENT-CU-28", name: "Tubo Cobre 28mm - Barra 5m", category: "Barras", price: 89.40, priceChange: 1.5, stock: 85, unit: "barras", status: "low" as const },
  { id: "ENT-CU-35", name: "Tubo Cobre 35mm - Barra 5m", category: "Barras", price: 142.60, priceChange: -0.5, stock: 12, unit: "barras", status: "low" as const },
  { id: "ENT-CU-42", name: "Tubo Cobre 42mm - Barra 5m", category: "Barras", price: 178.30, priceChange: 0.0, stock: 0, unit: "barras", status: "out" as const },
  { id: "ENT-CU-54", name: "Tubo Cobre 54mm - Barra 5m", category: "Barras", price: 234.20, priceChange: 1.2, stock: 45, unit: "barras", status: "available" as const },
  { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", category: "Accesorios", price: 2.45, priceChange: 0.8, stock: 5000, unit: "uds", status: "available" as const },
];

const recentOrders = [
  { id: "PED-2024-0142", date: "15/01/2024", status: "procesando", total: 4250.00 },
  { id: "PED-2024-0138", date: "14/01/2024", status: "enviado", total: 8920.50 },
  { id: "PED-2024-0131", date: "12/01/2024", status: "entregado", total: 2180.00 },
];

const inTransitStock = [
  { product: "Tubo Cobre 42mm", quantity: 200, arrival: "18/01" },
  { product: "Tubo Cobre 35mm", quantity: 150, arrival: "20/01" },
];

export default function CustomerDashboard() {
  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Compacto */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Panel Principal</h1>
            <p className="text-sm text-muted-foreground">Precios y stock actualizados del día</p>
          </div>
          <div className="flex items-center gap-3">
            {marketIndicators.map((indicator) => (
              <PriceTicker
                key={indicator.label}
                label={indicator.label}
                value={indicator.value}
                change={indicator.change}
              />
            ))}
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              08:30 CET
            </div>
            <Link to="/order/new">
              <Button size="sm" className="gap-1.5 h-8">
                <Package className="h-3.5 w-3.5" />
                Crear Pedido
              </Button>
            </Link>
          </div>
        </div>

        {/* Métricas Compactas */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Productos Disponibles"
            value="24"
            icon={<Package className="h-4 w-4" />}
            className="py-2.5"
          />
          <MetricCard
            label="Pedidos Abiertos"
            value="3"
            icon={<ClipboardList className="h-4 w-4" />}
            className="py-2.5"
          />
          <MetricCard
            label="Variación Media"
            value="+1.8%"
            change={{ value: "vs. ayer", trend: "up" }}
            icon={<TrendingUp className="h-4 w-4" />}
            className="py-2.5"
          />
        </div>

        {/* Contenido Principal - Grid 3 columnas */}
        <div className="grid grid-cols-4 gap-4">
          {/* Tabla de Precios - 3 columnas */}
          <DataCard 
            title="Catálogo de Precios" 
            subtitle="Actualización diaria LME"
            className="col-span-3"
            action={
              <Link to="/order/new">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7">
                  Crear Pedido <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            }
            bodyClassName="p-0"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Código</th>
                  <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Producto</th>
                  <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Cat.</th>
                  <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Precio</th>
                  <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Var.</th>
                  <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Stock</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-1.5 px-3">
                      <span className="font-mono text-xs text-muted-foreground">{product.id}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="text-xs font-medium">{product.name}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <Badge variant="secondary" className="text-[10px] h-5 font-normal">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="font-mono text-xs font-semibold">€{product.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground">/{product.unit.slice(0, -1)}</span>
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <span className={`font-mono text-[10px] ${product.priceChange > 0 ? 'text-status-available' : product.priceChange < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {product.priceChange > 0 ? '+' : ''}{product.priceChange}%
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <StockIndicator quantity={product.stock} unit={product.unit} showLabel={false} />
                    </td>
                    <td className="py-1.5 px-3">
                      <Link to="/order/new">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" disabled={product.status === "out"}>
                          {product.status === "out" ? "Agotado" : "Pedir"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>

          {/* Sidebar - 1 columna */}
          <div className="space-y-4">
            {/* Alertas Stock */}
            <DataCard title="Alertas Stock" subtitle="Disponibilidad limitada">
              <div className="space-y-2">
                {products.filter(p => p.status !== "available").map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <div>
                      <p className="text-[11px] font-medium truncate max-w-32">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{product.id}</p>
                    </div>
                    <StockBadge status={product.status} />
                  </div>
                ))}
              </div>
            </DataCard>

            {/* En Tránsito */}
            <DataCard title="En Tránsito" subtitle="Próximas llegadas">
              <div className="space-y-2">
                {inTransitStock.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3 w-3 text-primary" />
                      <div>
                        <p className="text-[11px] font-medium">{item.product}</p>
                        <p className="text-[10px] text-muted-foreground">{item.quantity} uds</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {item.arrival}
                    </Badge>
                  </div>
                ))}
              </div>
            </DataCard>

            {/* Pedidos Recientes */}
            <DataCard 
              title="Mis Pedidos" 
              subtitle="Últimos 3 pedidos"
              action={
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6">
                    Ver Todos
                  </Button>
                </Link>
              }
            >
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <div>
                      <p className="text-[11px] font-medium font-mono">{order.id}</p>
                      <p className="text-[10px] text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold font-mono">€{order.total.toFixed(2)}</p>
                      <Badge 
                        variant="outline" 
                        className="text-[9px] h-4"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
