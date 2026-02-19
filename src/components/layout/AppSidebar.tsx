import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  TrendingUp,
  Truck,
  User,
  Users,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { ActorRole, useActor } from "@/contexts/ActorContext";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  active?: boolean;
}

// ── Role-based Navigation Config ──

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const NAV_CONFIG: Record<ActorRole, NavGroup[]> = {
  customer: [
    {
      title: "Cuenta",
      items: [
        { title: "Panel Principal", icon: LayoutDashboard, href: "/dashboard" },
        { title: "Histórico", icon: History, href: "/orders/history" },
      ],
    },
    {
      title: "Operaciones",
      items: [
        { title: "Crear Pedido", icon: Package, href: "/order/new" },
        { title: "Mis Pedidos", icon: ClipboardList, href: "/orders" },
      ],
    },
  ],
  commercial: [
    {
      title: "Analítica",
      items: [
        { title: "Dashboard", icon: Activity, href: "/dashboard" },
        { title: "Precios", icon: TrendingUp, href: "/admin/pricing" },
      ],
    },
    {
      title: "Operaciones",
      items: [
        { title: "Pedidos", icon: FileText, href: "/commercial/orders" },
        { title: "Clientes", icon: Users, href: "/commercial/customers" },
      ],
    },
  ],
  logistics: [
    {
      title: "Analítica",
      items: [
        { title: "Panel Logística", icon: Warehouse, href: "/dashboard" },
      ],
    },
    {
      title: "Operaciones",
      items: [
        { title: "Preparación", icon: Package, href: "/logistics/prep" },
        { title: "Envíos", icon: Truck, href: "/logistics/shipping" },
        {
          title: "Albaranes",
          icon: ScrollText,
          href: "/logistics/delivery-notes",
        },
      ],
    },
  ],
  admin: [
    {
      title: "Analítica",
      items: [
        { title: "Resumen Global", icon: LayoutDashboard, href: "/dashboard" },
        { title: "Precios", icon: TrendingUp, href: "/admin/pricing" },
      ],
    },
    {
      title: "Operaciones",
      items: [
        {
          title: "Pedidos",
          icon: FileText,
          href: "/admin/orders",
        },
        {
          title: "Stock",
          icon: Warehouse,
          href: "/admin/stock",
          active: false,
        },
        {
          title: "Clientes",
          icon: Users,
          href: "/commercial/customers",
        },
      ],
    },
  ],
};

export function AppSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { session, signOut } = useActor();

  const isActive = (path: string) => location.pathname === path;

  // Determine navigation based on role
  const role = session?.role || "customer";
  // Fallback to customer if role not found in config (safety)
  const navGroups = NAV_CONFIG[role] || NAV_CONFIG["customer"];

  const NavItem = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group text-[13px] border border-transparent",
        isActive(item.href)
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-sidebar-border"
          : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors opacity-70 group-hover:opacity-100",
          isActive(item.href)
            ? "text-sidebar-primary opacity-100"
            : "text-sidebar-muted group-hover:text-sidebar-foreground",
        )}
      />
      {!collapsed && <span className="leading-none">{item.title}</span>}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        "bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 h-full",
        collapsed ? "w-14" : "w-60",
        className,
      )}
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
              <Package className="h-4 w-4 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-sm tracking-tight leading-none">
                ENTALPIA
              </h1>
              <p className="text-[10px] text-sidebar-muted uppercase tracking-wider font-medium mt-0.5">
                {role === "admin" ? "Administración" : role}
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-md bg-sidebar-primary/10 flex items-center justify-center mx-auto border border-sidebar-primary/20">
            <Package className="h-4 w-4 text-sidebar-primary" />
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin">
        {navGroups.map((group, index) => (
          <div key={index} className="space-y-1">
            {!collapsed && group.title && (
              <p className="px-3 mb-2 text-[10px] font-bold text-sidebar-muted/70 uppercase tracking-widest">
                {group.title}
              </p>
            )}
            {group.items.filter((item) => item.active ?? true).map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        ))}
      </nav>

      <Separator className="bg-sidebar-border mx-4" />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <div
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-md bg-sidebar-accent/30 border border-sidebar-border",
            collapsed ? "justify-center px-0 bg-transparent border-0" : "",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[12px] font-medium text-sidebar-foreground truncate">
                {session?.name ?? "Usuario"}
              </p>
              <p className="text-[10px] text-sidebar-muted truncate font-mono">
                {session?.email ?? ""}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={cn(
              "w-full justify-start text-sidebar-muted hover:text-red-400 hover:bg-red-500/10 h-8",
              collapsed ? "justify-center px-0" : "px-2",
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && (
              <span className="text-[11px] ml-2 font-medium">
                Cerrar Sesión
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-start text-sidebar-muted hover:text-sidebar-foreground h-8",
              collapsed ? "justify-center px-0" : "px-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="text-[11px] ml-2 font-medium">
                  Colapsar Menú
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
