import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui/data-card";
import { useActor } from "@/contexts/ActorContext";
import { orderRepository } from "@/data/repositories";
import type { Order, OrderStatus, OrderTimelineEvent } from "@/data/types";
import { ORDER_STATUS_LABELS } from "@/data/types";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  Download,
  Package,
  Printer,
  Truck,
  User,
  XCircle,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const statusConfig = {
  draft: {
    icon: Clock,
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  pending_validation: {
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  confirmed: {
    icon: CheckCircle,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  preparing: {
    icon: Package,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  shipped: {
    icon: Truck,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  delivered: {
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  cancelled: {
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useActor();
  
  const { adminOrders, updateOrderStatus, isLoading: isOrdersLoading } = useOrders();
  
  const [timeline, setTimeline] = useState<OrderTimelineEvent[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(true);

  const order = adminOrders.find((o) => o.id === id);

  useEffect(() => {
    async function fetchTimeline() {
      if (!session || !id) return;
      try {
        setIsTimelineLoading(true);
        const data = await orderRepository.getOrderTimeline(session, id);
        setTimeline(data);
      } catch (error) {
        console.error("Failed to load timeline", error);
      } finally {
        setIsTimelineLoading(false);
      }
    }
    
    if (order) {
      fetchTimeline();
    }
  }, [session, id, order?.status]); // Re-fetch timeline when status changes

  if (isOrdersLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Cargando pedido...</p>
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Pedido no encontrado</p>
          <Button variant="outline" onClick={() => navigate("/admin/orders")}>
            Volver a pedidos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus, notes?: string) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(t("adminOrders.toasts.updated"), {
        description: `${order.id} → ${ORDER_STATUS_LABELS[newStatus] || newStatus}`,
      });
      if (notes) {
        console.log("Notes on status change:", notes);
      }
    } catch (err) {
      toast.error(t("adminOrders.toasts.updateError"));
    }
  };

  const handlePrint = () => {
    toast.info(t("adminOrders.toasts.printPreparing"), {
      description: t("adminOrders.toasts.printPreparingDesc"),
    });
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleDownloadPDF = () => {
    toast.success(t("adminOrders.toasts.downloadStarted"), {
      description: `Pedido_${order.id}.pdf`,
    });
  };

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-muted/10 overflow-y-auto">
        {/* ── Order Header ──────────────────────────────────────── */}
        <div className="bg-white border-b border-border/60 sticky top-0 z-10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 mt-0.5"
              onClick={() => navigate("/admin/orders")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <h1 className="text-lg font-bold tracking-tight text-foreground font-mono">
                  {order.id}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2.5 py-0.5 font-medium border shadow-none",
                    statusConfig[order.status]?.className
                  )}
                >
                  <StatusIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  {t(`status.${order.status}`)}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground text-sm gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {order.date}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-background shadow-sm h-8" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" className="bg-background shadow-sm h-8" onClick={handleDownloadPDF}>
              <Download className="h-3.5 w-3.5 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        <div className="p-4 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-3">
            
            {/* Alerts */}
            {order.status === "pending_validation" && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">{t("adminOrders.drawer.pendingAlert")}</p>
                  <p className="text-xs mt-0.5 opacity-90">{t("adminOrders.drawer.pendingAlertDesc")}</p>
                </div>
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                <XCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">{t("adminOrders.drawer.cancelledAlert")}</p>
                  <p className="text-xs mt-0.5 opacity-90">
                    {order.notes || t("adminOrders.drawer.cancelledDefault")}
                  </p>
                </div>
              </div>
            )}

            {/* OrderInfoSection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DataCard title={t("adminOrders.drawer.client")} className="shadow-sm border-border/60" bodyClassName="p-3" headerClassName="p-2 px-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">{order.customer.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{order.company}</span>
                    </div>
                  </div>
                </div>
              </DataCard>

              <DataCard title={t("adminOrders.drawer.delivery")} className="shadow-sm border-border/60" bodyClassName="p-3" headerClassName="p-2 px-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                    <Truck className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug truncate">
                      {order.address || t("adminOrders.drawer.noAddress")}
                    </p>
                    {order.notes && (
                      <p className="text-[10px] text-muted-foreground italic truncate mt-0.5">
                        <span className="font-semibold text-foreground/80 mr-1">Notas:</span>
                        {order.notes}
                      </p>
                    )}
                  </div>
                </div>
              </DataCard>
            </div>

            {/* OrderItemsTable */}
            <DataCard title={t("adminOrders.drawer.articleCount", { count: order.items.length })} bodyClassName="p-0" headerClassName="p-2 px-3" className="shadow-sm border-border/60 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b border-border/60">
                    <tr>
                      <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.product")}</th>
                      <th className="text-center font-semibold text-muted-foreground uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.qty")}</th>
                      <th className="text-right font-semibold text-muted-foreground uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.unitPrice")}</th>
                      <th className="text-right font-semibold text-muted-foreground uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.total")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-4 min-w-[200px]">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {item.id}
                          </p>
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                            {item.quantity}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.price)}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-medium text-foreground whitespace-nowrap">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/10 border-t border-border/60">
                    <tr>
                      <td colSpan={3} className="py-2 px-4 text-right font-medium text-muted-foreground uppercase text-[10px] tracking-wider">
                        Total del Pedido
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-base font-bold text-foreground">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </DataCard>
          </div>

          {/* Sidebar / Timeline area */}
          <div className="lg:col-span-1 space-y-3">
            
            {/* Order Actions Workspace */}
            <DataCard title="Acciones" className="shadow-sm border-border/60 bg-white" bodyClassName="p-3" headerClassName="p-2 px-3">
              <div className="flex flex-col gap-2">
                {order.status === "pending_validation" ? (
                  <>
                    <Button
                      size="sm"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-8"
                      onClick={() => handleStatusChange("confirmed")}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-2" />
                      Validar Pedido
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-destructive hover:bg-destructive/10 border-destructive/20 h-8"
                      onClick={() => handleStatusChange("cancelled", "Rechazado")}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-2" />
                      Rechazar Pedido
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center mt-1 leading-tight">
                       Este pedido requiere revisión comercial antes de pasar a preparación.
                    </p>
                  </>
                ) : order.status === "confirmed" ? (
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8"
                    onClick={() => handleStatusChange("preparing")}
                  >
                    <Package className="h-3.5 w-3.5 mr-2" />
                    Pasar a Preparación
                  </Button>
                ) : order.status === "preparing" ? (
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm h-8"
                    onClick={() => handleStatusChange("shipped")}
                  >
                    <Truck className="h-3.5 w-3.5 mr-2" />
                    Marcar como Enviado
                  </Button>
                ) : order.status === "shipped" ? (
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm h-8"
                    onClick={() => handleStatusChange("delivered")}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-2" />
                    Confirmar Entrega
                  </Button>
                ) : (
                  <div className="text-center py-2 bg-muted/30 rounded-md border border-border/40">
                    <span className="text-xs font-medium text-muted-foreground">
                      Ciclo finalizado
                    </span>
                  </div>
                )}
              </div>
            </DataCard>

            {/* Order Timeline */}
            <DataCard title="Historial del Pedido" className="shadow-sm border-border/60 bg-white" bodyClassName="p-3" headerClassName="p-2 px-3">
              {isTimelineLoading ? (
                 <div className="py-6 flex justify-center">
                   <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                 </div>
              ) : timeline.length === 0 ? (
                 <p className="text-xs text-muted-foreground py-2 text-center">No hay eventos registrados</p>
              ) : (
                <div className="relative pl-5 space-y-4 before:absolute before:inset-0 before:ml-[9px] before:w-[2px] before:-translate-x-px before:bg-muted py-1">
                  {timeline.map((event, i) => {
                    const EvIcon = statusConfig[event.to_status]?.icon || Clock;
                    const isLast = i === timeline.length - 1;
                    
                    return (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={cn(
                          "absolute left-[-20px] rounded-full p-0.5 border shadow-sm shrink-0 bg-white z-10",
                          isLast ? "border-primary text-primary" : "border-border text-muted-foreground"
                        )}>
                          <EvIcon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-0.5">
                            <p className={cn(
                              "text-xs font-semibold truncate",
                              isLast ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {ORDER_STATUS_LABELS[event.to_status] || t(`status.${event.to_status}`)}
                            </p>
                            <span className="text-[9px] text-muted-foreground font-mono shrink-0 pt-0.5">
                              {event.created_at}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-0.5">por <span className="font-medium">{event.changed_by}</span></p>
                          {event.notes && (
                            <p className="text-[10px] text-foreground/80 bg-muted/30 p-1.5 rounded border border-border/40 mt-1 line-clamp-2" title={event.notes}>
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </DataCard>
            
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
