import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  LayoutDashboard,
  Mail,
  PlusCircle,
} from "lucide-react";

interface OrderSuccessProps {
  onReset: () => void;
  onViewOrders: () => void;
  shippingDate?: string;
  emailClient?: string;
  emailInternal?: string;
}

export function OrderSuccess({
  onReset,
  onViewOrders,
  shippingDate = new Date().toISOString().split("T")[0],
  emailClient = "usuario.demo@entalpia.com",
  emailInternal = "pedidos@entalpia.com",
}: OrderSuccessProps) {
  const fakeOrderId = `ENT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in zoom-in duration-500 bg-muted/30">
      <div className="max-w-3xl w-full bg-background rounded-xl border border-border shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Success Message & Summary */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center border-r border-border">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pedido enviado correctamente
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            La solicitud ha sido procesada con éxito y se ha iniciado el flujo
            de preparación.
          </p>

          <div className="w-full bg-muted/20 rounded-lg p-5 text-left border border-border/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Referencia
              </span>
              <Badge
                variant="outline"
                className="font-mono text-sm bg-background px-3 py-1 border-primary/20 text-primary"
              >
                {fakeOrderId}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Fecha de Envío Estimada
                </span>
              </div>
              <span className="text-sm font-medium">{shippingDate}</span>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Notificaciones enviadas a:
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {emailClient}
                  </span>
                  {emailInternal && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {emailInternal}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operational Status Checklist */}
        <div className="w-full md:w-80 bg-muted/5 p-8 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Estado Operativo
          </h3>

          <div className="space-y-6 flex-1">
            {[
              { label: "Pedido registrado en sistema", status: "completed" },
              { label: "Documento de albarán generado", status: "completed" },
              { label: "Copia enviada al cliente", status: "completed" },
              { label: "Copia enviada a logística", status: "completed" },
              { label: "Orden de preparación emitida", status: "pending" },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-3 relative">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full border ${step.status === "completed" ? "bg-green-500 border-green-500 text-white" : "bg-background border-border text-muted-foreground"} z-10 shrink-0`}
                >
                  {step.status === "completed" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  )}
                </div>
                {idx < 4 && (
                  <div className="absolute left-3 top-6 w-px h-full bg-border/50 -ml-px" />
                )}
                <span
                  className={`text-sm ${step.status === "completed" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full gap-2 font-bold shadow-sm"
              onClick={onViewOrders}
            >
              <LayoutDashboard className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onReset}
            >
              <PlusCircle className="h-4 w-4" />
              Crear Nuevo Pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
