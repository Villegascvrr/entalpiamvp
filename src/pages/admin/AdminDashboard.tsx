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
  Plus,
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
        {/* 1. PAGE HEADER */}
        <div className="flex-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-6 bg-white border-b border-[#ECEFF3]">
          <div className="flex flex-col gap-1 text-left">
            <h1 className="text-[24px] font-[600] font-[Inter] text-foreground tracking-tight">
              Operations Overview
            </h1>
            <p className="text-[14px] text-muted-foreground font-[Inter]">
              Monitor active orders, stock alerts and operational activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 flex flex-col text-right sm:text-left">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                {t("adminDashboard.volumeToday")}
              </span>
              <span className="text-sm font-mono font-bold text-foreground">
                €{todayVolume.toLocaleString("es-ES", { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 flex flex-col text-right sm:text-left">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                {t("adminDashboard.lmeCopper")}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-mono font-bold text-foreground">
                  ${lmeHistory[0].value.toLocaleString("en-US")}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono font-medium",
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

        {/* 2. MAIN CONTENT AREA */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden bg-slate-50/50">
          
          {/* KPI Cards */}
          <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#ECEFF3] rounded-[10px] p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[14px] text-muted-foreground mb-1">
                Pending Orders
              </span>
              <span className="text-[20px] font-semibold text-foreground">
                {pendingOrders.length}
              </span>
            </div>
            <div className="bg-white border border-[#ECEFF3] rounded-[10px] p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[14px] text-muted-foreground mb-1">
                Critical Stock Alerts
              </span>
              <span className="text-[20px] font-semibold text-amber-600">
                {criticalStock}
              </span>
            </div>
            <div className="bg-white border border-[#ECEFF3] rounded-[10px] p-4 flex flex-col justify-center shadow-sm">
              <span className="text-[14px] text-muted-foreground mb-1">
                In Transit
              </span>
              <span className="text-[20px] font-semibold text-blue-600">
                12
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0 pb-2">
            {/* LEFT COLUMN */}
            <div className="xl:col-span-8 flex flex-col gap-4 min-h-0">
              <div className="flex-none flex items-center justify-between">
                <h2 className="text-[16px] font-[600] font-[Inter] text-foreground">
                  Operation queue
                </h2>
                <Link to="/admin/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 hover:bg-muted/50"
                  >
                    {t("adminDashboard.viewAll")} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="flex-1 bg-white border border-[#ECEFF3] rounded-[12px] flex flex-col shadow-sm overflow-hidden min-h-0">
                <div className="flex-none grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 border-b border-[#ECEFF3] text-[12px] font-medium text-muted-foreground">
                  <div className="col-span-5">Reference</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-3 text-right">Total</div>
                  <div className="col-span-1 text-right"></div>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin">
                  {pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-[#ECEFF3] last:border-0 hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="col-span-5 flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {order.id}
                          </span>
                          <span className="text-xs text-muted-foreground truncate" title={order.customer}>
                            {order.customer}
                          </span>
                        </div>
                        <div className="col-span-3 flex flex-col items-start gap-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-sm bg-amber-50 text-amber-700 border-amber-200">
                            {t("adminDashboard.pending")}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {order.time}
                          </span>
                        </div>
                        <div className="col-span-3 text-right flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            €{order.total.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.items} items
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          <Link to="/admin/orders">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-8 w-8 mb-2 opacity-20" />
                      <span className="text-sm">No active operations in queue</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="xl:col-span-4 flex flex-col gap-6 min-h-0">
              {/* Quick Actions */}
              <div className="flex-none flex flex-col gap-4">
                <h2 className="text-[16px] font-[600] font-[Inter] text-foreground">
                  Quick actions
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10 justify-start px-3 bg-white shadow-sm" asChild>
                    <Link to="/admin/reports">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-xs">Reports</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-10 justify-start px-3 bg-white shadow-sm" asChild>
                    <Link to="/admin/products">
                      <Package className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-xs">Catalog</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-10 justify-start px-3 bg-white shadow-sm" asChild>
                    <Link to="/admin/orders/new">
                      <Plus className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-xs">Create Order</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-10 justify-start px-3 bg-white shadow-sm" asChild>
                    <Link to="/admin/stock">
                      <Activity className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-xs">Adjust Stock</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Efficiency */}
              <div className="flex-none flex flex-col gap-4">
                <h2 className="text-[16px] font-[600] font-[Inter] text-foreground">
                  Efficiency
                </h2>
                <div className="bg-white border border-[#ECEFF3] rounded-[12px] p-4 flex flex-col shadow-sm">
                  <span className="text-[28px] font-bold text-foreground">
                    94.2%
                  </span>
                  <span className="text-[13px] text-muted-foreground mt-1">
                    On-time deliveries (week)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
