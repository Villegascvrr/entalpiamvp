import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Eye, Package, Search, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MyOrders() {
  const { activeOrders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { t } = useTranslation();

  const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    pending_validation: {
      label: t("status.pending_validation"),
      icon: Clock,
      className: "bg-status-low/10 text-status-low border-status-low/20",
    },
    confirmed: {
      label: t("status.confirmed"),
      icon: CheckCircle,
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    preparing: {
      label: t("status.preparing"),
      icon: Package,
      className: "bg-primary/10 text-primary border-primary/20",
    },
    shipped: {
      label: t("status.shipped"),
      icon: Truck,
      className: "bg-primary/10 text-primary border-primary/20",
    },
  };

  const orders = activeOrders;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("myOrders.title")}</h1>
          <p className="text-muted-foreground">
            {t("myOrders.subtitle")}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("myOrders.searchPlaceholder")}
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
              {t("myOrders.all")}
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
        <DataCard title={t("myOrders.activeOrders")} bodyClassName="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/30">
                    <th>{t("myOrders.columns.orderNumber")}</th>
                    <th>{t("myOrders.columns.date")}</th>
                    <th>{t("myOrders.columns.items")}</th>
                    <th>{t("myOrders.columns.status")}</th>
                    <th className="text-right">{t("myOrders.columns.total")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status =
                      statusConfig[order.status] ||
                      statusConfig.pending_validation;
                    const StatusIcon = status.icon;

                    return (
                      <tr key={order.id}>
                        <td>
                          <span className="font-mono font-medium">
                            {order.id}
                          </span>
                        </td>
                        <td className="text-muted-foreground">{order.date}</td>
                        <td>{t("myOrders.items", { count: order.items.length })}</td>
                        <td>
                          <Badge
                            variant="outline"
                            className={cn("gap-1", status.className)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="text-right font-mono font-semibold">
                          €{order.total.toFixed(2)}
                        </td>
                        <td>
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="h-3 w-3" />
                              {t("myOrders.view")}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {t("myOrders.noOrders")}
                </div>
              )}
            </>
          )}
        </DataCard>
      </div>
    </AppLayout>
  );
}
