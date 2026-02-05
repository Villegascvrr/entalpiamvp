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
  Package
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const products: Product[] = [
  { id: "CU-T-15", name: "Copper Tube 15mm", category: "Copper Tubing", price: 12.45, priceChange: 2.3, stock: 2450, unit: "meters", minOrder: 100 },
  { id: "CU-T-22", name: "Copper Tube 22mm", category: "Copper Tubing", price: 18.90, priceChange: 1.8, stock: 1820, unit: "meters", minOrder: 100 },
  { id: "CU-T-28", name: "Copper Tube 28mm", category: "Copper Tubing", price: 24.30, priceChange: 2.1, stock: 890, unit: "meters", minOrder: 50 },
  { id: "CU-S-1.5", name: "Copper Sheet 1.5mm", category: "Copper Sheets", price: 42.80, priceChange: -0.5, stock: 45, unit: "sheets", minOrder: 5 },
  { id: "CU-S-2.0", name: "Copper Sheet 2.0mm", category: "Copper Sheets", price: 56.20, priceChange: 0.0, stock: 8, unit: "sheets", minOrder: 5 },
  { id: "AL-T-20", name: "Aluminum Tube 20mm", category: "Aluminum Tubing", price: 8.75, priceChange: -1.2, stock: 3200, unit: "meters", minOrder: 200 },
  { id: "AL-T-25", name: "Aluminum Tube 25mm", category: "Aluminum Tubing", price: 11.20, priceChange: -0.8, stock: 2100, unit: "meters", minOrder: 200 },
  { id: "AL-S-1.0", name: "Aluminum Sheet 1.0mm", category: "Aluminum Sheets", price: 28.50, priceChange: 0.5, stock: 120, unit: "sheets", minOrder: 10 },
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
    const errors: string[] = [];
    
    orderItems.forEach(item => {
      if (item.quantity < item.product.minOrder) {
        errors.push(`${item.product.name}: Minimum order is ${item.product.minOrder} ${item.product.unit}`);
      }
      if (item.quantity > item.product.stock) {
        errors.push(`${item.product.name}: Only ${item.product.stock} ${item.product.unit} available`);
      }
    });

    if (orderItems.length > 0 && orderTotal < MINIMUM_ORDER_TOTAL) {
      errors.push(`Minimum order total is €${MINIMUM_ORDER_TOTAL}. Add €${(MINIMUM_ORDER_TOTAL - orderTotal).toFixed(2)} more.`);
    }

    return errors;
  }, [orderItems, orderTotal]);

  const canProceed = orderItems.length > 0 && validationErrors.length === 0;

  return (
    <AppLayout userRole="customer" userName="Marcus Chen" companyName="Metro Distributors">
      <div className="h-full flex gap-6">
        {/* Product Selection Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Create Order</h1>
            <p className="text-muted-foreground">Select products and configure quantities</p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                All
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
                
                return (
                  <div 
                    key={product.id}
                    className={cn(
                      "industrial-card p-4 transition-all",
                      inOrder && "ring-2 ring-primary"
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
                        showLabel={isLowStock}
                      />
                      <p className="text-xs text-muted-foreground">
                        Min. order: {product.minOrder} {product.unit}
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
                        disabled={product.stock < product.minOrder}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Order
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className="w-96 flex-shrink-0 flex flex-col">
          <DataCard 
            title="Order Configuration" 
            subtitle={`${orderItems.length} item(s) selected`}
            className="flex-1 flex flex-col"
            bodyClassName="flex-1 flex flex-col p-0"
          >
            {orderItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No products selected</p>
                  <p className="text-sm text-muted-foreground">Add products from the list to configure your order</p>
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
                      <div key={index} className="validation-warning">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {validationErrors.length === 0 && orderItems.length > 0 && (
                  <div className="px-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-status-available/10 text-status-available text-sm border border-status-available/30">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Order configuration valid</span>
                    </div>
                  </div>
                )}

                {/* Order Total and Actions */}
                <div className="p-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="text-2xl font-bold font-mono">€{orderTotal.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!canProceed}
                    onClick={() => navigate("/order/preview", { state: { orderItems, orderTotal } })}
                  >
                    Review Order
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
