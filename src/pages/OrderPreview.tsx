import { useLocation, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  FileText,
  Calendar,
  Building,
  Package,
  CheckCircle,
  Printer,
  Truck,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";

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

export default function OrderPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isInterno } = useRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const orderItems: OrderItem[] = location.state?.orderItems || [];
  // Recalculate total or use passed total (custom items might make it partial)
  const hasCustomItems = orderItems.some(i => i.product.isCustom);
  const orderTotal: number = location.state?.orderTotal || 0;

  const orderNumber = `PED-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(hasCustomItems ? "Solicitud enviada correctamente" : "Pedido enviado correctamente", {
        description: `Referencia: ${orderNumber}`,
      });
    }, 1500);
  };

  if (orderItems.length === 0 && !isSubmitted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sin Pedido para Previsualizar</h2>
            <p className="text-muted-foreground mb-4">Por favor, crea un pedido primero</p>
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
              Tu {hasCustomItems ? "solicitud" : "pedido"} <span className="font-mono font-semibold text-foreground">{orderNumber}</span> ha sido {hasCustomItems ? "enviada" : "enviado"} correctamente.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {hasCustomItems
                ? "Revisaremos tu solicitud y te enviaremos un presupuesto formal en breve."
                : "Recibirás una confirmación por email en breve. Nuestro equipo procesará tu pedido en las próximas 24 horas."
              }
            </p>
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
                {hasCustomItems ? "Revisar Solicitud de Presupuesto" : "Vista Previa del Pedido"}
              </h1>
              <p className="text-muted-foreground">Revisa los detalles antes de enviar</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>

        {/* Order Document */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Document Header */}
          <div className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">ENTALPIA Europe</h2>
                  <p className="text-sm text-muted-foreground">
                    {hasCustomItems ? "Solicitud de Presupuesto" : "Orden de Compra"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-lg">{orderNumber}</p>
                <Badge variant="outline" className={hasCustomItems ? "border-amber-500 text-amber-600" : "border-status-low text-status-low"}>
                  {hasCustomItems ? "Pendiente Cotización" : "Borrador"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 grid grid-cols-2 gap-6 border-b border-border">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Cliente</p>
                  <p className="font-medium">{isInterno ? "ENTALPIA Europe" : "Cliente Ejemplo S.L."}</p>
                  <p className="text-sm text-muted-foreground">{isInterno ? "Antonio García" : "Distribuidor Demo"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Fecha</p>
                  <p className="font-medium capitalize">{today}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Entrega Estimada</p>
                  <p className="font-medium">
                    {hasCustomItems ? "A confirmar tras revisión" : "3-5 días laborables"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Artículos
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-left">
                  <th className="py-2 px-3 font-medium text-muted-foreground">Producto</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-center">Cantidad</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">Precio Unitario</th>
                  <th className="py-2 px-3 font-medium text-muted-foreground text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.product.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                    <td className="py-3 px-3">
                      <div>
                        {item.product.isCustom && (
                          <Badge variant="outline" className="mb-1 text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                            Personalizado
                          </Badge>
                        )}
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.product.id}</p>
                        {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5">Nota: {item.notes}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono align-top pt-4">
                      {item.quantity.toLocaleString("es-ES")} {item.product.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono align-top pt-4">
                      {item.product.isCustom ? <span className="text-xs text-muted-foreground">--</span> : `€${item.product.price.toFixed(2)}`}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold align-top pt-4">
                      {item.product.isCustom ? <span className="text-xs text-amber-600">A Cotizar</span> : `€${(item.quantity * item.product.price).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <span className="font-mono text-muted-foreground">A determinar</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Estimado</span>
                  <span className="font-mono">
                    {hasCustomItems ? <span className="text-amber-600 text-base">A Cotizar</span> : `€${orderTotal.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {hasCustomItems
                    ? "* Precio final sujeto a valoración técnica"
                    : "* Precio final confirmado tras aceptación del pedido"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {hasCustomItems
              ? "Al enviar, un agente revisará tu solicitud y te contactará."
              : "Al enviar, aceptas los precios y disponibilidad de stock del día actual."
            }
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Editar {hasCustomItems ? "Solicitud" : "Pedido"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar {hasCustomItems ? "Solicitud" : "Pedido"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
