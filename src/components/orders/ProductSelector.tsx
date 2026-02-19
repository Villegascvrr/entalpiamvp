import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product } from "@/data/types";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Layers,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  Thermometer,
  Trash2,
  Wind,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void;
  selectedItems: { id: string; quantity: number }[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  initialCategory?: string | null;
}

const ICON_MAP: Record<string, any> = {
  Thermometer,
  Layers,
  Wind,
  Zap,
};

export function ProductSelector({
  onSelectProduct,
  selectedItems,
  onUpdateQuantity,
  initialCategory,
}: ProductSelectorProps) {
  const { products, categories: hookCategories } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory || null,
  );
  const [infoCategory, setInfoCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Build category map from hook data
  const CATEGORY_MAP: Record<
    string,
    {
      label: string;
      icon: any;
      image?: string;
      description: string;
      detailedText?: string;
    }
  > = Object.fromEntries(
    hookCategories.map((c) => [
      c.id,
      {
        label: c.label,
        icon: ICON_MAP[c.iconKey] || Package,
        description: c.description,
        image: c.image,
        detailedText: c.detailedText,
      },
    ]),
  );

  // Simulate loading transition when switching categories
  useEffect(() => {
    if (activeCategory) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [activeCategory]);

  // Update active category if prop changes (deep linking)
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory
      ? p.category === activeCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-background border-r border-border/50">
      {!activeCategory ? (
        /* ─────────────────────────────────────────────────────────────
                   CATEGORY SELECTION VIEW (Step 1 of Catalog)
                   ───────────────────────────────────────────────────────────── */
        <ScrollArea className="flex-1 bg-muted/5 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div>
                <h2 className="text-xl font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Catálogo de Productos
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecciona una categoría para explorar referencias.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const info = CATEGORY_MAP[cat] || {
                  label: cat,
                  icon: Package,
                  description: "Catálogo completo",
                };
                const Icon = info.icon;
                const count = products.filter((p) => p.category === cat).length;

                return (
                  <div
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="group relative flex flex-col border border-border rounded-xl bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden h-64"
                  >
                    {/* Large Image Area (60%) */}
                    <div className="h-[60%] w-full bg-muted relative overflow-hidden">
                      {info.image ? (
                        <>
                          <img
                            src={info.image}
                            alt={info.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                          <Icon className="h-16 w-16 text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
                        </div>
                      )}

                      {/* Floating Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur-sm text-xs font-bold px-2.5 h-6 shadow-sm"
                        >
                          {count} Refs
                        </Badge>
                      </div>

                      {/* Text Overlay (Bottom Left) */}
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md group-hover:text-primary-foreground transition-colors">
                          {info.label}
                        </h3>
                      </div>
                    </div>

                    {/* Bottom Content (40%) */}
                    <div className="flex-1 p-4 bg-card flex flex-col justify-between relative group-hover:bg-muted/5 transition-colors">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {info.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                          Explorar
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>

                        {info.detailedText && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 -mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInfoCategory(cat);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      ) : (
        /* ─────────────────────────────────────────────────────────────
                   PRODUCT SELECTION VIEW (Step 2 of Catalog)
                   ───────────────────────────────────────────────────────────── */
        <>
          {/* Header with Search & Back */}
          <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20 space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="h-8 gap-1.5 px-2 hover:bg-primary/10 hover:text-primary -ml-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Volver
                </span>
              </Button>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/20"
                >
                  {CATEGORY_MAP[activeCategory]?.label || activeCategory}
                </Badge>
                {!isLoading && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-mono tabular-nums h-5"
                  >
                    {filteredProducts.length} ref.
                  </Badge>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar en ${activeCategory}...`}
                className="pl-9 bg-muted/30 border-muted-foreground/20 h-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Product Grid */}
          <ScrollArea className="flex-1 p-4 bg-muted/5">
            {isLoading ? (
              /* Skeleton Loading Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 animate-in fade-in duration-200">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col border rounded-lg bg-card overflow-hidden"
                  >
                    <Skeleton className="aspect-[16/10] w-full rounded-none" />
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="pt-2 border-t border-border/30 flex justify-between items-center">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/50 animate-in fade-in duration-500">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {searchQuery
                    ? "No se encontraron resultados"
                    : "No hay productos disponibles"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                  {searchQuery
                    ? `No hay coincidencias para "${searchQuery}" en esta categoría.`
                    : "Esta categoría no tiene referencias activas en este momento."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 gap-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const selectedItem = selectedItems.find(
                    (i) => i.id === product.id,
                  );
                  const isSelected = !!selectedItem;

                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "group relative flex flex-col border rounded-lg bg-card transition-all duration-200 overflow-hidden cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:shadow-md",
                      )}
                      onClick={() => !isSelected && onSelectProduct(product)}
                    >
                      {/* Selection Indicator Badge */}
                      {isSelected && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 right-0 p-1.5 z-20 animate-in zoom-in-50 duration-300 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateQuantity(product.id, 0);
                                }}
                              >
                                <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-sm hover:bg-destructive transition-colors group/check">
                                  <CheckCircle2 className="h-4 w-4 group-hover/check:hidden" />
                                  <Trash2 className="h-4 w-4 hidden group-hover/check:block" />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="text-xs max-w-[200px] bg-card border shadow-lg"
                            >
                              <p className="font-semibold text-destructive">
                                Quitar del pedido
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* 1) Large Product Image Area (Industrial View) */}
                      <div className="aspect-[16/10] bg-white relative flex items-center justify-center border-b border-border/50 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500">
                            <Package className="h-12 w-12" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              Image Placeholder
                            </span>
                          </div>
                        )}

                        {/* Industrial Detail Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

                        {/* Detail Action "Ver Detalles" */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-[10px] font-bold uppercase tracking-wider bg-background/90 backdrop-blur-sm border shadow-sm flex items-center gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Detail logic would go here if needed
                            }}
                          >
                            <Eye className="h-3 w-3 text-primary" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1 gap-3">
                        {/* Reference Code & Specs Popover */}
                        <div className="flex justify-between items-center h-5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-mono px-1.5 py-0 h-4 border-none uppercase tracking-tighter",
                              isSelected
                                ? "text-primary/90 bg-primary/10"
                                : "text-muted-foreground bg-muted",
                            )}
                          >
                            {product.id}
                          </Badge>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground/50 hover:text-primary transition-colors hover:bg-primary/5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="text-xs max-w-[200px] bg-card border shadow-lg p-2.5"
                              >
                                <p className="font-bold mb-1.5 text-primary text-[10px] uppercase tracking-wider">
                                  Especificaciones Técnicas
                                </p>
                                <p className="text-muted-foreground leading-relaxed">
                                  {product.specs}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* Product Name */}
                        <h3
                          className={cn(
                            "font-bold text-sm leading-tight line-clamp-2 transition-colors",
                            isSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {product.name}
                        </h3>

                        {/* Price and Add/Controls Row */}
                        <div className="mt-auto pt-2 border-t border-border/30">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-1">
                                <span className="font-mono font-black text-lg text-foreground tracking-tighter tabular-nums">
                                  €{product.price.toFixed(2)}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                  /{product.unit}
                                </span>
                              </div>
                            </div>

                            {/* Selection / Quantity Controls */}
                            {isSelected ? (
                              <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2 duration-300">
                                <div className="flex items-center bg-primary/5 border border-primary/20 rounded-md p-0.5 shadow-sm transition-all h-8">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-7 w-7 rounded-sm transition-colors text-muted-foreground",
                                      selectedItem.quantity === 1
                                        ? "hover:bg-red-50 hover:text-red-600"
                                        : "hover:bg-background hover:text-foreground",
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateQuantity(
                                        product.id,
                                        selectedItem.quantity - 1,
                                      );
                                    }}
                                  >
                                    {selectedItem.quantity === 1 ? (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    ) : (
                                      <Minus className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <span className="font-mono text-sm font-bold w-7 text-center text-primary tabular-nums">
                                    {selectedItem.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-sm hover:bg-background hover:text-foreground text-muted-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateQuantity(
                                        product.id,
                                        selectedItem.quantity + 1,
                                      );
                                    }}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="h-8 px-3 gap-1.5 rounded-md shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold opacity-90 hover:opacity-100 group/add"
                              >
                                <Plus className="h-3.5 w-3.5 group-hover/add:rotate-90 transition-transform" />
                                <span className="text-xs">AÑADIR</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* Category Detail Modal */}
      <Dialog
        open={!!infoCategory}
        onOpenChange={(open) => !open && setInfoCategory(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-xl font-bold">
              {infoCategory && CATEGORY_MAP[infoCategory]?.label}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Especificaciones y Compromiso de Calidad
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
            <div className="space-y-6 pb-6">
              <div className="aspect-video rounded-xl overflow-hidden border bg-muted shrink-0 shadow-inner">
                {infoCategory && CATEGORY_MAP[infoCategory]?.image && (
                  <img
                    src={CATEGORY_MAP[infoCategory].image}
                    alt={infoCategory}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                  {infoCategory && CATEGORY_MAP[infoCategory]?.detailedText}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border border-border flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-[10px] text-muted-foreground font-medium">
                  Todos los productos en esta categoría cumplen con los
                  estándares de seguridad industrial y normativas europeas
                  vigentes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end p-6 pt-2 border-t bg-card shrink-0">
            <Button
              onClick={() => {
                const cat = infoCategory;
                setInfoCategory(null);
                if (cat) setActiveCategory(cat);
              }}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Ver Productos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
