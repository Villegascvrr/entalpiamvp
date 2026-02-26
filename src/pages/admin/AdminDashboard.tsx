import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  Eye,
  FileText,
  Package,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const stockAlerts = [
  {
    product: "Tubo Cobre 42mm - Barra 5m",
    id: "ENT-CU-42",
    stock: 0,
    status: "out" as const,
  },
  {
    product: "Tubo Cobre 35mm - Barra 5m",
    id: "ENT-CU-35",
    stock: 12,
    status: "critical" as const,
  },
  {
    product: "Tubo Cobre 28mm - Barra 5m",
    id: "ENT-CU-28",
    stock: 85,
    status: "low" as const,
  },
];

const lmeHistory = [
  { date: "15/01", value: 8432.5, change: 2.3 },
  { date: "14/01", value: 8243.0, change: -0.5 },
  { date: "13/01", value: 8284.4, change: 1.2 },
  { date: "12/01", value: 8186.15, change: 0.8 },
  { date: "11/01", value: 8121.25, change: -1.1 },
];

import { useOrders } from "@/hooks/useOrders";

export default function AdminDashboard() {
  const { recentOrders: pendingOrders, isLoading } = useOrders();
  const { t } = useTranslation();

  const criticalStock = stockAlerts.filter(
    (s) => s.status === "out" || s.status === "critical",
  ).length;

  const todayVolume =
    pendingOrders.reduce((sum, o) => sum + o.total, 0) + 12450.0;

  const lmeChange = lmeHistory[0].change;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden rounded-md border border-border/40 shadow-sm">
        {/* 1. TOP ALERT BAR */}
        <div className="flex-none flex items-center justify-between px-6 py-3 bg-muted/30 border-b border-border/60">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold font-mono tracking-tight text-foreground/90 uppercase flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t("adminDashboard.title")}
            </h1>

            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-sm border text-xs font-medium transition-colors",
                  pendingOrders.length > 0
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-700"
                    : "bg-muted/50 border-border text-muted-foreground",
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{pendingOrders.length} {t("adminDashboard.pendingBadge")}</span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-sm border text-xs font-medium transition-colors",
                  criticalStock > 0
                    ? "bg-red-500/10 border-red-500/20 text-red-700 animate-pulse"
                    : "bg-muted/50 border-border text-muted-foreground",
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{criticalStock} {t("adminDashboard.criticalStock")}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-sm border bg-blue-500/5 border-blue-500/10 text-blue-700 text-xs font-medium">
                <Truck className="h-3.5 w-3.5" />
                <span>12 {t("adminDashboard.inTransit")}</span>
              </div>
            </div>
          </div>

          {/* Global Context / LME */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {t("adminDashboard.volumeToday")}
              </p>
              <p className="font-mono text-sm font-bold">
                €
                {todayVolume.toLocaleString("es-ES", {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="h-8 w-px bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {t("adminDashboard.lmeCopper")}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-sm min-w-[80px] text-right">
                  ${lmeHistory[0].value.toLocaleString("en-US")}
                </span>
                <span
                  className={cn(
                    "text-xs font-mono w-14",
                    lmeChange > 0 ? "text-green-600" : "text-red-500",
                  )}
                >
                  {lmeChange > 0 ? "↑" : "↓"}
                  {Math.abs(lmeChange)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MAIN GRID (70/30 SPLIT) */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
            {/* LEFT COLUMN (70%) - Operational Queue */}
            <div className="col-span-1 md:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
              <div className="flex-none flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("adminDashboard.operationQueue")}
                </h2>
                <Link to="/admin/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1 hover:bg-muted/50"
                  >
                    {t("adminDashboard.viewAll")} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="flex-1 bg-card border border-border/60 rounded-sm overflow-hidden flex flex-col">
                {/* Table Header */}
                <div className="flex-none grid grid-cols-12 gap-4 px-4 py-2 bg-muted/40 border-b border-border/60 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">{t("adminDashboard.columns.refClient")}</div>
                  <div className="col-span-3">{t("adminDashboard.columns.status")}</div>
                  <div className="col-span-3 text-right">{t("adminDashboard.columns.total")}</div>
                  <div className="col-span-2 text-right">{t("adminDashboard.columns.action")}</div>
                </div>

                {/* Table List - Scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-12 gap-4 items-center px-4 py-2 border-b border-border/40 hover:bg-muted/20 transition-colors group text-sm"
                      >
                        {/* ID & Customer */}
                        <div className="col-span-4 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                              {order.id}
                            </span>
                            {order.priority === "high" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          <p
                            className="text-xs text-muted-foreground truncate"
                            title={order.customer}
                          >
                            {order.customer}
                          </p>
                        </div>

                        {/* Status/Time */}
                        <div className="col-span-3">
                          <Badge
                            variant="outline"
                            className="h-5 text-[10px] px-1.5 bg-amber-500/5 text-amber-700 border-amber-500/20 rounded-sm"
                          >
                            {t("adminDashboard.pending")}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            {order.time}
                          </p>
                        </div>

                        {/* Total */}
                        <div className="col-span-3 text-right">
                          <p className="font-mono text-sm font-medium">
                            €{order.total.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {order.items} items
                          </p>
                        </div>

                        {/* Action */}
                        <div className="col-span-2 text-right">
                          <Link to="/admin/orders">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-sm border-border/60"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                      <Package className="h-8 w-8 mb-2" />
                      <span className="text-xs">{t("adminDashboard.noPendingOrders")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (30%) - Alerts & Stats */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
              {/* Critical Stock */}
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <h2 className="flex-none text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> {t("adminDashboard.criticalStock")}
                </h2>
                <div className="flex-1 bg-card border border-red-200/60 dark:border-red-900/40 rounded-sm flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 sticky top-0 z-10">
                        <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                          <th className="px-3 py-1 font-medium select-none">
                            {t("adminStock.columns.product")}
                          </th>
                          <th className="px-2 py-1 font-medium text-right select-none">
                            {t("adminStock.columns.currentStock")}
                          </th>
                          <th className="px-2 py-1 font-medium text-right select-none">
                            {t("common.status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockAlerts.map((item) => {
                          let rowClass = "hover:bg-muted/30";
                          let badgeClass = "text-muted-foreground border-border";
                          let label = t("adminDashboard.stockStatus.normal");

                          if (item.status === "out") {
                            rowClass = "bg-red-50/60 dark:bg-red-900/10 hover:bg-red-100/60 dark:hover:bg-red-900/20";
                            badgeClass = "bg-red-100 text-red-700 border-red-200";
                            label = t("adminDashboard.stockStatus.out");
                          } else if (item.status === "critical") {
                            rowClass = "bg-red-50/30 dark:bg-red-900/5 hover:bg-red-100/40 dark:hover:bg-red-900/15";
                            badgeClass = "bg-red-50 text-red-600 border-red-100";
                            label = t("adminDashboard.stockStatus.critical");
                          } else if (item.status === "low") {
                            rowClass = "bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20";
                            badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                            label = t("adminDashboard.stockStatus.low");
                          }

                          return (
                            <tr
                              key={item.id}
                              className={cn(
                                "border-b border-border/40 last:border-0 transition-colors",
                                rowClass,
                              )}
                            >
                              <td className="px-3 py-1.5 align-middle">
                                <div
                                  className="font-medium text-foreground/90 line-clamp-1"
                                  title={item.product}
                                >
                                  {item.product}
                                </div>
                                <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                  {item.id}
                                </div>
                              </td>
                              <td className="px-2 py-1.5 align-middle text-right">
                                <span
                                  className={cn(
                                    "font-mono font-bold text-sm",
                                    item.status === "out" || item.status === "critical"
                                      ? "text-red-600"
                                      : item.status === "low"
                                        ? "text-amber-600"
                                        : "text-foreground/80",
                                  )}
                                >
                                  {item.stock}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 align-middle text-right">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "h-4 px-1 text-[9px] rounded-sm uppercase tracking-wider justify-center min-w-[60px]",
                                    badgeClass,
                                  )}
                                >
                                  {label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Link to="/admin/stock">
                    <div className="flex-none p-2 text-center border-t border-border/40 bg-muted/10 hover:bg-muted/20 cursor-pointer transition-colors">
                      <span className="text-[10px] font-medium text-red-600">
                        {t("adminDashboard.inventoryManagement")}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex-none space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("adminDashboard.quickAccess")}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start h-10 px-3 rounded-sm border-border/60 hover:border-primary/50 hover:bg-primary/5 group"
                    asChild
                  >
                    <Link to="/admin/reports">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs font-medium truncate">
                        {t("adminDashboard.reports")}
                      </span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-10 px-3 rounded-sm border-border/60 hover:border-blue-500/50 hover:bg-blue-500/5 group"
                    asChild
                  >
                    <Link to="/admin/products">
                      <Package className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                      <span className="text-xs font-medium truncate">
                        {t("adminDashboard.catalog")}
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Mini Stat */}
              <div className="flex-none bg-muted/20 border border-border/60 rounded-sm p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("adminDashboard.efficiency")}
                    </span>
                  </div>
                  <span className="text-[10px] text-green-600 font-medium bg-green-500/10 px-1.5 rounded-full">
                    ↑ 1.4%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono">94.2%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {t("adminDashboard.efficiencyDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
