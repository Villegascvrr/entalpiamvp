import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { StockIndicator } from "@/components/ui/stock-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", category: "Accesorios", price: 2.45, priceChange: 0.8, stock: 5000, unit: "uds", minOrder: 100 },
  { id: "ENT-ACC-02", name: "Te Cobre 15mm", category: "Accesorios", price: 3.20, priceChange: 0.5, stock: 3500, unit: "uds", minOrder: 100 },
  { id: "ENT-ACC-03", name: "Manguito Cobre 18mm", category: "Accesorios", price: 1.85, priceChange: 0.3, stock: 8000, unit: "uds", minOrder: 200 },
];

const MINIMUM_ORDER_TOTAL = 500;

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
          message: `${item.product.id}: Mín. ${item.product.minOrder} ${item.product.unit}` 
        });
      }
      if (item.quantity > item.product.stock) {
        errors.push({ 
          type: "error", 
          message: `${item.product.id}: Solo ${item.product.stock} disponibles` 
        });
      }
    });

    if (orderItems.length > 0 && orderTotal < MINIMUM_ORDER_TOTAL) {
      errors.push({ 
        type: "warning", 
        message: `Pedido mínimo €${MINIMUM_ORDER_TOTAL}` 
      });
    }

    return errors;
  }, [orderItems, orderTotal]);

  const hasErrors = validationErrors.some(e => e.type === "error");
  const canProceed = orderItems.length > 0 && !hasErrors && orderTotal >= MINIMUM_ORDER_TOTAL;
  const progressPercentage = Math.min((orderTotal / MINIMUM_ORDER_TOTAL) * 100, 100);

  return (
    <AppLayout>
      <div className="h-full flex gap-4">
        {/* Panel Principal - Tabla de Productos */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-xl font-semibold text-foreground">Crear Pedido</h1>
            <p className="text-sm text-muted-foreground">Configura productos y cantidades</p>
          </div>

          {/* Filtros Compactos */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabla de Productos */}
          <DataCard title="Catálogo" className="flex-1 overflow-hidden" bodyClassName="p-0 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Código</th>
                  <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Producto</th>
                  <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Cat.</th>
                  <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Precio</th>
                  <th className="text-center font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Mín.</th>
                  <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Stock</th>
                  <th className="text-center font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3 w-36">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const inOrder = orderItems.find(item => item.product.id === product.id);
                  const isOutOfStock = product.stock === 0;
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={cn(
                        "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                        inOrder && "bg-primary/5",
                        isOutOfStock && "opacity-50"
                      )}
                    >
                      <td className="py-1.5 px-3">
                        <span className="font-mono text-[11px] text-muted-foreground">{product.id}</span>
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
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-mono text-xs font-semibold">€{product.price.toFixed(2)}</span>
                          <span className={cn(
                            "font-mono text-[9px]",
                            product.priceChange > 0 ? "text-status-available" : 
                            product.priceChange < 0 ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {product.priceChange > 0 ? "↑" : product.priceChange < 0 ? "↓" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="text-[10px] text-muted-foreground">{product.minOrder}</span>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <StockIndicator quantity={product.stock} unit={product.unit} showLabel={false} />
                      </td>
                      <td className="py-1.5 px-3">
                        {inOrder ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(product.id, inOrder.quantity - product.minOrder)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={inOrder.quantity}
                              onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                              className="h-6 w-14 text-center font-mono text-xs px-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(product.id, inOrder.quantity + product.minOrder)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] w-full"
                            onClick={() => addToOrder(product)}
                            disabled={isOutOfStock}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {isOutOfStock ? "Agotado" : "Añadir"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DataCard>
        </div>

        {/* Sidebar Resumen - Siempre Visible */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          <DataCard 
            title="Resumen del Pedido" 
            subtitle={`${orderItems.length} producto(s)`}
            className="flex-1 flex flex-col"
            bodyClassName="flex-1 flex flex-col p-0"
          >
            {orderItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin productos</p>
                  <p className="text-xs text-muted-foreground">Añade desde la tabla</p>
                </div>
              </div>
            ) : (
              <>
                {/* Lista de Items */}
                <div className="flex-1 overflow-auto scrollbar-thin p-3 space-y-2">
                  {orderItems.map(item => {
                    const hasMinError = item.quantity < item.product.minOrder;
                    const hasStockError = item.quantity > item.product.stock;
                    
                    return (
                      <div 
                        key={item.product.id} 
                        className={cn(
                          "flex items-start gap-2 p-2 rounded border",
                          hasMinError || hasStockError 
                            ? "bg-destructive/5 border-destructive/30" 
                            : "bg-muted/30 border-transparent"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{item.product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{item.product.id}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {item.quantity} × €{item.product.price.toFixed(2)}
                            </span>
                          </div>
                          {hasMinError && (
                            <p className="text-[9px] text-destructive mt-0.5">Mín: {item.product.minOrder}</p>
                          )}
                          {hasStockError && (
                            <p className="text-[9px] text-destructive mt-0.5">Stock: {item.product.stock}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-mono text-xs">
                            €{(item.quantity * item.product.price).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-5 px-1 mt-0.5"
                            onClick={() => removeFromOrder(item.product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progreso hacia Pedido Mínimo */}
                <div className="px-3 py-2 border-t border-border">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Progreso hacia mínimo (€{MINIMUM_ORDER_TOTAL})</span>
                    <span className={cn(
                      "font-mono font-medium",
                      orderTotal >= MINIMUM_ORDER_TOTAL ? "text-status-available" : "text-status-low"
                    )}>
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5" />
                  {orderTotal < MINIMUM_ORDER_TOTAL && (
                    <p className="text-[10px] text-status-low mt-1">
                      Faltan €{(MINIMUM_ORDER_TOTAL - orderTotal).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Mensajes de Validación */}
                {validationErrors.length > 0 && (
                  <div className="px-3 space-y-1.5">
                    {validationErrors.filter(e => e.type === "error").slice(0, 3).map((error, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-1.5 px-2 py-1 rounded bg-destructive/10 text-destructive text-[10px] border border-destructive/20"
                      >
                        <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {validationErrors.length === 0 && orderItems.length > 0 && (
                  <div className="px-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-status-available/10 text-status-available text-[10px] border border-status-available/20">
                      <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      <span>Configuración válida</span>
                    </div>
                  </div>
                )}

                {/* Logística */}
                <div className="px-3 py-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    <span>Entrega: 3-5 días laborables</span>
                  </div>
                </div>

                {/* Total y Acciones */}
                <div className="p-3 border-t border-border space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Pedido</span>
                    <span className="text-xl font-bold font-mono">€{orderTotal.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full h-9" 
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
