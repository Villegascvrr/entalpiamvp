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

// Vista Cliente - Workflow de compra simplificado
const clienteNav: NavItem[] = [
  { title: "Panel Principal", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Crear Pedido", icon: Package, href: "/order/new" },
  { title: "Mis Pedidos", icon: ClipboardList, href: "/orders" },
  { title: "Histórico", icon: History, href: "/orders/history" },
];

// Vista Interna (Antonio) - Control operativo
const internoNav: NavItem[] = [
  { title: "Resumen Operativo", icon: Activity, href: "/admin/dashboard" },
  { title: "Pedidos Recibidos", icon: FileText, href: "/admin/orders" },
  { title: "Gestión Precios", icon: TrendingUp, href: "/admin/pricing" },
  { title: "Gestión Stock", icon: Warehouse, href: "/admin/stock" },
];

export function AppSidebar({ className, onNavigate }: { className?: string, onNavigate?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isInterno } = useRole();

  const isActive = (path: string) => location.pathname === path;

  // Seleccionar navegación según rol
  const navItems = isInterno ? internoNav : clienteNav;
  const sectionTitle = isInterno ? "Control Operativo" : "Operaciones";

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
      {/* Header - Compact */}
      <div className="px-3 py-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-sidebar-primary flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground text-[13px] tracking-tight">ENTALPIA</h1>
              <p className="text-[10px] text-sidebar-muted uppercase tracking-wider">
                {isInterno ? "Operaciones" : "Comercial"}
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

      {/* Role Switcher - Compact */}
      {!collapsed && (
        <div className="px-2.5 py-2.5">
          <RoleSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p className="px-2.5 py-1.5 text-[10px] font-semibold text-sidebar-muted uppercase tracking-wider">
            {sectionTitle}
          </p>
        )}
        {navItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer - Compact */}
      <div className="p-2.5 space-y-2">
        {/* User Info */}
        <div className={cn(
          "flex items-center gap-2.5 px-2 py-1.5 rounded",
          collapsed ? "justify-center" : ""
        )}>
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[12px] font-medium text-sidebar-foreground truncate">
                {isInterno ? "Antonio García" : "Distribuidor Demo"}
              </p>
              <p className="text-[10px] text-sidebar-muted truncate">
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
