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
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  total: number;
}

const orders: Order[] = [
  { id: "ORD-2024-0145", customer: "Marcus Chen", company: "Metro Distributors", date: "2024-01-15 09:45", status: "pending", items: 3, total: 2450.00 },
  { id: "ORD-2024-0144", customer: "Lisa Wong", company: "Eastern Supply Co", date: "2024-01-15 08:30", status: "pending", items: 5, total: 8920.50 },
  { id: "ORD-2024-0142", customer: "Marcus Chen", company: "Metro Distributors", date: "2024-01-15 07:15", status: "processing", items: 4, total: 4250.00 },
  { id: "ORD-2024-0138", customer: "James Park", company: "Pacific Trade", date: "2024-01-14 16:20", status: "shipped", items: 2, total: 1890.00 },
  { id: "ORD-2024-0131", customer: "Anna Smith", company: "Continental Dist", date: "2024-01-14 11:00", status: "delivered", items: 6, total: 12180.00 },
  { id: "ORD-2024-0125", customer: "Robert Lee", company: "Global Materials", date: "2024-01-13 14:30", status: "cancelled", items: 3, total: 5640.25 },
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
  cancelled: { 
    label: "Cancelled", 
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

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const todayTotal = orders.filter(o => o.date.startsWith("2024-01-15")).reduce((sum, o) => sum + o.total, 0);
  const todayOrders = orders.filter(o => o.date.startsWith("2024-01-15")).length;

  return (
    <AppLayout userRole="admin" userName="Sarah Admin" companyName="Industrial Corp">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
            <p className="text-muted-foreground">Review and process incoming orders</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Orders
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Pending Orders"
            value={pendingCount}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            label="Today's Orders"
            value={todayOrders}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            label="Today's Volume"
            value={`€${todayTotal.toLocaleString()}`}
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            label="Avg. Order Value"
            value={`€${(todayTotal / todayOrders).toFixed(0)}`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, customers..."
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

        {/* Orders Table */}
        <DataCard title="Orders" bodyClassName="p-0">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date & Time</th>
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
                    <td>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.company}</p>
                      </div>
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
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        {order.status === "pending" && (
                          <Button variant="default" size="sm">
                            Process
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
              No orders found matching your criteria
            </div>
          )}
        </DataCard>
      </div>
    </AppLayout>
  );
}
