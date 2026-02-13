import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, ChevronRight, FileText, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import type { OrderItem } from "@/data/types";

interface OrderSummaryPanelProps {
    items: OrderItem[];
    onRemoveItem: (id: string) => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onProceed: () => void;
}

export function OrderSummaryPanel({ items, onRemoveItem, onUpdateQuantity, onProceed }: OrderSummaryPanelProps) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.21;
    const total = subtotal + tax;

    return (
        <div className="flex flex-col h-full w-full max-h-full overflow-hidden bg-card border-l border-border shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h2 className="font-bold text-sm uppercase tracking-tight">Resumen</h2>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono h-5 px-1.5 border-dashed">
                    {items.length} ITEMS
                </Badge>
            </div>

            {/* Scrollable Items List */}
            <ScrollArea className="flex-1 bg-background">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 opacity-40">
                        <div className="h-16 w-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold uppercase tracking-wider">Sin Artículos</p>
                            <p className="text-xs">Añade productos del catálogo.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {items.map(item => (
                            <div key={item.id} className="p-3 hover:bg-muted/10 transition-colors group relative">
                                <div className="flex gap-3">
                                    {/* Tiny Thumbnail */}
                                    <div className="h-10 w-10 bg-muted/50 rounded border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                        <span className="text-[8px] font-mono text-muted-foreground/50">IMG</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs font-semibold leading-tight line-clamp-2" title={item.name}>
                                                {item.name}
                                            </span>
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex items-end justify-between mt-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center border border-border rounded-sm h-6 bg-muted/20">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        className="h-full w-10 text-[10px] font-mono text-center border-none bg-transparent p-0 focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={item.quantity}
                                                        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                                <span className="text-[9px] text-muted-foreground font-medium uppercase">{item.unit}</span>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-foreground">
                                                €{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer Totals & Actions */}
            <div className="p-4 border-t border-border bg-muted/10 shrink-0 space-y-3">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Base Imponible</span>
                        <span className="font-mono">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>IVA (21%)</span>
                        <span className="font-mono">€{tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-1.5" />
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold uppercase tracking-tight">Total Est.</span>
                        <span className="font-mono text-lg font-black text-primary">€{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="pt-1 space-y-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Ver Condiciones Comerciales
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Condiciones de Compra</SheetTitle>
                                <SheetDescription>
                                    Información aplicable a este pedido.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-4 space-y-4 text-sm text-foreground/80">
                                <div className="p-3 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-1 text-foreground">Plazos de Entrega</h4>
                                    <p>Pedidos confirmados antes de las 13:00 se envían el mismo día. Entregas estándar en 24-48h.</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-1 text-foreground">Política de Devoluciones</h4>
                                    <p>Se aceptan devoluciones de material no utilizado en su embalaje original hasta 30 días después de la entrega. Sujeto a cargo de gestión del 10%.</p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Button
                        className={cn(
                            "w-full h-10 font-bold uppercase tracking-wide gap-2 shadow-md transition-all duration-300",
                            items.length > 0 ? "bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.01]" : "opacity-50 cursor-not-allowed"
                        )}
                        disabled={items.length === 0}
                        onClick={onProceed}
                    >
                        Revisar Pedido
                        <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
