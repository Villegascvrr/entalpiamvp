import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
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

  // No need for selectedOrder or isSheetOpen anymore

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
      </AppLayout>
    );
  }

  // Action handlers moved to OrderDetail page

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingOrders = orders.filter((o) => o.status === "pending_validation");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const shippedOrders = orders.filter((o) => o.status === "shipped");
  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const pendingCount = pendingOrders.length;
  const processingCount = confirmedOrders.length + preparingOrders.length;

  const openOrderDetails = (order: Order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                {t("adminOrders.title")}
              </h1>
              {!isLoading && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 h-5 font-normal bg-indigo-500/10 text-indigo-700 border-indigo-200"
                >
                  {orders.length} pedidos
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className={cn("h-4 w-4 rounded-sm flex items-center justify-center", pendingCount > 0 ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground")}>
                  <span className="text-[10px] font-bold">{pendingCount}</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t("adminOrders.pending")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded-sm bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold">{processingCount}</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t("adminOrders.processing")}</span>
              </div>
            </div>
          </div>

          <Button
            className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => navigate("/admin/orders/new")}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            {t("adminOrders.newOrder")}
          </Button>
        </div>

        {/* ── Filter bar ──────────────────────────────────── */}
        <div className="flex-none px-6 py-3 border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminOrders.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm w-full"
              />
            </div>
            
            <div className="flex gap-2 w-full overflow-x-auto scrollbar-none items-center">
              <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" className="h-9 text-xs px-3 rounded-full shrink-0" onClick={() => setStatusFilter("all")}>
                {t("common.all")}
              </Button>
              <Button variant={statusFilter === "pending_validation" ? "default" : "outline"} size="sm" className="h-9 text-xs px-3 rounded-full shrink-0" onClick={() => setStatusFilter("pending_validation")}>
                <Clock className="h-3.5 w-3.5 mr-1.5" />{t("status.pending_validation")}
              </Button>
              <Button variant={statusFilter === "confirmed" ? "default" : "outline"} size="sm" className="h-9 text-xs px-3 rounded-full shrink-0" onClick={() => setStatusFilter("confirmed")}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />{t("status.confirmed")}
              </Button>
              <Button variant={statusFilter === "preparing" ? "default" : "outline"} size="sm" className="h-9 text-xs px-3 rounded-full shrink-0" onClick={() => setStatusFilter("preparing")}>
                <Package className="h-3.5 w-3.5 mr-1.5" />{t("status.preparing")}
              </Button>
              <Button variant={statusFilter === "shipped" ? "default" : "outline"} size="sm" className="h-9 text-xs px-3 rounded-full shrink-0" onClick={() => setStatusFilter("shipped")}>
                <Truck className="h-3.5 w-3.5 mr-1.5" />{t("status.shipped")}
              </Button>
              <Button variant={statusFilter === "delivered" ? "default" : "outline"} size="sm" className="h-9 text-xs px-3 rounded-full shrink-0" onClick={() => setStatusFilter("delivered")}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />{t("status.delivered")}
              </Button>
            </div>
          </div>
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

    </AppLayout>
  );
}
