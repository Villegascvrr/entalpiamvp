import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Package,
  ArrowRight,
  Clock,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  FileEdit,
  RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Datos simulados ENTALPIA
const lmeData = {
  price: 8432.50,
  change: 2.3,
  updated: "08:30 CET"
};

const quickProducts = [
  { id: "ENT-CU-15", name: "Tubo 15mm Rollo", price: 245.80, change: 2.3, stock: "disponible" },
  { id: "ENT-CU-18", name: "Tubo 18mm Rollo", price: 312.50, change: 1.8, stock: "disponible" },
  { id: "ENT-CU-22", name: "Tubo 22mm Rollo", price: 198.90, change: 2.1, stock: "disponible" },
  { id: "ENT-CU-28", name: "Tubo 28mm Barra", price: 89.40, change: 1.5, stock: "bajo" },
  { id: "ENT-CU-35", name: "Tubo 35mm Barra", price: 142.60, change: -0.5, stock: "bajo" },
];

const recentOrders = [
  { id: "PED-2024-0142", date: "Hoy 09:45", status: "procesando", total: 4250.00 },
  { id: "PED-2024-0138", date: "Ayer", status: "enviado", total: 8920.50 },
  { id: "PED-2024-0131", date: "12/01", status: "entregado", total: 2180.00 },
];

const statusStyles = {
  procesando: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  enviado: "bg-primary/10 text-primary border-primary/20",
  entregado: "bg-green-500/10 text-green-600 border-green-500/20",
};

export default function CustomerDashboard() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-2">

        {/* ═══════════════════════════════════════════════════════════
            HERO SECTION - Acción Principal Destacada
        ═══════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-4 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Buenos días, Distribuidor Demo
              </h1>
              <p className="text-muted-foreground mt-1">
                Precios actualizados hoy a las {lmeData.updated}
              </p>

              {/* LME Context - Simple */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-2 py-1 bg-background/80 rounded border">
                  <div className="h-5 w-5 rounded bg-amber-500/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-amber-600">Cu</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LME Cobre</p>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold">${lmeData.price.toLocaleString()}</span>
                      <span className={cn(
                        "text-xs font-mono flex items-center",
                        lmeData.change > 0 ? "text-green-600" : "text-red-500"
                      )}>
                        {lmeData.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {lmeData.change > 0 ? "+" : ""}{lmeData.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="flex gap-3 w-full md:w-auto">
              <Link to="/order/new" state={{ openCustomDialog: true }} className="flex-1 md:flex-none">
                <Button size="sm" variant="outline" className="h-10 px-3 md:px-4 text-sm gap-2 border-primary/30 hover:bg-primary/5 text-primary w-full md:w-auto">
                  <FileEdit className="h-4 w-4" />
                  <span className="md:hidden">Personalizado</span>
                  <span className="hidden md:inline">Solicitar Personalizado</span>
                </Button>
              </Link>
              <Link to="/order/new" className="flex-1 md:flex-none">
                <Button size="sm" className="h-10 px-3 md:px-6 text-sm gap-2 shadow-sm w-full md:w-auto">
                  <Package className="h-4 w-4" />
                  <span className="md:hidden">Pedido</span>
                  <span className="hidden md:inline">Crear Nuevo Pedido</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            GRID PRINCIPAL - 2 Columnas Claras
        ═══════════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════════
            GRID PRINCIPAL - Responsive (1 col móvil, 3 cols desktop)
        ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA - Precios Rápidos */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <DataCard
              title="Precios del Día"
              subtitle="5 productos más solicitados"
              action={
                <Link to="/order/new">
                  <Button variant="outline" size="sm" className="gap-1">
                    <span className="md:hidden">Catálogo</span>
                    <span className="hidden md:inline">Ver Catálogo Completo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            >
              <div className="space-y-1">
                {quickProducts.map(product => (
                  <div
                    key={product.id}
                    className={cn(
                      "flex items-center justify-between py-3 px-3 md:px-4 rounded-lg hover:bg-muted/50 transition-colors",
                      product.stock === "bajo" && "bg-amber-500/5"
                    )}
                  >
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="hidden md:inline-block font-mono text-sm text-muted-foreground w-24">{product.id}</span>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                        <span className="font-medium text-sm md:text-base">{product.name}</span>
                        {product.stock === "bajo" && (
                          <Badge variant="outline" className="w-fit text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1 py-0 h-5">
                            Stock Bajo
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="text-right">
                        <span className="font-mono text-base md:text-lg font-semibold">€{product.price.toFixed(2)}</span>
                        <div className={cn(
                          "font-mono text-[10px] md:text-sm",
                          product.change > 0 ? "text-green-600" : product.change < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {product.change > 0 ? "↑" : product.change < 0 ? "↓" : ""}{Math.abs(product.change)}%
                        </div>
                      </div>
                      <Link to="/order/new">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 md:h-9 md:w-auto md:px-3 gap-1">
                          <ArrowRight className="h-4 w-4" />
                          <span className="hidden md:inline">Pedir</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>

            {/* Info de Ayuda */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/50 border text-sm">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">¿Cómo funciona?</strong> Haz clic en "Crear Nuevo Pedido" para configurar tu pedido.
                  Podrás añadir productos, ajustar cantidades y revisar antes de confirmar.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - Estado Pedidos */}
          <div className="space-y-6">
            {/* Mis Pedidos */}
            <DataCard
              title="Mis Pedidos"
              action={
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Ver Todos
                  </Button>
                </Link>
              }
            >
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">€{order.total.toFixed(2)}</p>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] capitalize", statusStyles[order.status as keyof typeof statusStyles])}
                      >
                        {order.status === "procesando" && <Clock className="h-2.5 w-2.5 mr-1" />}
                        {order.status === "enviado" && <Truck className="h-2.5 w-2.5 mr-1" />}
                        {order.status === "entregado" && <CheckCircle className="h-2.5 w-2.5 mr-1" />}
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>

            {/* Accesos Rápidos */}
            <DataCard title="Acciones Rápidas">
              <div className="space-y-2">
                <Link to="/order/new" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <Package className="h-4 w-4" />
                    Nuevo Pedido
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => {
                    toast.success("Pedido PED-2024-0142 duplicado", {
                      description: "Los artículos se han añadido a tu nuevo pedido.",
                    });
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Repetir Último Pedido
                </Button>
                <Link to="/orders" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10">
                    <ClipboardList className="h-4 w-4" />
                    Ver Mis Pedidos
                  </Button>
                </Link>
              </div>
            </DataCard>

            {/* Próxima Entrega */}
            <DataCard
              title="Próxima Entrega"
              className="bg-primary/5 border-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">PED-2024-0138</p>
                  <p className="text-sm text-muted-foreground">Llegada estimada: Mañana</p>
                </div>
              </div>
            </DataCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
