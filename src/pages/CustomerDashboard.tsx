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
import { useRole } from "@/contexts/RoleContext";

// Datos simulados ENTALPIA - Tubería de cobre
const marketIndicators = [
  { label: "LME Cobre", value: 8432.50, change: 2.3 },
  { label: "EUR/USD", value: 1.0842, change: 0.1 },
];

const products = [
  { 
    id: "ENT-CU-15", 
    name: "Tubo Cobre 15mm - Rollo 50m", 
    category: "Tubería Cobre",
    price: 245.80, 
    priceChange: 2.3, 
    stock: 1250, 
    unit: "rollos",
    status: "available" as const
  },
  { 
    id: "ENT-CU-18", 
    name: "Tubo Cobre 18mm - Rollo 50m", 
    category: "Tubería Cobre",
    price: 312.50, 
    priceChange: 1.8, 
    stock: 890, 
    unit: "rollos",
    status: "available" as const
  },
  { 
    id: "ENT-CU-22", 
    name: "Tubo Cobre 22mm - Rollo 25m", 
    category: "Tubería Cobre",
    price: 198.90, 
    priceChange: 2.1, 
    stock: 420, 
    unit: "rollos",
    status: "available" as const
  },
  { 
    id: "ENT-CU-28", 
    name: "Tubo Cobre 28mm - Barra 5m", 
    category: "Tubería Cobre",
    price: 89.40, 
    priceChange: 1.5, 
    stock: 85, 
    unit: "barras",
    status: "low" as const
  },
  { 
    id: "ENT-CU-35", 
    name: "Tubo Cobre 35mm - Barra 5m", 
    category: "Tubería Cobre",
    price: 142.60, 
    priceChange: -0.5, 
    stock: 12, 
    unit: "barras",
    status: "low" as const
  },
  { 
    id: "ENT-CU-42", 
    name: "Tubo Cobre 42mm - Barra 5m", 
    category: "Tubería Cobre",
    price: 178.30, 
    priceChange: 0.0, 
    stock: 0, 
    unit: "barras",
    status: "out" as const
  },
];

const recentOrders = [
  { id: "PED-2024-0142", date: "15/01/2024", status: "procesando", total: 4250.00 },
  { id: "PED-2024-0138", date: "14/01/2024", status: "enviado", total: 8920.50 },
  { id: "PED-2024-0131", date: "12/01/2024", status: "entregado", total: 2180.00 },
];

const inTransitStock = [
  { product: "Tubo Cobre 42mm", quantity: 200, arrival: "18/01/2024" },
  { product: "Tubo Cobre 35mm", quantity: 150, arrival: "20/01/2024" },
];

export default function CustomerDashboard() {
  const { isInterno } = useRole();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel Principal</h1>
            <p className="text-muted-foreground">
              Precios y stock actualizados del día
            </p>
          </div>
          <Link to="/order/new">
            <Button className="gap-2">
              <Package className="h-4 w-4" />
              Crear Pedido
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Market Indicators */}
        <div className="flex flex-wrap gap-3">
          {marketIndicators.map((indicator) => (
            <PriceTicker
              key={indicator.label}
              label={indicator.label}
              value={indicator.value}
              change={indicator.change}
            />
          ))}
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Última actualización: 08:30 CET
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Productos Disponibles"
            value="24"
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            label="Pedidos Abiertos"
            value="3"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <MetricCard
            label="Variación Media"
            value="+1.8%"
            change={{ value: "vs. ayer", trend: "up" }}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Pricing Table */}
          <DataCard 
            title="Precios del Día" 
            subtitle="Catálogo ENTALPIA actualizado"
            className="lg:col-span-2"
            action={
              <Link to="/order/new">
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver Todo
                </Button>
              </Link>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/30">
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-right">Precio</th>
                    <th className="text-right">Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.id}</p>
                        </div>
                      </td>
                      <td>
                        <Badge variant="secondary" className="font-normal">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <PriceDisplay
                          value={product.price}
                          unit={`/${product.unit.slice(0, -1)}`}
                          size="sm"
                          change={{
                            percentage: Math.abs(product.priceChange),
                            direction: product.priceChange > 0 ? "up" : product.priceChange < 0 ? "down" : "neutral"
                          }}
                        />
                      </td>
                      <td className="text-right">
                        <StockIndicator
                          quantity={product.stock}
                          unit={product.unit}
                          showLabel={false}
                        />
                      </td>
                      <td>
                        <Link to="/order/new">
                          <Button variant="ghost" size="sm" disabled={product.status === "out"}>
                            {product.status === "out" ? "Agotado" : "Pedir"}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Low Stock Alert */}
            <DataCard title="Alertas de Stock" subtitle="Productos con disponibilidad limitada">
              <div className="space-y-3">
                {products.filter(p => p.status !== "available").map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.id}</p>
                    </div>
                    <StockBadge status={product.status} />
                  </div>
                ))}
              </div>
            </DataCard>

            {/* In Transit */}
            <DataCard title="Stock en Tránsito" subtitle="Próximas llegadas">
              <div className="space-y-3">
                {inTransitStock.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{item.product}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} unidades</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.arrival}
                    </Badge>
                  </div>
                ))}
              </div>
            </DataCard>

            {/* Recent Orders */}
            <DataCard 
              title="Pedidos Recientes" 
              subtitle="Tus últimos 3 pedidos"
              action={
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver Todos
                  </Button>
                </Link>
              }
            >
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium font-mono">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold price-display">€{order.total.toFixed(2)}</p>
                      <Badge 
                        variant="outline" 
                        className={
                          order.status === "entregado" ? "border-status-available text-status-available" :
                          order.status === "enviado" ? "border-primary text-primary" :
                          "border-status-low text-status-low"
                        }
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
