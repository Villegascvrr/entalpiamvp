import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { PriceDisplay } from "@/components/ui/price-display";
import { StockIndicator } from "@/components/ui/stock-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Package,
  Truck,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  priceChange: number;
  stock: number;
  unit: string;
  minOrder: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

// Productos ENTALPIA - Tubería de cobre
const products: Product[] = [
  { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", category: "Rollos", price: 245.80, priceChange: 2.3, stock: 1250, unit: "rollos", minOrder: 10 },
  { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", category: "Rollos", price: 312.50, priceChange: 1.8, stock: 890, unit: "rollos", minOrder: 10 },
  { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", category: "Rollos", price: 198.90, priceChange: 2.1, stock: 420, unit: "rollos", minOrder: 5 },
  { id: "ENT-CU-28", name: "Tubo Cobre 28mm - Barra 5m", category: "Barras", price: 89.40, priceChange: 1.5, stock: 85, unit: "barras", minOrder: 20 },
  { id: "ENT-CU-35", name: "Tubo Cobre 35mm - Barra 5m", category: "Barras", price: 142.60, priceChange: -0.5, stock: 12, unit: "barras", minOrder: 10 },
  { id: "ENT-CU-42", name: "Tubo Cobre 42mm - Barra 5m", category: "Barras", price: 178.30, priceChange: 0.0, stock: 0, unit: "barras", minOrder: 10 },
  { id: "ENT-CU-54", name: "Tubo Cobre 54mm - Barra 5m", category: "Barras", price: 234.20, priceChange: 1.2, stock: 45, unit: "barras", minOrder: 5 },
  { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", category: "Accesorios", price: 2.45, priceChange: 0.8, stock: 5000, unit: "unidades", minOrder: 100 },
];

const MINIMUM_ORDER_TOTAL = 500;
const CONTAINER_WEIGHT_LIMIT = 24000; // kg

export default function OrderBuilder() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const addToOrder = (product: Product) => {
    const existing = orderItems.find(item => item.product.id === product.id);
    if (existing) {
      setOrderItems(orderItems.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + product.minOrder }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { product, quantity: product.minOrder }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (newQuantity <= 0) {
      removeFromOrder(productId);
    } else {
      setOrderItems(orderItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product.id !== productId));
  };

  const orderTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [orderItems]);

  const validationErrors = useMemo(() => {
    const errors: { type: "error" | "warning"; message: string }[] = [];
    
    orderItems.forEach(item => {
      if (item.quantity < item.product.minOrder) {
        errors.push({ 
          type: "error", 
          message: `${item.product.name}: Pedido mínimo de ${item.product.minOrder} ${item.product.unit}` 
        });
      }
      if (item.quantity > item.product.stock) {
        errors.push({ 
          type: "error", 
          message: `${item.product.name}: Solo ${item.product.stock} ${item.product.unit} disponibles` 
        });
      }
    });

    if (orderItems.length > 0 && orderTotal < MINIMUM_ORDER_TOTAL) {
      errors.push({ 
        type: "warning", 
        message: `Pedido mínimo €${MINIMUM_ORDER_TOTAL}. Faltan €${(MINIMUM_ORDER_TOTAL - orderTotal).toFixed(2)}` 
      });
    }

    return errors;
  }, [orderItems, orderTotal]);

  const hasErrors = validationErrors.some(e => e.type === "error");
  const canProceed = orderItems.length > 0 && !hasErrors && orderTotal >= MINIMUM_ORDER_TOTAL;

  return (
    <AppLayout>
      <div className="h-full flex gap-6">
        {/* Product Selection Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Crear Pedido</h1>
            <p className="text-muted-foreground">Selecciona productos y configura cantidades</p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-auto scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const inOrder = orderItems.find(item => item.product.id === product.id);
                const isLowStock = product.stock < 100;
                const isOutOfStock = product.stock === 0;
                
                return (
                  <div 
                    key={product.id}
                    className={cn(
                      "industrial-card p-4 transition-all",
                      inOrder && "ring-2 ring-primary",
                      isOutOfStock && "opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{product.id}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <PriceDisplay
                        value={product.price}
                        unit={`/${product.unit.slice(0, -1)}`}
                        change={{
                          percentage: Math.abs(product.priceChange),
                          direction: product.priceChange > 0 ? "up" : product.priceChange < 0 ? "down" : "neutral"
                        }}
                      />
                      <StockIndicator
                        quantity={product.stock}
                        unit={product.unit}
                        showLabel={isLowStock || isOutOfStock}
                      />
                      <p className="text-xs text-muted-foreground">
                        Pedido mín.: {product.minOrder} {product.unit}
                      </p>
                    </div>

                    {inOrder ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, inOrder.quantity - product.minOrder)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={inOrder.quantity}
                          onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                          className="h-8 text-center font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, inOrder.quantity + product.minOrder)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => addToOrder(product)}
                        disabled={isOutOfStock}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isOutOfStock ? "Agotado" : "Añadir al Pedido"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Panel - Always Visible Sidebar */}
        <div className="w-96 flex-shrink-0 flex flex-col">
          <DataCard 
            title="Resumen del Pedido" 
            subtitle={`${orderItems.length} artículo(s) seleccionado(s)`}
            className="flex-1 flex flex-col"
            bodyClassName="flex-1 flex flex-col p-0"
          >
            {orderItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Sin productos seleccionados</p>
                  <p className="text-sm text-muted-foreground">Añade productos de la lista para configurar tu pedido</p>
                </div>
              </div>
            ) : (
              <>
                {/* Order Items */}
                <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-3">
                  {orderItems.map(item => (
                    <div key={item.product.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-md">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.product.id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {item.quantity} {item.product.unit} × €{item.product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono text-sm">
                          €{(item.quantity * item.product.price).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-6 px-2"
                          onClick={() => removeFromOrder(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Messages */}
                {validationErrors.length > 0 && (
                  <div className="px-4 space-y-2">
                    {validationErrors.map((error, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "flex items-start gap-2 px-3 py-2 rounded-md text-sm",
                          error.type === "error" 
                            ? "bg-destructive/10 text-destructive border border-destructive/30" 
                            : "bg-status-low/10 text-status-low border border-status-low/30"
                        )}
                      >
                        {error.type === "error" 
                          ? <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          : <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        }
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {validationErrors.length === 0 && orderItems.length > 0 && (
                  <div className="px-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-status-available/10 text-status-available text-sm border border-status-available/30">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Configuración del pedido válida</span>
                    </div>
                  </div>
                )}

                {/* Logistics Info */}
                <div className="px-4 py-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Entrega estimada: 3-5 días laborables</span>
                  </div>
                </div>

                {/* Order Total and Actions */}
                <div className="p-4 border-t border-border space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Pedido</span>
                    <span className="text-2xl font-bold font-mono">€{orderTotal.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!canProceed}
                    onClick={() => navigate("/order/preview", { state: { orderItems, orderTotal } })}
                  >
                    Revisar Pedido
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </DataCard>
        </div>
      </div>
    </AppLayout>
  );
}
