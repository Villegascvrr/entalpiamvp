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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

const customerNav: NavItem[] = [
  { title: "Panel Principal", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Crear Pedido", icon: Package, href: "/order/new" },
  { title: "Mis Pedidos", icon: ClipboardList, href: "/orders" },
];

const adminNav: NavItem[] = [
  { title: "Gestión Precios", icon: TrendingUp, href: "/admin/pricing" },
  { title: "Gestión Stock", icon: Warehouse, href: "/admin/stock" },
  { title: "Pedidos Recibidos", icon: FileText, href: "/admin/orders" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isInterno } = useRole();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
        isActive(item.href)
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 flex-shrink-0 transition-colors",
        isActive(item.href) ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
      )} />
      {!collapsed && (
        <span className="font-medium text-sm">{item.title}</span>
      )}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground text-sm">ENTALPIA</h1>
              <p className="text-xs text-sidebar-muted">Plataforma Comercial</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center mx-auto">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Role Switcher */}
      {!collapsed && (
        <div className="p-3">
          <RoleSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {/* Customer Section */}
        {!collapsed && (
          <p className="px-3 py-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
            Operaciones
          </p>
        )}
        {customerNav.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}

        {/* Admin Section */}
        {isInterno && (
          <>
            <div className="pt-4">
              {!collapsed && (
                <p className="px-3 py-2 text-xs font-medium text-sidebar-muted uppercase tracking-wider">
                  Administración
                </p>
              )}
              {adminNav.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-3 space-y-2">
        {/* User Info */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {isInterno ? "Antonio García" : "Distribuidor Demo"}
              </p>
              <p className="text-xs text-sidebar-muted truncate">
                {isInterno ? "ENTALPIA Europe" : "Cliente Ejemplo S.L."}
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed ? "px-0" : ""
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
