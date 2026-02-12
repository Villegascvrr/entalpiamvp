import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { MasterDetailLayout } from "@/components/layout/MasterDetailLayout";
import { DataCard, MetricCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Clock,
  CheckCircle,
  Truck,
  Package,
  FileText,
  Download,
  XCircle,
  AlertCircle,
  User,
  Building2,
  Calendar,
  ArrowRight,
  Printer,
  RotateCcw,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/data/types";
// import { adminOrders as orders } from "@/data/mock-orders"; // Replaced by hook
import { useOrders } from "@/hooks/useOrders";

const statusConfig = {
  pending_validation: {
    label: "Pend. Validación",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badgeVariant: "outline" as const
  },
  confirmed: {
    label: "Confirmado",
    icon: CheckCircle,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badgeVariant: "outline" as const
  },
  preparing: {
    label: "En Preparación",
    icon: Package,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    badgeVariant: "outline" as const
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    className: "bg-primary/10 text-primary border-primary/20",
    badgeVariant: "outline" as const
  },
  delivered: {
    label: "Entregado",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    badgeVariant: "outline" as const
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    badgeVariant: "outline" as const
  },
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { adminOrders: orders, isLoading, updateOrderStatus, refresh } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0]);

  // If loading, we might show a skeleton or just render empty for now until data arrives
  // The original mock was instant, so this is a subtle behavior change.
  // Update selectedOrder when orders changes to reflect new status
  if (selectedOrder) {
    const currentOrder = orders.find(o => o.id === selectedOrder.id);
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

  const handleStatusChange = async (orderId: string, newStatus: Order["status"], notes?: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Pedido actualizado`, {
        description: `${orderId} → ${newStatus}`
      });
    } catch (err) {
      toast.error("Error al actualizar pedido");
    }
  };


  const handlePrint = () => {
    toast.info("Generando documento...", {
      description: "Preparando vista de impresión",
    });
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handleDownloadPDF = () => {
    toast.success("Descarga iniciada", {
      description: `Pedido_${selectedOrder?.id}.pdf`,
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(o => o.status === "pending_validation").length;
  const processingCount = orders.filter(o => o.status === "confirmed").length;
  const todayTotal = orders.filter(o => o.date.startsWith("15/01/2024")).reduce((sum, o) => sum + o.total, 0);

  // ─────────────────────────────────────────────────────────────
  // MASTER PANEL: Orders List
  // ─────────────────────────────────────────────────────────────
  const masterContent = (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded flex items-center justify-center",
              pendingCount > 0 ? "bg-amber-500/20" : "bg-muted"
            )}>
              <span className={cn(
                "text-sm font-bold",
                pendingCount > 0 ? "text-amber-600" : "text-muted-foreground"
              )}>{pendingCount}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Pendientes</p>
              <p className="text-xs font-medium">Por procesar</p>
            </div>
          </div>
          <div className="h-8 border-l border-border"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">{processingCount}</span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Procesando</p>
              <p className="text-xs font-medium">En curso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === "pending_validation" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setStatusFilter("pending_validation")}
          >
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Button>
          <Button
            variant={statusFilter === "confirmed" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setStatusFilter("confirmed")}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmado
          </Button>
        </div>
        <div className="mt-2">
          <Button className="w-full gap-2 h-8 text-xs" onClick={() => navigate("/admin/orders/new")}>
            <Plus className="h-3.5 w-3.5" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-auto">
        {filteredOrders.map(order => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
          const isSelected = selectedOrder?.id === order.id;

          return (
            <div
              key={order.id}
              className={cn(
                "px-4 py-3 border-b border-border cursor-pointer transition-colors",
                isSelected
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "hover:bg-muted/50",
                order.status === "pending_validation" && !isSelected && "bg-amber-500/5"
              )}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold">{order.id}</span>
                    <Badge variant="outline" className={cn("text-[9px] h-4", status.className)}>
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium mt-1 truncate">{order.company}</p>
                  <p className="text-[10px] text-muted-foreground">{order.customer.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-sm font-semibold">€{order.total.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{order.items.length} items</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{order.date}</p>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Sin pedidos
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/20 text-[10px] text-muted-foreground">
        {filteredOrders.length} pedido(s) · €{todayTotal.toLocaleString("es-ES")} hoy
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // DETAIL PANEL: Selected Order
  // ─────────────────────────────────────────────────────────────
  const detailContent = (
    <div className="flex flex-col h-full">
      {selectedOrder ? (
        <>
          {/* Header */}
          <div className="px-6 py-4 border-b bg-background">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold font-mono">{selectedOrder.id}</h1>
                  <Badge variant="outline" className={cn("text-xs", statusConfig[selectedOrder.status].className)}>
                    {(() => {
                      const StatusIcon = statusConfig[selectedOrder.status].icon;
                      return <StatusIcon className="h-3 w-3 mr-1" />;
                    })()}
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <DataCard title="Cliente" className="col-span-1">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {selectedOrder.company}
                    </div>
                  </div>
                </div>
              </DataCard>

              <DataCard title="Entrega" className="col-span-1">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">{selectedOrder.address || "Sin dirección especificada"}</p>
                    {selectedOrder.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{selectedOrder.notes}"</p>
                    )}
                  </div>
                </div>
              </DataCard>
            </div>

            {/* Order Items */}
            <DataCard title="Artículos del Pedido" bodyClassName="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left font-medium text-muted-foreground text-xs uppercase py-2 px-4">Producto</th>
                    <th className="text-center font-medium text-muted-foreground text-xs uppercase py-2 px-4">Cantidad</th>
                    <th className="text-right font-medium text-muted-foreground text-xs uppercase py-2 px-4">Precio Unit.</th>
                    <th className="text-right font-medium text-muted-foreground text-xs uppercase py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono">€{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        €{(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={3} className="py-3 px-4 text-right font-medium">Total Pedido</td>
                    <td className="py-3 px-4 text-right font-mono text-lg font-bold">
                      €{selectedOrder.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </DataCard>

            {/* Alerts */}
            {selectedOrder.status === "pending_validation" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Pendiente de procesamiento</p>
                  <p className="text-sm">Este pedido requiere tu atención para ser procesado.</p>
                </div>
              </div>
            )}

            {selectedOrder.status === "cancelled" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <XCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Pedido cancelado</p>
                  <p className="text-sm">{selectedOrder.notes || "Sin motivo especificado"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          {selectedOrder.status === "pending_validation" && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder.id, "cancelled", "Rechazado por administración")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Funcionalidad en desarrollo", { description: "Próximamente: Chat con cliente" })}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Solicitar Cambios
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="px-8"
                  onClick={() => handleStatusChange(selectedOrder.id, "confirmed")}
                >
                  Procesar Pedido
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {selectedOrder.status === "confirmed" && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-end">
                <Button
                  size="lg"
                  className="px-8"
                  onClick={() => handleStatusChange(selectedOrder.id, "shipped")}
                >
                  Marcar como Enviado
                  <Truck className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Package className="h-12 w-12 opacity-20" />
          <p className="font-medium">Seleccione un pedido</p>
          <p className="text-sm">Haga clic en un pedido de la lista para ver los detalles</p>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <MasterDetailLayout
        master={masterContent}
        detail={detailContent}
        masterDefaultSize={35}
        masterMinSize={25}
        masterMaxSize={45}
        className="h-full"
      />
    </AppLayout>
  );
}
