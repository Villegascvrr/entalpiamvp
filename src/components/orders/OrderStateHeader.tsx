import { Badge } from "@/components/ui/badge";
import { useOrder } from "@/contexts/OrderContext";
import { CheckCircle2 } from "lucide-react";

export function OrderStateHeader() {
  const { orderReference, clientName, lastSaved, items, orderStatus } =
    useOrder();

  // Status mapping
  const statusLabels: Record<string, string> = {
    draft: "Borrador",
    pendiente_validacion: "Pendiente Validación",
    confirmado: "Confirmado",
    en_preparacion: "En Preparación",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  const statusLabel = statusLabels[orderStatus] || orderStatus;

  return (
    <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="flex h-12 items-center justify-between px-6">
        {/* Left: Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">
              {orderReference}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-sm font-medium">{clientName}</span>
          </div>
          <Badge variant="outline" className="text-xs h-5 px-2 bg-muted/50">
            {statusLabel}
          </Badge>
        </div>

        {/* Right: Autosave Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lastSaved && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>
                Guardado automáticamente{" "}
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
