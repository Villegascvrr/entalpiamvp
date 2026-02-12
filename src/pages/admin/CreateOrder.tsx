import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductSelector } from "@/components/orders/ProductSelector";
import { OrderSummaryPanel } from "@/components/orders/OrderSummaryPanel";
import { ConfirmationModal } from "@/components/orders/ConfirmationModal";
import { OrderSuccess } from "@/components/orders/OrderSuccess";
import { OrderStateHeader } from "@/components/orders/OrderStateHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    ShoppingCart,
    FileSearch,
    Send,
    Lightbulb,
    Info,
    AlertCircle,
    Truck,
    Calendar,
    Mail,
    Box,
    Headset
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AssistedContactDialog } from "@/components/layout/AssistedContactDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useActor } from "@/contexts/ActorContext";
import { useOrder } from "@/contexts/OrderContext";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/data/types";

export default function CreateOrder() {
    const navigate = useNavigate();
    const { hasRole } = useActor();
    const isInterno = hasRole("admin");
    const {
        items,
        currentStep,
        setStep,
        addItem,
        removeItem,
        updateQuantity,
        shippingDetails,
        updateShipping,
        clearOrder
    } = useOrder();

    const backPath = isInterno ? "/admin/orders" : "/orders";
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state for Step 3
    const [copyClient, setCopyClient] = useState(true);
    const [copyInternal, setCopyInternal] = useState(true);
    const [stepTransition, setStepTransition] = useState(false);

    // Animate step transitions
    useEffect(() => {
        setStepTransition(true);
        const timer = setTimeout(() => setStepTransition(false), 300);
        return () => clearTimeout(timer);
    }, [currentStep]);

    const handleConfirm = () => {
        setShowConfirmation(false);
        // Simulate API call
        setTimeout(() => {
            setIsSuccess(true);
            // We don't clear order immediately here to show success state with data if needed, 
            // but usually success screen might need data. 
            // For now let's keep it until user leaves.
        }, 500);
    };

    // Derived total handled in context or here (context has orderTotal)
    // But we need to add tax here if context doesn't have it.
    // Context orderTotal is sum(price*qty).
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.21;

    // ─────────────────────────────────────────────────────────────
    // STEPPER COMPONENT
    // ─────────────────────────────────────────────────────────────
    const steps = [
        { id: 1, label: "Productos", icon: ShoppingCart },
        { id: 2, label: "Revisión", icon: FileSearch },
        { id: 3, label: "Envío", icon: Truck },
        { id: 4, label: "Finalizar", icon: Send },
    ];

    const Stepper = () => (
        <div className="flex items-center gap-4 bg-muted/10 px-6 py-1.5 border-b border-border/50">
            {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                    <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300",
                        currentStep === s.id ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/10" :
                            currentStep > s.id ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                        {currentStep > s.id ? <Check className="h-3 w-3" /> : s.id}
                    </div>
                    <span className={cn(
                        "text-[11px] font-medium uppercase tracking-wider transition-colors",
                        currentStep === s.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {s.label}
                    </span>
                    {i < steps.length - 1 && (
                        <div className="w-8 h-px bg-border mx-2" />
                    )}
                </div>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-[11px] text-primary/80 font-medium animate-pulse">
                <Lightbulb className="h-3.5 w-3.5" />
                {currentStep === 1 && "Consejo: Añade productos para habilitar la revisión"}
                {currentStep === 2 && "Consejo: Verifica las unidades y las condiciones finales"}
                {currentStep === 3 && "Consejo: Configura la fecha y notificaciones"}
            </div>
        </div>
    );

    if (isSuccess) {
        return (
            <AppLayout>
                <div className="flex flex-col h-[calc(100vh-4rem)]">
                    <Stepper />
                    <OrderSuccess
                        onReset={() => {
                            clearOrder();
                            setIsSuccess(false);
                            setStep(1);
                        }}
                        onViewOrders={() => { clearOrder(); navigate(backPath); }}
                        shippingDate={shippingDetails.date}
                        emailClient="usuario.demo@entalpia.com"
                        emailInternal={copyInternal ? "pedidos@entalpia.com" : undefined}
                    />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            {!isSuccess && <OrderStateHeader />}
            <div className="flex flex-col h-[calc(100vh-4rem-3rem)]"> {/* Adjusted height for header */}
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-2 border-b border-border bg-background shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(backPath)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold leading-tight">Nuevo Pedido</h1>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono text-muted-foreground border-dashed">
                                REF: TEMP-{new Date().getFullYear()}-001
                            </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">Flujo asistido de creación de pedido técnico</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <AssistedContactDialog>
                            <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                                <Headset className="h-4 w-4" />
                                <span className="hidden md:inline">Ayuda Comercial</span>
                            </Button>
                        </AssistedContactDialog>
                        {currentStep > 1 && (
                            <Button variant="outline" size="sm" onClick={() => setStep(currentStep - 1)} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Button>
                        )}
                    </div>
                </div>

                <Stepper />

                {/* Content */}
                <div className={cn(
                    "flex flex-1 overflow-hidden relative transition-opacity duration-300",
                    stepTransition ? "opacity-0" : "opacity-100"
                )}>
                    {currentStep === 1 && (
                        <>
                            <div className="flex-1 overflow-hidden relative">
                                <ProductSelector
                                    onSelectProduct={addItem}
                                    selectedItems={items}
                                    onUpdateQuantity={updateQuantity}
                                />
                            </div>
                            <div className="w-[400px] shrink-0 overflow-hidden border-l border-border bg-card z-10 flex flex-col">
                                <OrderSummaryPanel
                                    items={items}
                                    onRemoveItem={removeItem}
                                    onUpdateQuantity={updateQuantity}
                                    onProceed={() => setStep(2)}
                                />
                                {items.length > 0 && (
                                    <div className="p-3 bg-primary/5 border-t border-primary/10 text-center">
                                        <p className="text-[10px] text-primary/80 font-medium">
                                            ¿Has terminado? Pulsa "Revisar Pedido" para continuar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <div className="flex-1 overflow-auto bg-muted/30 p-8 flex justify-center">
                            <div className="max-w-6xl w-full space-y-6">
                                <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">

                                    {/* LEFT: Technical Table */}
                                    <div className="flex-1 border-r border-border">
                                        <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                    <FileSearch className="h-5 w-5 text-primary" />
                                                    Revisión Técnica del Pedido
                                                </h2>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Verifica los detalles técnicos antes de procesar la solicitud.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-0 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-border bg-muted/20">
                                                        <th className="text-left py-3 px-4 font-mono font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Ref.</th>
                                                        <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Producto / Descripción</th>
                                                        <th className="text-center py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground w-28">Cantidad</th>
                                                        <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground w-32">P. Unit.</th>
                                                        <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground w-32">Total Línea</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {items.map(item => (
                                                        <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                                                            <td className="py-4 px-4 font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                                                {item.id}
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <span className="font-semibold text-foreground text-xs md:text-sm">{item.name}</span>
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <Badge variant="secondary" className="font-mono text-xs font-normal bg-muted border-border">
                                                                    {item.quantity} {item.unit}s
                                                                </Badge>
                                                            </td>
                                                            <td className="py-4 px-4 text-right font-mono text-xs text-muted-foreground">
                                                                €{item.price.toFixed(2)}
                                                            </td>
                                                            <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                                                                €{(item.price * item.quantity).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* RIGHT: Industrial Summary Panel */}
                                    <div className="w-full md:w-80 bg-muted/10 flex flex-col shrink-0">
                                        <div className="p-6 space-y-6 flex-1">
                                            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                                                <Info className="h-4 w-4" /> Resumen Global
                                            </h3>

                                            {/* Key Metrics */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Nº Productos</span>
                                                    <span className="font-mono font-medium">{items.length} líneas</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Total Unidades</span>
                                                    <span className="font-mono font-medium">
                                                        {items.reduce((acc, item) => acc + item.quantity, 0)} uds
                                                    </span>
                                                </div>
                                                <Separator className="bg-border/50" />
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span className="font-mono">€{(total / 1.21).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">IVA (21%)</span>
                                                    <span className="font-mono text-xs text-muted-foreground">€{(total - (total / 1.21)).toFixed(2)}</span>
                                                </div>
                                                <div className="pt-2 flex justify-between items-end">
                                                    <span className="font-bold text-lg">Total Pedido</span>
                                                    <span className="font-mono text-xl font-bold text-primary">€{total.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* Simulated Industrial Alerts */}
                                            <div className="space-y-2 mt-6">
                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-2.5 flex gap-2.5 items-start">
                                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Peso Estimado</p>
                                                        <p className="text-xs text-amber-900/80">
                                                            ~145 kg total. Requiere paletizado europeo.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-2.5 flex gap-2.5 items-start">
                                                    <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Stock Reservado</p>
                                                        <p className="text-xs text-blue-900/80">
                                                            Material bloqueado por 24h.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="p-6 bg-background border-t border-border space-y-3">
                                            <Button
                                                className="w-full gap-2 shadow-md font-bold"
                                                size="lg"
                                                onClick={() => setStep(currentStep + 1)}
                                            >
                                                Continuar
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full text-muted-foreground hover:text-foreground"
                                                onClick={() => setStep(1)}
                                            >
                                                Volver a editar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="flex-1 overflow-auto bg-muted/30 p-8 flex justify-center animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="max-w-2xl w-full space-y-6">
                                {/* Shipping & Communication Config Card */}
                                <div className="bg-background rounded-xl border border-border shadow-sm p-0 overflow-hidden">
                                    <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-primary" />
                                                Configuración de Envío y Notificaciones
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Define la fecha de salida y los destinatarios de la confirmación.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        {/* Shipping Date Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center border border-blue-200">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <h3 className="font-semibold text-sm uppercase tracking-wide">Fecha de Envío Solicitada</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fecha de Entrega Solicitada</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="date"
                                                        className="pl-9"
                                                        value={shippingDetails.date}
                                                        onChange={(e) => updateShipping({ date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Incoterm Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-orange-100/50 text-orange-600 flex items-center justify-center border border-orange-200">
                                                    <Box className="h-4 w-4" />
                                                </div>
                                                <h3 className="font-semibold text-sm uppercase tracking-wide">Condiciones de Entrega</h3>
                                            </div>
                                            <div className="pl-11">
                                                <div className="p-3 bg-muted/30 rounded border border-border flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium">Incoterm Seleccionado</p>
                                                        <p className="text-xs text-muted-foreground">Según contrato marco 2024</p>
                                                    </div>
                                                    <Badge variant="outline" className="font-mono bg-background">FOB</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="bg-border/50" />

                                        {/* Email Config Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-purple-100/50 text-purple-600 flex items-center justify-center border border-purple-200">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <h3 className="font-semibold text-sm uppercase tracking-wide">Comunicaciones y Avisos</h3>
                                            </div>

                                            <div className="grid gap-5 pl-11">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email-main">Email Principal (Usuario Actual)</Label>
                                                    <Input id="email-main" value="usuario.demo@entalpia.com" disabled className="bg-muted/50" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email-cc">Copia (CC)</Label>
                                                        <Input id="email-cc" placeholder="jefe.compras@empresa.com" />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email-internal">Copia Interna (Logística)</Label>
                                                        <Input id="email-internal" placeholder="logistica@entalpia.com" value="pedidos@entalpia.com" disabled={!copyInternal} className={cn(!copyInternal && "opacity-50")} />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="check-client" checked={copyClient} onCheckedChange={(c) => setCopyClient(c === true)} />
                                                        <label
                                                            htmlFor="check-client"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            Enviar copia de confirmación al cliente
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="check-internal" checked={copyInternal} onCheckedChange={(c) => setCopyInternal(c === true)} />
                                                        <label
                                                            htmlFor="check-internal"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            Enviar copia al departamento de logística (interna)
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="bg-muted/10 px-8 py-6 border-t border-border flex justify-between items-center">
                                        <div className="text-xs text-muted-foreground w-1/2">
                                            Al enviar, confirmas que los datos de envío y facturación asociados a tu cuenta son correctos.
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="ghost" onClick={() => setStep(2)}>
                                                Volver
                                            </Button>
                                            <Button
                                                size="lg"
                                                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20"
                                                onClick={() => setShowConfirmation(true)}
                                            >
                                                <Send className="mr-2 h-4 w-4" />
                                                Enviar Pedido
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <ConfirmationModal
                    open={showConfirmation}
                    onOpenChange={setShowConfirmation}
                    onConfirm={() => {
                        setStep(4);
                        handleConfirm();
                    }}
                    total={total}
                />
            </div>
        </AppLayout>
    );
}
