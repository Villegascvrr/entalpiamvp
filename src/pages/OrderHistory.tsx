import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui/data-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Download,
  Eye,
  Search,
  XCircle as XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrderHistory() {
  const { archivedOrders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { t } = useTranslation();

  const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    delivered: {
      label: t("status.delivered"),
      icon: CheckCircle,
      className: "bg-status-available/10 text-status-available border-status-available/20",
    },
    cancelled: {
      label: t("status.cancelled"),
      icon: XCircleIcon,
      className: "bg-muted text-muted-foreground border-muted-foreground/20",
    },
  };

  const filteredOrders = archivedOrders.filter((order) => {
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("orderHistory.title")}</h1>
            <p className="text-muted-foreground">
              {t("orderHistory.subtitle")}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t("orderHistory.exportCSV")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("orderHistory.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="h-8 w-px bg-border mx-2" />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              {t("orderHistory.filterByDate")}
            </Button>
          </div>

          <div className="flex-1" />

          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
            >
              {t("orderHistory.all")}
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
        <DataCard title={t("orderHistory.fullRegistry")} bodyClassName="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/30">
                    <th>{t("orderHistory.columns.orderNumber")}</th>
                    <th>{t("orderHistory.columns.date")}</th>
                    <th>{t("orderHistory.columns.items")}</th>
                    <th>{t("orderHistory.columns.status")}</th>
                    <th className="text-right">{t("orderHistory.columns.total")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status =
                      statusConfig[order.status] ||
                      statusConfig.delivered;
                    const StatusIcon = status.icon;

                    return (
                      <tr key={order.id}>
                        <td>
                          <span className="font-mono font-medium">
                            {order.id}
                          </span>
                        </td>
                        <td className="text-muted-foreground">{order.date}</td>
                        <td>{t("orderHistory.items", { count: order.items.length })}</td>
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
                              {t("orderHistory.details")}
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
                  {t("orderHistory.noOrders")}
                </div>
              )}
            </>
          )}
        </DataCard>
      </div>
    </AppLayout>
  );
}
