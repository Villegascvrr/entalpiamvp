import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  TrendingUp,
  Warehouse,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  History,
  Activity,
  LogOut,
  Users,
  Truck,
  ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useActor, ActorRole } from "@/contexts/ActorContext";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

// ── Role-based Navigation Config ──

const NAV_CONFIG: Record<ActorRole, { title: string; items: NavItem[] }> = {
  customer: {
    title: "Mi Cuenta",
    items: [
      { title: "Panel Principal", icon: LayoutDashboard, href: "/dashboard" },
      { title: "Crear Pedido", icon: Package, href: "/order/new" },
      { title: "Mis Pedidos", icon: ClipboardList, href: "/orders" },
      { title: "Histórico", icon: History, href: "/orders/history" },
    ]
  },
  commercial: {
    title: "Gestión Comercial",
    items: [
      { title: "Dashboard Comercial", icon: Activity, href: "/dashboard" },
      { title: "Pedidos Pendientes", icon: FileText, href: "/commercial/orders" },
      { title: "Clientes", icon: Users, href: "/commercial/customers" },
      { title: "Gestión Precios", icon: TrendingUp, href: "/admin/pricing" },
    ]
  },
  logistics: {
    title: "Logística",
    items: [
      { title: "Panel Logística", icon: Warehouse, href: "/dashboard" },
      { title: "Preparación", icon: Package, href: "/logistics/prep" },
      { title: "Envíos", icon: Truck, href: "/logistics/shipping" },
      { title: "Albaranes", icon: ScrollText, href: "/logistics/delivery-notes" },
    ]
  },
  admin: {
    title: "Administración",
    items: [
      { title: "Resumen Global", icon: LayoutDashboard, href: "/dashboard" },
      { title: "Pedidos (Todo)", icon: FileText, href: "/admin/orders" },
      { title: "Stock", icon: Warehouse, href: "/admin/stock" },
      { title: "Precios", icon: TrendingUp, href: "/admin/pricing" },
      // Admin also sees useful links from others? For now, keep it focused.
      { title: "Clientes", icon: Users, href: "/commercial/customers" },
    ]
  }
};

export function AppSidebar({ className, onNavigate }: { className?: string, onNavigate?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { session, signOut } = useActor();

  const isActive = (path: string) => location.pathname === path;

  // Determine navigation based on role
  const role = session?.role || "customer";
  // Fallback to customer if role not found in config (safety)
  const currentNav = NAV_CONFIG[role] || NAV_CONFIG["customer"];

  const NavItem = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded transition-all duration-200 group text-[13px]",
        isActive(item.href)
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors",
        isActive(item.href) ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
      )} />
      {!collapsed && (
        <span className="font-medium">{item.title}</span>
      )}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        "bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 h-full",
        collapsed ? "w-14" : "w-56",
        className
      )}
    >
      {/* Header */}
      <div className="px-3 py-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-sidebar-primary flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground text-[13px] tracking-tight">ENTALPIA</h1>
              <p className="text-[10px] text-sidebar-muted uppercase tracking-wider">
                {role}
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-7 w-7 rounded bg-sidebar-primary flex items-center justify-center mx-auto">
            <Package className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />



      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p className="px-2.5 py-1.5 text-[10px] font-semibold text-sidebar-muted uppercase tracking-wider">
            {currentNav.title}
          </p>
        )}
        {currentNav.items.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-2.5 space-y-2">
        <div className={cn(
          "flex items-center gap-2.5 px-2 py-1.5 rounded",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-[12px] font-medium text-sidebar-foreground truncate">
                {session?.name ?? "Sin sesión"}
              </p>
              <p className="text-[10px] text-sidebar-muted truncate">
                {session?.email ?? ""}
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full justify-center text-sidebar-muted hover:text-red-400 hover:bg-red-500/10 h-7",
            collapsed ? "px-0" : ""
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && <span className="text-[11px] ml-1.5">Cerrar Sesión</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent h-7",
            collapsed ? "px-0" : ""
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[11px]">Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
