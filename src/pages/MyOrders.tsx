import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
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
  status: "pending" | "processing" | "shipped" | "delivered";
  items: number;
  total: number;
}

const orders: Order[] = [
  { id: "ORD-2024-0142", date: "2024-01-15", status: "processing", items: 4, total: 4250.00 },
  { id: "ORD-2024-0138", date: "2024-01-14", status: "shipped", items: 2, total: 8920.50 },
  { id: "ORD-2024-0131", date: "2024-01-12", status: "delivered", items: 6, total: 2180.00 },
  { id: "ORD-2024-0125", date: "2024-01-10", status: "delivered", items: 3, total: 5640.25 },
  { id: "ORD-2024-0118", date: "2024-01-08", status: "delivered", items: 5, total: 12450.00 },
  { id: "ORD-2024-0112", date: "2024-01-05", status: "delivered", items: 2, total: 890.50 },
];

const statusConfig = {
  pending: { 
    label: "Pending", 
    icon: Clock, 
    className: "bg-status-low/10 text-status-low border-status-low/20" 
  },
  processing: { 
    label: "Processing", 
    icon: Package, 
    className: "bg-primary/10 text-primary border-primary/20" 
  },
  shipped: { 
    label: "Shipped", 
    icon: Truck, 
    className: "bg-primary/10 text-primary border-primary/20" 
  },
  delivered: { 
    label: "Delivered", 
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
    <AppLayout userRole="customer" userName="Marcus Chen" companyName="Metro Distributors">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
            >
              All
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
        <DataCard title="Order History" bodyClassName="p-0">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Order Number</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
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
                    <td>{order.items} items</td>
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
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No orders found matching your criteria
            </div>
          )}
        </DataCard>
      </div>
    </AppLayout>
  );
}
