import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom"; // Add import
import { AppLayout } from "@/components/layout/AppLayout";
import { MasterDetailLayout, MasterPanel, DetailPanel } from "@/components/layout/MasterDetailLayout";
import { DataCard } from "@/components/ui/data-card";
import { StockIndicator } from "@/components/ui/stock-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertCircle,
  TrendingUp,
  TrendingDown,
  FileEdit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  priceChange: number;
  stock: number;
  unit: string;
  minOrder: number;
  isCustom?: boolean;
}

interface OrderItem {
  product: Product;
  quantity: number;
  notes?: string;
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

// Simulated LME price data
const lmeData = {
  price: 8432.50,
  change: 2.3,
  currency: "USD/t",
  updated: "15/01 09:00"
};

import { useOrder } from "@/contexts/OrderContext";

export default function OrderBuilder() {
  const navigate = useNavigate();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateItemNotes,
    orderTotal
  } = useOrder();

  // Map global items to component expectations if needed, but we should try to use them directly.
  // The component heavily assumes nested product structure in some existing logic? 
  // Let's alias items to orderItems for now
  const orderItems = items;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // Removed local state

  // Custom Item State
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: "",
    quantity: 1,
    unit: "uds",
    notes: ""
  });

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const addToOrder = (product: Product, quantity: number, notes?: string) => {
    // We use addItem from context. Note that our legacy Product interface here matches enough 
    // of the expectation (id, name, price, unit) but we might want to pass 'category' too.
    // Also, addItem adds 1 by default, but here we add 'quantity'. 
    // Context's addItem is simple, it doesn't take quantity/notes.
    // We might need to call it multiple times or update current quantity.

    // ACTUALLY, I should have made addItem take quantity/notes. 
    // But for now, I'll simulate it:

    // Check if exists
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + quantity);
      if (notes) updateItemNotes(product.id, notes);
      toast.success(`Actualizado: ${product.name}`);
    } else {
      // Add first
      addItem({
        ...product,
        isCustom: product.isCustom || false
      });
      // Then update quantity if > 1 (addItem sets it to 1)
      if (quantity > 1) {
        // We need to wait for state update? No, React state updates are batched usually but with context actions...
        // Actually, addItem in context uses functional update.
        // If I call updateQuantity immediately, it might run on old state if not careful.
        // BUT, updateQuantity also uses functional update. So it should work!
        // However, the 'existing' check above uses closure value 'items'.

        // To be safe: addItem currently sets quantity to 1.
        // I should modify addItem to take quantity. 
        // Wait, I can't modify context definition easily mid-file-edit.

        // Let's rely on the fact that if it's new, it starts at 1.
        // We want 'quantity'.
        // I'll call updateQuantity(product.id, quantity) right after.
        // Since state updates are async, I hope the second set state sees the first one?
        // In React 18 auto-batching, yes, but they process purely sequentially?
        // `setItems(prev => ...)` queues the update.
        // The second function will effectively see the result of the first if properly queued.
        setTimeout(() => {
          updateQuantity(product.id, quantity);
          if (notes) updateItemNotes(product.id, notes);
        }, 0);
      } else {
        if (notes) setTimeout(() => updateItemNotes(product.id, notes), 0);
      }
      toast.success(`Añadido: ${product.name}`);
    }
  };

  const addCustomItem = () => {
    const tempId = `CUSTOM-${Date.now()}`;
    addItem({
      id: tempId,
      name: customItem.name,
      category: "Personalizado",
      price: 0, // A cotizar
      quantity: customItem.quantity,
      unit: customItem.unit,
      isCustom: true
    });

    if (customItem.notes) {
      setTimeout(() => updateItemNotes(tempId, customItem.notes!), 0);
    }

    setIsCustomDialogOpen(false);
    setCustomItem({ name: "", quantity: 1, unit: "uds", notes: "" });
    toast.success("Producto personalizado añadido");
  };

  // This updateQuantity is now redundant as it's provided by useOrder context.
  // It should be removed or renamed if it's a local helper.
  // Assuming the user meant to use the context's updateQuantity,
  // I will remove this local definition.
  /*
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
    removeItem(productId);
  };

  const orderTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [orderItems]);
  */

  const validationErrors = useMemo(() => {
    const errors: { type: "error" | "warning"; message: string }[] = [];

    orderItems.forEach(item => {
      if (!item.isCustom) {
        if (item.minOrder && item.quantity < item.minOrder) {
          errors.push({
            type: "error",
            message: `${item.name}: Cantidad mínima ${item.minOrder} ${item.unit}`
          });
        }
        if (item.stock !== undefined && item.quantity > item.stock) {
          errors.push({
            type: "error",
            message: `${item.name}: Stock insuficiente (Disponible: ${item.stock})`
          });
        }
      }
    });

    if (orderItems.length > 0 && orderTotal < MINIMUM_ORDER_TOTAL && !orderItems.some(i => i.isCustom)) {
      errors.push({
        type: "warning",
        message: `Pedido mínimo €${MINIMUM_ORDER_TOTAL}`
      });
    }

    return errors;
  }, [orderItems, orderTotal]);

  const hasErrors = validationErrors.some(e => e.type === "error");
  const canProceed = orderItems.length > 0 && !hasErrors && (orderTotal >= MINIMUM_ORDER_TOTAL || orderItems.some(i => i.isCustom));
  const progressPercentage = Math.min((orderTotal / MINIMUM_ORDER_TOTAL) * 100, 100);

  // ─────────────────────────────────────────────────────────────
  // MASTER PANEL: Product Catalog
  // ─────────────────────────────────────────────────────────────
  const masterContent = (
    <div className="flex flex-col h-full">
      {/* LME Price Context */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-500/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-600">Cu</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">LME Cobre</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono font-semibold">${lmeData.price.toLocaleString()}</span>
                <span className={cn(
                  "text-[10px] font-mono flex items-center",
                  lmeData.change > 0 ? "text-green-600" : "text-red-500"
                )}>
                  {lmeData.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {lmeData.change > 0 ? "+" : ""}{lmeData.change}%
                </span>
              </div>
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground">{lmeData.updated}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Item Action */}
      <div className="px-3 py-2 bg-primary/5 border-b flex items-center justify-between">
        <div className="text-xs font-medium text-primary">¿No encuentras lo que buscas?</div>
        <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-primary/20 text-primary hover:bg-primary/10">
              <FileEdit className="h-3.5 w-3.5" />
              Solicitar Personalizado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Artículo Personalizado</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Descripción del Producto</Label>
                <Input
                  id="name"
                  placeholder="Ej: Tubo especial 45mm corte a medida"
                  value={customItem.name}
                  onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={customItem.quantity}
                    onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    placeholder="Ej: metros, piezas, kg"
                    value={customItem.unit}
                    onChange={(e) => setCustomItem({ ...customItem, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Especificaciones técnicas, tolerancias, fecha requerida..."
                  value={customItem.notes}
                  onChange={(e) => setCustomItem({ ...customItem, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addCustomItem} disabled={!customItem.name || customItem.quantity <= 0}>
                Añadir al Pedido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Table */}
      <div className="flex-1 min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Producto</th>
              <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3">Precio</th>
              <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3 w-24">Stock</th>
              <th className="text-center font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const inOrder = orderItems.find(item => item.id === product.id);
              const isOutOfStock = product.stock === 0;

              return (
                <tr
                  key={product.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                    inOrder && "bg-primary/10 border-l-2 border-l-primary",
                    isOutOfStock && "opacity-50"
                  )}
                >
                  <td className="py-2 px-3">
                    <div>
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground">{product.id}</span>
                        <Badge variant="outline" className="text-[9px] h-4 font-normal">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-mono text-xs font-semibold">€{product.price.toFixed(2)}</span>
                      {product.priceChange !== 0 && (
                        <span className={cn(
                          "font-mono text-[9px]",
                          product.priceChange > 0 ? "text-green-600" : "text-red-500"
                        )}>
                          {product.priceChange > 0 ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground">mín. {product.minOrder}</p>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <StockIndicator quantity={product.stock} unit={product.unit} showLabel={false} />
                  </td>
                  <td className="py-2 px-3 text-center">
                    {inOrder ? (
                      <Badge variant="secondary" className="text-[10px]">
                        ×{inOrder.quantity}
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => addToOrder(product, product.minOrder || 1)}
                        disabled={isOutOfStock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t bg-muted/20 text-[10px] text-muted-foreground">
        {filteredProducts.length} productos • {filteredProducts.filter(p => p.stock > 0).length} disponibles
      </div>
    </div >
  );

  // ─────────────────────────────────────────────────────────────
  // DETAIL PANEL: Order Workspace
  // ─────────────────────────────────────────────────────────────
  const detailContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Configurar Pedido</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {orderItems.length === 0
                ? "Selecciona productos del catálogo"
                : `${orderItems.length} producto(s) · ${orderItems.reduce((sum, i) => sum + i.quantity, 0)} unidades`}
            </p>
          </div>
          {orderItems.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold font-mono">
                {orderItems.every(i => !i.isCustom)
                  ? `€${orderTotal.toFixed(2)}`
                  : <span className="text-amber-600 text-lg">A Cotizar</span>}
              </p>
              <p className="text-[10px] text-muted-foreground">IVA no incluido</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {orderItems.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Sin productos seleccionados</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Haz clic en <Plus className="h-3 w-3 inline" /> en el catálogo para añadir
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Items */}
            <DataCard title="Productos Seleccionados" bodyClassName="p-0">
              <div className="divide-y divide-border">
                {orderItems.map(item => {
                  const isCustom = item.isCustom;
                  const hasMinError = !isCustom && item.quantity < (item.minOrder || 1);
                  const hasStockError = !isCustom && item.stock !== undefined && item.quantity > item.stock;
                  const lineTotal = item.quantity * item.price;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-4 p-4 transition-colors",
                        isCustom ? "bg-amber-50/50" : (hasMinError || hasStockError) && "bg-destructive/5"
                      )}
                    >
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {isCustom && (
                          <Badge variant="outline" className="mb-1 text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                            Personalizado
                          </Badge>
                        )}
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-muted-foreground">{item.id}</span>
                          {!isCustom && <span className="text-[11px] text-muted-foreground">€{item.price.toFixed(2)}/{item.unit}</span>}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Nota: {item.notes}
                          </p>
                        )}
                        {hasMinError && (
                          <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Mínimo: {item.minOrder} {item.unit}
                          </p>
                        )}
                        {hasStockError && (
                          <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Stock disponible: {item.stock}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - (isCustom ? 1 : item.minOrder))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="h-8 w-20 text-center font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + (isCustom ? 1 : item.minOrder))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right w-28">
                        {isCustom ? (
                          <p className="text-xs font-medium text-amber-600">A Cotizar</p>
                        ) : (
                          <p className="font-mono font-semibold">€{lineTotal.toFixed(2)}</p>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-6 px-2 mt-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="text-[10px]">Quitar</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DataCard>

            {/* Validation Panel */}
            <div className="grid grid-cols-2 gap-4">
              {/* Progress */}
              <DataCard title="Estado del Pedido" className="col-span-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso Mínimo</span>
                    <span className={cn(
                      "font-mono font-medium",
                      orderItems.some(i => i.isCustom) || orderTotal >= MINIMUM_ORDER_TOTAL ? "text-green-600" : "text-amber-500"
                    )}>
                      {orderItems.some(i => i.isCustom) ? "Personalizado" : `€${orderTotal.toFixed(2)} / €${MINIMUM_ORDER_TOTAL}`}
                    </span>
                  </div>
                  {!orderItems.some(i => i.isCustom) && (
                    <>
                      <Progress value={progressPercentage} className="h-2" />
                      {orderTotal < MINIMUM_ORDER_TOTAL && (
                        <p className="text-[11px] text-amber-600">
                          Faltan €{(MINIMUM_ORDER_TOTAL - orderTotal).toFixed(2)} para el pedido mínimo
                        </p>
                      )}
                    </>
                  )}
                  {(orderTotal >= MINIMUM_ORDER_TOTAL || orderItems.some(i => i.isCustom)) && (
                    <p className="text-[11px] text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Listos para procesar
                    </p>
                  )}
                </div>
              </DataCard>

              {/* Delivery Info */}
              <DataCard title="Información de Entrega" className="col-span-1">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Entrega estándar</p>
                    <p className="text-[11px] text-muted-foreground">3-5 días laborables</p>
                    {orderItems.some(i => i.isCustom) && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">
                        * Ítems personalizados pueden demorar más
                      </p>
                    )}
                  </div>
                </div>
              </DataCard>
            </div>

            {/* Validation Alerts */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
                      error.type === "error"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                    )}
                  >
                    {error.type === "error" ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>{error.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success State */}
            {validationErrors.length === 0 && orderItems.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 text-green-700 border border-green-500/20">
                <CheckCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Configuración válida</p>
                  <p className="text-[11px]">Todo listo para solicitar presupuesto</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {orderItems.length > 0 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Estimado</p>
              <p className="text-2xl font-bold font-mono">
                {orderItems.some(i => i.isCustom) ? "A Cotizar" : `€${orderTotal.toFixed(2)}`}
              </p>
            </div>
            <Button
              size="lg"
              className="px-8"
              disabled={!canProceed}
              onClick={() => navigate("/order/preview")}
            >
              {orderItems.some(i => i.isCustom) ? "Solicitar Presupuesto" : "Revisar Pedido"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <MasterDetailLayout
        master={masterContent}
        detail={detailContent}
        masterDefaultSize={35}
        masterMinSize={25}
        masterMaxSize={45}
        className="h-full"
      />
    </AppLayout>
  );
}
