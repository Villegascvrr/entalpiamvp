import { Button } from "@/components/ui/button";
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
        <div className="flex flex-col h-full bg-card border-l border-border shadow-xl w-full max-w-sm">
            <div className="p-4 border-b border-border bg-muted/20">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Resumen del Pedido
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Borrador actual • {items.length} líneas
                </p>
            </div>

            <ScrollArea className="flex-1 p-4">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-50 py-12">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                        </div>
                        <p className="text-sm">No hay artículos seleccionados</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-3 items-start group">
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0 text-xs font-mono text-muted-foreground">
                                    IMG
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate mb-1.5" title={item.name}>
                                        {item.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono mb-2">
                                        {item.id} • €{item.price.toFixed(2)}/{item.unit}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            className="h-7 w-20 text-xs font-mono"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                                        />
                                        <span className="text-xs text-muted-foreground">{item.unit}s</span>
                                        <div className="ml-auto font-mono text-sm font-semibold">
                                            €{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute right-4"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-mono">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>IVA (21%)</span>
                        <span className="font-mono">€{tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="font-mono">€{total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Info Trigger */}
                <div className="flex gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full text-xs text-muted-foreground h-8">
                                <AlertTriangle className="h-3 w-3 mr-1.5" />
                                Condiciones
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
                                <div className="p-3 bg-muted rounded-lg border-l-4 border-destructive">
                                    <h4 className="font-semibold mb-1 text-foreground">Cancelación</h4>
                                    <p>Una vez que el pedido pase a estado "Procesando", no se podrá cancelar de forma automática. Contacte con soporte técnico para modificaciones.</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-1 text-foreground">Soporte Técnico</h4>
                                    <p>Asesoramiento disponible para la selección de diámetros y especificaciones ASTM/EN de 08:00 a 18:00.</p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <Button
                    className={cn(
                        "w-full gap-2 transition-all duration-300 shadow-md",
                        items.length > 0 ? "animate-in fade-in zoom-in-95 duration-500 bg-primary hover:shadow-lg" : ""
                    )}
                    size="lg"
                    disabled={items.length === 0}
                    onClick={onProceed}
                >
                    {items.length > 0 ? "Siguiente: Revisar Pedido" : "Revisar Pedido"}
                    <ChevronRight className={cn("h-4 w-4", items.length > 0 && "animate-bounce-x")} />
                </Button>
            </div>
        </div>
    );
}
