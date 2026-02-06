import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Package
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  date: string;
  status: "pendiente" | "procesando" | "enviado" | "entregado";
  items: number;
  total: number;
}

const orders: Order[] = [
  { id: "PED-2024-0142", date: "15/01/2024", status: "procesando", items: 4, total: 4250.00 },
  { id: "PED-2024-0138", date: "14/01/2024", status: "enviado", items: 2, total: 8920.50 },
  { id: "PED-2024-0131", date: "12/01/2024", status: "entregado", items: 6, total: 2180.00 },
  { id: "PED-2024-0125", date: "10/01/2024", status: "entregado", items: 3, total: 5640.25 },
  { id: "PED-2024-0118", date: "08/01/2024", status: "entregado", items: 5, total: 12450.00 },
  { id: "PED-2024-0112", date: "05/01/2024", status: "entregado", items: 2, total: 890.50 },
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
};

export default function MyOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Pedidos</h1>
          <p className="text-muted-foreground">Seguimiento y gestión de tus pedidos</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de pedido..."
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

        {/* Orders List */}
        <DataCard title="Historial de Pedidos" bodyClassName="p-0">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Nº Pedido</th>
                <th>Fecha</th>
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
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
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
