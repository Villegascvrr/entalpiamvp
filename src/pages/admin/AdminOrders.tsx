import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Order } from "@/data/types";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Package,
  Plus,
  Printer,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const statusConfig = {
  pending_validation: {
    label: "Pend. Validación",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  confirmed: {
    label: "Confirmado",
    icon: CheckCircle,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  preparing: {
    label: "En Preparación",
    icon: Package,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    adminOrders: orders,
    isLoading,
    updateOrderStatus,
  } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Update selectedOrder when orders changes to reflect new status
  if (selectedOrder) {
    const currentOrder = orders.find((o) => o.id === selectedOrder.id);
    if (currentOrder && currentOrder.status !== selectedOrder.status) {
      setSelectedOrder(currentOrder);
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
      </AppLayout>
    );
  }

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
    notes?: string,
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(t("adminOrders.toasts.updated"), {
        description: `${orderId} → ${newStatus}`,
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
      description: `Pedido_${selectedOrder?.id}.pdf`,
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(
    (o) => o.status === "pending_validation",
  ).length;
  const processingCount = orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length;

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* Header - Compact */}
        <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold font-mono tracking-tight text-foreground/90 uppercase flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {t("adminOrders.title")}
            </h1>

            <div className="h-8 w-px bg-border/60" />

            {/* Stats inline */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-8 w-8 rounded flex items-center justify-center",
                    pendingCount > 0 ? "bg-amber-500/20" : "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
                      pendingCount > 0 ? "text-amber-600" : "text-muted-foreground",
                    )}
                  >
                    {pendingCount}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("adminOrders.pending")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {processingCount}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("adminOrders.processing")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t("adminOrders.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>
            <Button
              className="gap-2 h-9 text-xs px-4"
              onClick={() => navigate("/admin/orders/new")}
            >
              <Plus className="h-4 w-4" />
              {t("adminOrders.newOrder")}
            </Button>
          </div>
        </div>

        {/* Filters Top Bar */}
        <div className="flex-none px-6 py-3 border-b border-border/60 bg-card flex gap-2 overflow-x-auto scrollbar-none">
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-full" onClick={() => setStatusFilter("all")}>
            {t("common.all")}
          </Button>
          <Button variant={statusFilter === "pending_validation" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-full" onClick={() => setStatusFilter("pending_validation")}>
            <Clock className="h-3.5 w-3.5 mr-1.5" />{t("status.pending_validation")}
          </Button>
          <Button variant={statusFilter === "confirmed" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-full" onClick={() => setStatusFilter("confirmed")}>
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />{t("status.confirmed")}
          </Button>
          <Button variant={statusFilter === "preparing" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-full" onClick={() => setStatusFilter("preparing")}>
            <Package className="h-3.5 w-3.5 mr-1.5" />{t("status.preparing")}
          </Button>
          <Button variant={statusFilter === "shipped" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-full" onClick={() => setStatusFilter("shipped")}>
            <Truck className="h-3.5 w-3.5 mr-1.5" />{t("status.shipped")}
          </Button>
          <Button variant={statusFilter === "delivered" ? "default" : "outline"} size="sm" className="h-7 text-xs px-3 rounded-full" onClick={() => setStatusFilter("delivered")}>
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />{t("status.delivered")}
          </Button>
        </div>

        {/* Main Table Content */}
        <div className="flex-1 p-6 overflow-hidden bg-muted/10">
          <div className="h-full bg-card border border-border/60 rounded-lg flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0 z-10 shadow-sm">
                  <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                    <th className="px-6 py-4 font-medium">{t("adminOrders.columns.orderNumber")}</th>
                    <th className="px-6 py-4 font-medium">{t("adminOrders.columns.customer")}</th>
                    <th className="px-6 py-4 font-medium">{t("adminOrders.columns.date")}</th>
                    <th className="px-6 py-4 font-medium text-center">{t("adminOrders.columns.items")}</th>
                    <th className="px-6 py-4 font-medium text-center">{t("adminOrders.columns.status")}</th>
                    <th className="px-6 py-4 font-medium text-right">{t("adminOrders.columns.total")}</th>
                    <th className="px-6 py-4 font-medium text-right">{t("adminOrders.columns.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors group cursor-pointer"
                        onClick={() => openOrderDetails(order)}
                      >
                        <td className="px-6 py-4 align-middle">
                          <span className="font-mono font-semibold text-foreground">
                            {order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="font-medium text-foreground/90 line-clamp-1">
                            {order.company}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {order.customer.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-muted-foreground text-xs font-mono">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 align-middle text-center font-mono">
                          {order.items.length}
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] h-6 justify-center min-w-[120px] shadow-none", status.className)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1.5" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <span className="font-mono font-bold text-base text-foreground">
                            €{order.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 bg-background hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderDetails(order);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            {t("adminOrders.manage")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-lg">{t("adminOrders.noOrders")}</p>
                        <p className="text-sm mt-1">{t("adminOrders.noOrdersSubtitle")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet for Detail View */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl sm:w-[500px] overflow-hidden p-0 flex flex-col">
          <SheetHeader className="p-6 border-b text-left space-y-0 bg-background z-10">
            <div className="flex flex-col gap-1 w-full relative">
              <SheetTitle className="font-mono text-xl flex flex-wrap items-center gap-3">
                <span className="mr-auto">{selectedOrder?.id}</span>
                {selectedOrder && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shadow-none border max-w-full truncate overflow-hidden mt-2 sm:mt-0",
                      statusConfig[selectedOrder.status].className,
                    )}
                  >
                    {(() => {
                      const StatusIcon = statusConfig[selectedOrder.status].icon;
                      return <StatusIcon className="h-3 w-3 mr-1 shrink-0" />;
                    })()}
                    <span className="truncate">{t(`status.${selectedOrder.status}`)}</span>
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="flex justify-between items-center text-xs mt-2">
                <span>{selectedOrder?.date}</span>
                <span className="font-mono font-bold text-sm text-foreground">Total: €{selectedOrder?.total.toFixed(2)}</span>
              </SheetDescription>
            </div>

            {/* Print / PDF Actions */}
            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 text-xs bg-background">
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                {t("adminOrders.drawer.printOrder")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="h-8 text-xs bg-background">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {t("adminOrders.drawer.downloadPDF")}
              </Button>
            </div>
          </SheetHeader>

          {selectedOrder && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <DataCard title={t("adminOrders.drawer.client")} className="col-span-1 shadow-sm border-border/60">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedOrder.customer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{selectedOrder.company}</span>
                      </div>
                    </div>
                  </div>
                </DataCard>

                <DataCard title={t("adminOrders.drawer.delivery")} className="col-span-1 shadow-sm border-border/60">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs line-clamp-2 leading-relaxed">
                        {selectedOrder.address || t("adminOrders.drawer.noAddress")}
                      </p>
                      {selectedOrder.notes && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic line-clamp-1" title={selectedOrder.notes}>
                          "{selectedOrder.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </DataCard>
              </div>

              {/* Order Items */}
              <DataCard title={t("adminOrders.drawer.articleCount", { count: selectedOrder.items.length })} bodyClassName="p-0" className="shadow-sm border-border/60">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.product")}</th>
                        <th className="text-center font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.qty")}</th>
                        <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.unitPrice")}</th>
                        <th className="text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider py-2 px-4 whitespace-nowrap">{t("adminOrders.drawer.articleColumns.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                          <td className="py-2.5 px-4 min-w-[120px] max-w-[180px]">
                            <p className="font-medium truncate" title={item.name}>{item.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {item.id}
                            </p>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                            €{item.price.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-medium whitespace-nowrap">
                            €{(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/40">
                        <td
                          colSpan={3}
                          className="py-3 px-4 text-right font-medium text-sm"
                        >
                          Total
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-base font-bold text-foreground">
                          €{selectedOrder.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </DataCard>

              {/* Alerts inside details */}
              {selectedOrder.status === "pending_validation" && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{t("adminOrders.drawer.pendingAlert")}</p>
                    <p className="text-xs mt-0.5">{t("adminOrders.drawer.pendingAlertDesc")}</p>
                  </div>
                </div>
              )}

              {selectedOrder.status === "cancelled" && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  <XCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{t("adminOrders.drawer.cancelledAlert")}</p>
                    <p className="text-xs mt-0.5">
                      {selectedOrder.notes || t("adminOrders.drawer.cancelledDefault")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Footer locked to bottom */}
          {selectedOrder && (
            <div className="p-4 border-t bg-muted/10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 w-full overflow-hidden shrink-0">
              {/* Contextual actions based on status */}
              <div className="flex items-center gap-3 w-full">
                {selectedOrder.status === "pending_validation" && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 bg-background"
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, "cancelled", "Rechazado");
                        setIsSheetOpen(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2 text-destructive shrink-0" />
                      <span className="truncate">{t("adminOrders.drawer.actions.reject")}</span>
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleStatusChange(selectedOrder.id, "confirmed")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
                      <span className="truncate">{t("adminOrders.drawer.actions.confirm")}</span>
                    </Button>
                  </>
                )}

                {selectedOrder.status === "confirmed" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleStatusChange(selectedOrder.id, "preparing")}
                  >
                    <Package className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{t("adminOrders.drawer.actions.toPreparation")}</span>
                  </Button>
                )}

                {selectedOrder.status === "preparing" && (
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleStatusChange(selectedOrder.id, "shipped")}
                  >
                    <Truck className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{t("adminOrders.drawer.actions.markShipped")}</span>
                  </Button>
                )}

                {selectedOrder.status === "shipped" && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange(selectedOrder.id, "delivered")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{t("adminOrders.drawer.actions.confirmDelivery")}</span>
                  </Button>
                )}

                {["delivered", "cancelled"].includes(selectedOrder.status) && (
                  <div className="text-center text-xs text-muted-foreground w-full py-2">
                    {t("adminOrders.drawer.actions.cycleFinished")}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
