import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Building,
  Building2,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Printer,
  Receipt,
  Scale,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// import { useRole } from "@/contexts/RoleContext"; // Replaced by useActor
import { useActor } from "@/contexts/ActorContext";

interface OrderItem {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    isCustom?: boolean;
  };
  quantity: number;
  notes?: string;
}

import { OrderStateHeader } from "@/components/orders/OrderStateHeader";
import { useOrder } from "@/contexts/OrderContext";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";

export default function OrderPreview() {
  const navigate = useNavigate();
  const { session, hasRole } = useActor();
  const {
    items,
    orderTotal,
    clearOrder,
    orderReference,
    clientName,
    commercialName,
    orderStatus,
    submitOrder,
  } = useOrder();
  const { createOrder } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived state from global status
  const isSubmitted = orderStatus !== "draft";

  // Permission check
  const canValidate = hasRole(["admin", "commercial"]); // Example permission gate

  // We use items from context directly
  const orderItems = items;
  const hasCustomItems = orderItems.some((i) => i.isCustom);
  // orderTotal is from context

  // Used from context now
  const orderNumber = orderReference;

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Pass the real repository write function as the persist callback
      const result = await submitOrder(createOrder);

      if (result) {
        toast.success(
          hasCustomItems
            ? "Solicitud enviada correctamente"
            : "Pedido enviado correctamente",
          {
            description: `Referencia: ${result.id}`,
          },
        );
      } else {
        toast.success(
          hasCustomItems
            ? "Solicitud enviada correctamente"
            : "Pedido enviado correctamente",
          {
            description: `Referencia: ${orderNumber}`,
          },
        );
      }
    } catch (err: any) {
      toast.error("Error al enviar pedido", {
        description: err.message || "Inténtalo de nuevo",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderItems.length === 0 && !isSubmitted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Sin Pedido para Previsualizar
            </h2>
            <p className="text-muted-foreground mb-4">
              Por favor, crea un pedido primero
            </p>
            <Link to="/order/new">
              <Button>Crear Nuevo Pedido</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 rounded-full bg-status-available/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-status-available" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {hasCustomItems ? "¡Solicitud Enviada!" : "¡Pedido Enviado!"}
            </h2>
            <p className="text-muted-foreground mb-2">
              Tu {hasCustomItems ? "solicitud" : "pedido"}{" "}
              <span className="font-mono font-semibold text-foreground">
                {orderNumber}
              </span>{" "}
              ha sido {hasCustomItems ? "enviada" : "enviado"} correctamente.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {hasCustomItems
                ? "Revisaremos tu solicitud y te enviaremos un presupuesto formal en breve."
                : "Recibirás una confirmación por email en breve. Nuestro equipo procesará tu pedido en las próximas 24 horas."}
            </p>
            <div className="bg-muted/30 rounded-lg p-6 mb-6 text-left space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <span className="font-medium">Pedido registrado</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-3 w-3" />
                </div>
                <span className="font-medium">Confirmación generada</span>
              </div>
              <div className="flex items-center gap-3 text-sm opacity-50">
                <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center"></div>
                <span>Albarán preparado</span>
              </div>
              <div className="flex items-center gap-3 text-sm opacity-50">
                <div className="h-5 w-5 rounded-full border border-muted-foreground/30 flex items-center justify-center"></div>
                <span>Aviso de envío enviado</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link to="/orders">
                <Button variant="outline">Ver Mis Pedidos</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Volver al Panel</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {!isSubmitted && <OrderStateHeader />}
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {hasCustomItems
                  ? "Revisar Solicitud de Presupuesto"
                  : "Vista Previa del Pedido"}
              </h1>
              <p className="text-muted-foreground">
                Revisa los detalles antes de enviar
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>

        {/* Order Document */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Order Identity & Documents Zone */}
          <div className="border-b border-border bg-muted/20">
            {/* Zone 1: Order Identity (PEDIDO) */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Proveedor (Nosotros)
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg">
                    {hasRole(["admin", "commercial"])
                      ? "ENTALPIA Europe"
                      : "ENTALPIA Europe"}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <p>Pol. Ind. Example, Calle A, 123</p>
                    <p>28000 Madrid, España</p>
                    <p>Tlf: +34 91 123 45 67</p>
                    <p>VAT: ES-B12345678</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Pedido (Entidad Principal)
                    </span>
                  </div>
                  <h2 className="text-2xl font-mono font-bold text-foreground">
                    {orderNumber}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" />
                      <span>{clientName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{commercialName}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    hasCustomItems
                      ? "border-amber-500 text-amber-600 h-7 px-3"
                      : "border-status-low text-status-low h-7 px-3"
                  }
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                  {hasCustomItems ? "Pendiente Cotización" : "Borrador"}
                </Badge>
              </div>
            </div>

            {/* Zone 2: Derived Documents (DOCUMENTOS) */}
            <div className="p-6 bg-background/50">
              <div className="mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos Derivados
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cada documento se genera automáticamente según el estado del
                  pedido
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Card 1: Confirmation */}
                <div
                  className={cn(
                    "relative group border rounded-lg p-4 transition-all cursor-pointer",
                    isSubmitted
                      ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                      : "border-dashed border-border bg-muted/30 opacity-70",
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={cn(
                        "p-2 rounded border shadow-sm",
                        isSubmitted
                          ? "bg-background border-border"
                          : "bg-muted border-border",
                      )}
                    >
                      <FileText
                        className={cn(
                          "h-5 w-5",
                          isSubmitted
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <Badge
                      variant={isSubmitted ? "secondary" : "outline"}
                      className={cn(
                        "text-[10px] shadow-none",
                        isSubmitted
                          ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {isSubmitted ? "Generado" : "Borrador"}
                    </Badge>
                  </div>
                  <p
                    className={cn(
                      "font-medium text-sm",
                      !isSubmitted && "text-muted-foreground",
                    )}
                  >
                    Confirmación Pedido
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isSubmitted ? `Creado: ${today}` : "Pendiente de envío"}
                  </p>
                </div>

                {/* Card 2: Albaran */}
                <div className="relative border border-dashed border-border bg-muted/30 rounded-lg p-4 opacity-70">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded bg-muted border border-border">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border text-muted-foreground shadow-none"
                    >
                      Pendiente
                    </Badge>
                  </div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Albarán de Entrega
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    --/--/----
                  </p>
                </div>

                {/* Card 3: Invoice */}
                <div className="relative border border-dashed border-border bg-muted/30 rounded-lg p-4 opacity-70">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 rounded bg-muted border border-border">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border text-muted-foreground shadow-none"
                    >
                      No generada
                    </Badge>
                  </div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Factura Comercial
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    --/--/----
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline - Lifecycle */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-muted-foreground relative">
              {/* Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10"></div>

              {/* Steps */}
              {[
                "draft",
                "pending_validation",
                "confirmed",
                "preparing",
                "shipped",
              ].map((step, index) => {
                // Simple mapping for display labels
                const labels: Record<string, string> = {
                  draft: "Borrador",
                  pending_validation: "En Validación",
                  confirmed: "Confirmado",
                  preparing: "Preparación",
                  shipped: "Enviado",
                };

                // Determine if active or completed
                // Status order: draft -> pending_validation -> confirmed -> preparing -> shipped
                const steps = [
                  "draft",
                  "pending_validation",
                  "confirmed",
                  "preparing",
                  "shipped",
                ];
                const currentIndex = steps.indexOf(orderStatus);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={step}
                    className={cn(
                      "flex flex-col items-center gap-1 bg-background px-2 z-10 transition-colors duration-300",
                      isCompleted ? "text-primary" : "text-muted-foreground/50",
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full ring-4 ring-background transition-colors duration-300",
                        isCurrent
                          ? "bg-primary ring-primary/20"
                          : isCompleted
                            ? "bg-primary"
                            : "bg-muted",
                      )}
                    ></div>
                    <span>{labels[step]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Split: Commercial vs Logistics */}
          <div className="grid grid-cols-2 border-b border-border">
            {/* Commercial Data */}
            <div className="p-6 border-r border-border space-y-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary uppercase tracking-wide">
                <FileText className="h-4 w-4" />
                Datos Comerciales
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">
                    {hasRole("admin")
                      ? "ENTALPIA Europe"
                      : "Cliente Ejemplo S.L."}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Comercial Asignado
                  </p>
                  <p className="text-sm font-medium">Antonio García</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Condiciones Generales
                  </p>
                  <p className="text-sm font-medium">Pago a 60 días f.f.</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Validez Cotización
                  </p>
                  <p className="text-sm font-medium text-amber-600">
                    Viernes 17:00
                  </p>
                </div>
              </div>
            </div>

            {/* Logistics Data */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                <Truck className="h-4 w-4" />
                Datos Logísticos
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Fecha de Envío Solicitada
                  </p>
                  <p className="text-sm font-medium capitalize">{today}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Incoterm</p>
                  <Badge variant="outline" className="font-mono text-xs mt-0.5">
                    FOB (Barcelona)
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Email Logística
                  </p>
                  <p className="text-sm font-medium">logistica@ejemplo.com</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Dirección de Entrega
                  </p>
                  <p className="text-sm font-medium text-muted-foreground italic">
                    C/ Industria 44, Nave 2 (Pol. Ind. Sur)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Banner */}
          {!isSubmitted && (
            <div className="mx-6 mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-md flex items-center gap-2 text-sm text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Cotización válida hasta:</span>{" "}
              Viernes 17:00
            </div>
          )}

          {/* Line Items */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Artículos
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-left">
                  <th className="py-2 px-3 font-medium text-muted-foreground">
                    Producto
                  </th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-center">
                    Cantidad
                  </th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">
                    Precio Unitario
                  </th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/5"
                  >
                    <td className="py-3 px-3">
                      <div>
                        {item.isCustom && (
                          <Badge
                            variant="outline"
                            className="mb-1 text-[10px] border-amber-200 text-amber-700 bg-amber-50"
                          >
                            Personalizado
                          </Badge>
                        )}
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.id}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">
                            Nota: {item.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono align-top pt-4">
                      {item.quantity.toLocaleString("es-ES")} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono align-top pt-4">
                      {item.isCustom ? (
                        <span className="text-xs text-muted-foreground">
                          --
                        </span>
                      ) : (
                        `€${item.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold align-top pt-4">
                      {item.isCustom ? (
                        <span className="text-xs text-amber-600">
                          A Cotizar
                        </span>
                      ) : (
                        `€${(item.quantity * item.price).toFixed(2)}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weight Placeholder */}
          <div className="px-6 py-3 border-b border-border bg-muted/5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span>Peso estimado (según configuración de contenedor)</span>
            </div>
            <span className="font-mono text-muted-foreground italic">
              Se calculará automáticamente
            </span>
          </div>

          {/* Totals */}
          <div className="p-6 bg-muted/20">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">
                    {hasCustomItems ? "--" : `€${orderTotal.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transporte</span>
                  <span className="font-mono text-muted-foreground">
                    A determinar
                  </span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Estimado</span>
                  <span className="font-mono">
                    {hasCustomItems ? (
                      <span className="text-amber-600 text-base">
                        A Cotizar
                      </span>
                    ) : (
                      `€${orderTotal.toFixed(2)}`
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {hasCustomItems
                    ? "* Precio final sujeto a valoración técnica"
                    : "* Precio final confirmado tras aceptación del pedido"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting || isSubmitted}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a editar
        </Button>
        <div className="flex gap-3">
          {/* Simulation of Internal Validation Step */}
          {isSubmitted &&
            canValidate &&
            orderStatus === "pending_validation" && (
              <Button
                variant="secondary"
                onClick={() => toast.info("Simulación: Pedido Validado")}
              >
                <Check className="h-4 w-4 mr-2" />
                Validar Pedido
              </Button>
            )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitted || items.length === 0}
            className={cn(
              "min-w-[150px]",
              isSubmitted && "bg-green-600 hover:bg-green-700",
            )}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : isSubmitted ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Enviado
              </>
            ) : (
              <>
                Enviar Pedido
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
