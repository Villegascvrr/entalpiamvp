import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard, MetricCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Package,
  FileText,
  Download,
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string;
  status: "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";
  items: number;
  total: number;
}

const orders: Order[] = [
  { id: "PED-2024-0145", customer: "Carlos Martínez", company: "Distribuciones Norte S.L.", date: "15/01/2024 09:45", status: "pendiente", items: 3, total: 2450.00 },
  { id: "PED-2024-0144", customer: "María López", company: "Suministros Este S.A.", date: "15/01/2024 08:30", status: "pendiente", items: 5, total: 8920.50 },
  { id: "PED-2024-0142", customer: "Carlos Martínez", company: "Distribuciones Norte S.L.", date: "15/01/2024 07:15", status: "procesando", items: 4, total: 4250.00 },
  { id: "PED-2024-0138", customer: "José García", company: "Comercial Sur", date: "14/01/2024 16:20", status: "enviado", items: 2, total: 1890.00 },
  { id: "PED-2024-0131", customer: "Ana Fernández", company: "Instalaciones Oeste", date: "14/01/2024 11:00", status: "entregado", items: 6, total: 12180.00 },
  { id: "PED-2024-0125", customer: "Roberto Sánchez", company: "Materiales Centro", date: "13/01/2024 14:30", status: "cancelado", items: 3, total: 5640.25 },
];

const statusConfig = {
  pendiente: { 
    label: "Pendiente", 
    icon: Clock, 
    className: "bg-status-low/10 text-status-low border-status-low/20" 
  },
  procesando: { 
    label: "Procesando", 
    icon: Package, 
    className: "bg-primary/10 text-primary border-primary/20" 
  },
  enviado: { 
    label: "Enviado", 
    icon: Truck, 
    className: "bg-primary/10 text-primary border-primary/20" 
  },
  entregado: { 
    label: "Entregado", 
    icon: CheckCircle, 
    className: "bg-status-available/10 text-status-available border-status-available/20" 
  },
  cancelado: { 
    label: "Cancelado", 
    icon: XCircle, 
    className: "bg-destructive/10 text-destructive border-destructive/20" 
  },
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(o => o.status === "pendiente").length;
  const todayTotal = orders.filter(o => o.date.startsWith("15/01/2024")).reduce((sum, o) => sum + o.total, 0);
  const todayOrders = orders.filter(o => o.date.startsWith("15/01/2024")).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Pedidos</h1>
            <p className="text-muted-foreground">Revisa y procesa los pedidos entrantes</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Pedidos
          </Button>
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-md bg-status-low/10 text-status-low border border-status-low/30">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Tienes {pendingCount} pedido(s) pendientes de procesar.</span>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Pedidos Pendientes"
            value={pendingCount}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            label="Pedidos de Hoy"
            value={todayOrders}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            label="Volumen de Hoy"
            value={`€${todayTotal.toLocaleString("es-ES")}`}
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            label="Pedido Medio"
            value={`€${(todayTotal / todayOrders).toFixed(0)}`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos, clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
            >
              Todos
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="gap-1"
              >
                <config.icon className="h-3 w-3" />
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <DataCard title="Lista de Pedidos" bodyClassName="p-0">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Artículos</th>
                <th>Estado</th>
                <th className="text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                
                return (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono font-medium">{order.id}</span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.company}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{order.date}</td>
                    <td>{order.items} artículos</td>
                    <td>
                      <Badge variant="outline" className={cn("gap-1", status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="text-right font-mono font-semibold">
                      €{order.total.toFixed(2)}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                        {order.status === "pendiente" && (
                          <Button variant="default" size="sm">
                            Procesar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron pedidos con los criterios seleccionados
            </div>
          )}
        </DataCard>
      </div>
    </AppLayout>
  );
}
