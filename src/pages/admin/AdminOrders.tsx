import { useState } from "react";
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
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string;
  status: "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";
  items: OrderItem[];
  total: number;
  notes?: string;
  address?: string;
}

const orders: Order[] = [
  {
    id: "PED-2024-0145",
    customer: "Carlos Martínez",
    company: "Distribuciones Norte S.L.",
    date: "15/01/2024 09:45",
    status: "pendiente",
    items: [
      { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", quantity: 20, price: 245.80 },
      { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", quantity: 10, price: 312.50 },
      { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", quantity: 200, price: 2.45 },
    ],
    total: 2450.00,
    address: "Pol. Ind. Norte, C/ Principal 45, 28001 Madrid",
    notes: "Entregar por la mañana"
  },
  {
    id: "PED-2024-0144",
    customer: "María López",
    company: "Suministros Este S.A.",
    date: "15/01/2024 08:30",
    status: "pendiente",
    items: [
      { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", quantity: 50, price: 198.90 },
      { id: "ENT-CU-28", name: "Tubo Cobre 28mm - Barra 5m", quantity: 30, price: 89.40 },
      { id: "ENT-CU-35", name: "Tubo Cobre 35mm - Barra 5m", quantity: 20, price: 142.60 },
      { id: "ENT-ACC-02", name: "Te Cobre 15mm", quantity: 500, price: 3.20 },
      { id: "ENT-ACC-03", name: "Manguito Cobre 18mm", quantity: 400, price: 1.85 },
    ],
    total: 8920.50,
    address: "Av. de la Industria 123, 28850 Torrejón",
  },
  {
    id: "PED-2024-0142",
    customer: "Carlos Martínez",
    company: "Distribuciones Norte S.L.",
    date: "15/01/2024 07:15",
    status: "procesando",
    items: [
      { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", quantity: 15, price: 245.80 },
      { id: "ENT-CU-54", name: "Tubo Cobre 54mm - Barra 5m", quantity: 8, price: 234.20 },
    ],
    total: 4250.00,
    address: "Pol. Ind. Norte, C/ Principal 45, 28001 Madrid",
  },
  {
    id: "PED-2024-0138",
    customer: "José García",
    company: "Comercial Sur",
    date: "14/01/2024 16:20",
    status: "enviado",
    items: [
      { id: "ENT-CU-18", name: "Tubo Cobre 18mm - Rollo 50m", quantity: 5, price: 312.50 },
      { id: "ENT-ACC-01", name: "Codo Cobre 90° 15mm", quantity: 100, price: 2.45 },
    ],
    total: 1890.00,
    address: "C/ del Comercio 78, 29001 Málaga",
  },
  {
    id: "PED-2024-0131",
    customer: "Ana Fernández",
    company: "Instalaciones Oeste",
    date: "14/01/2024 11:00",
    status: "entregado",
    items: [
      { id: "ENT-CU-15", name: "Tubo Cobre 15mm - Rollo 50m", quantity: 40, price: 245.80 },
      { id: "ENT-CU-22", name: "Tubo Cobre 22mm - Rollo 25m", quantity: 20, price: 198.90 },
    ],
    total: 12180.00,
    address: "Pol. Ind. Oeste, Nave 12, 41001 Sevilla",
  },
  {
    id: "PED-2024-0125",
    customer: "Roberto Sánchez",
    company: "Materiales Centro",
    date: "13/01/2024 14:30",
    status: "cancelado",
    items: [
      { id: "ENT-CU-42", name: "Tubo Cobre 42mm - Barra 5m", quantity: 25, price: 178.30 },
    ],
    total: 5640.25,
    address: "C/ Mayor 99, 45001 Toledo",
    notes: "Cancelado por cliente - sin stock"
  },
];

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badgeVariant: "outline" as const
  },
  procesando: {
    label: "Procesando",
    icon: Package,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badgeVariant: "outline" as const
  },
  enviado: {
    label: "Enviado",
    icon: Truck,
    className: "bg-primary/10 text-primary border-primary/20",
    badgeVariant: "outline" as const
  },
  entregado: {
    label: "Entregado",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    badgeVariant: "outline" as const
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    badgeVariant: "outline" as const
  },
};

export default function AdminOrders() {
  const [ordersState, setOrdersState] = useState<Order[]>(orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0]);

  // Update selectedOrder when ordersState changes to reflect new status
  if (selectedOrder) {
    const currentOrder = ordersState.find(o => o.id === selectedOrder.id);
    if (currentOrder && currentOrder.status !== selectedOrder.status) {
      setSelectedOrder(currentOrder);
    }
  }

  const handleStatusChange = (orderId: string, newStatus: Order["status"], notes?: string) => {
    setOrdersState(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, notes: notes || order.notes }
          : order
      )
    );

    const actionMap = {
      procesando: "procecsado",
      enviado: "enviado",
      cancelado: "cancelado",
      entregado: "entregado",
      pendiente: "pendiente"
    };

    toast.success(`Pedido ${orderId} marcado como ${newStatus}`, {
      description: `El cliente recibirá una notificación automática.`,
    });
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

  const filteredOrders = ordersState.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = ordersState.filter(o => o.status === "pendiente").length;
  const processingCount = ordersState.filter(o => o.status === "procesando").length;
  const todayTotal = ordersState.filter(o => o.date.startsWith("15/01/2024")).reduce((sum, o) => sum + o.total, 0);

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
            variant={selectedStatus === null ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setSelectedStatus(null)}
          >
            Todos
          </Button>
          <Button
            variant={selectedStatus === "pendiente" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setSelectedStatus("pendiente")}
          >
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Button>
          <Button
            variant={selectedStatus === "procesando" ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setSelectedStatus("procesando")}
          >
            <Package className="h-3 w-3 mr-1" />
            Procesando
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
                order.status === "pendiente" && !isSelected && "bg-amber-500/5"
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
                  <p className="text-[10px] text-muted-foreground">{order.customer}</p>
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
                    <p className="font-medium">{selectedOrder.customer}</p>
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
            {selectedOrder.status === "pendiente" && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Pendiente de procesamiento</p>
                  <p className="text-sm">Este pedido requiere tu atención para ser procesado.</p>
                </div>
              </div>
            )}

            {selectedOrder.status === "cancelado" && (
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
          {selectedOrder.status === "pendiente" && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder.id, "cancelado", "Rechazado por administración")}
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
                  onClick={() => handleStatusChange(selectedOrder.id, "procesando")}
                >
                  Procesar Pedido
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {selectedOrder.status === "procesando" && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-end">
                <Button
                  size="lg"
                  className="px-8"
                  onClick={() => handleStatusChange(selectedOrder.id, "enviado")}
                >
                  Marcar como Enviado
                  <Truck className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Selecciona un pedido para ver los detalles</p>
          </div>
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
