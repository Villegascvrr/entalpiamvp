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
  AlertTriangle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const marketIndicators = [
  { label: "LME Copper", value: 8432.50, change: 2.3 },
  { label: "LME Aluminum", value: 2245.00, change: -0.8 },
  { label: "EUR/USD", value: 1.0842, change: 0.1 },
];

const products = [
  { 
    id: "CU-T-15", 
    name: "Copper Tube 15mm", 
    category: "Copper Tubing",
    price: 12.45, 
    priceChange: 2.3, 
    stock: 2450, 
    unit: "meters" 
  },
  { 
    id: "CU-T-22", 
    name: "Copper Tube 22mm", 
    category: "Copper Tubing",
    price: 18.90, 
    priceChange: 1.8, 
    stock: 1820, 
    unit: "meters" 
  },
  { 
    id: "CU-T-28", 
    name: "Copper Tube 28mm", 
    category: "Copper Tubing",
    price: 24.30, 
    priceChange: 2.1, 
    stock: 890, 
    unit: "meters" 
  },
  { 
    id: "CU-S-1.5", 
    name: "Copper Sheet 1.5mm", 
    category: "Copper Sheets",
    price: 42.80, 
    priceChange: -0.5, 
    stock: 45, 
    unit: "sheets" 
  },
  { 
    id: "CU-S-2.0", 
    name: "Copper Sheet 2.0mm", 
    category: "Copper Sheets",
    price: 56.20, 
    priceChange: 0.0, 
    stock: 8, 
    unit: "sheets" 
  },
  { 
    id: "AL-T-20", 
    name: "Aluminum Tube 20mm", 
    category: "Aluminum Tubing",
    price: 8.75, 
    priceChange: -1.2, 
    stock: 3200, 
    unit: "meters" 
  },
];

const recentOrders = [
  { id: "ORD-2024-0142", date: "2024-01-15", status: "processing", total: 4250.00 },
  { id: "ORD-2024-0138", date: "2024-01-14", status: "shipped", total: 8920.50 },
  { id: "ORD-2024-0131", date: "2024-01-12", status: "delivered", total: 2180.00 },
];

export default function CustomerDashboard() {
  return (
    <AppLayout userRole="customer" userName="Marcus Chen" companyName="Metro Distributors">
      <div className="space-y-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Today's pricing and stock overview
            </p>
          </div>
          <Link to="/order/new">
            <Button className="gap-2">
              <Package className="h-4 w-4" />
              Create Order
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
            Last updated: 08:30 CET
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Available Products"
            value="124"
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            label="Open Orders"
            value="3"
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <MetricCard
            label="Avg. Price Change"
            value="+1.8%"
            change={{ value: "vs. yesterday", trend: "up" }}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Pricing Table */}
          <DataCard 
            title="Daily Pricing" 
            subtitle="Updated prices for today"
            className="lg:col-span-2"
            action={
              <Link to="/order/new">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/30">
                    <th>Product</th>
                    <th>Category</th>
                    <th className="text-right">Price</th>
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
                          <Button variant="ghost" size="sm">
                            Order
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
            <DataCard title="Stock Alerts" subtitle="Items with low availability">
              <div className="space-y-3">
                {products.filter(p => p.stock < 100).map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.id}</p>
                    </div>
                    <StockBadge status={product.stock <= 10 ? "out" : "low"} />
                  </div>
                ))}
              </div>
            </DataCard>

            {/* Recent Orders */}
            <DataCard 
              title="Recent Orders" 
              subtitle="Your last 3 orders"
              action={
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
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
                          order.status === "delivered" ? "border-status-available text-status-available" :
                          order.status === "shipped" ? "border-primary text-primary" :
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
