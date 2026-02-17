import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useActor } from "@/contexts/ActorContext";
import {
  ArrowRight,
  Construction,
  LogOut,
  Package,
  ScrollText,
  Truck,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  {
    title: "Preparación",
    description: "Gestiona la preparación de pedidos",
    icon: Package,
    href: "/logistics/prep",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    title: "Envíos",
    description: "Control de envíos y rutas",
    icon: Truck,
    href: "/logistics/shipping",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Albaranes",
    description: "Documentos de entrega",
    icon: ScrollText,
    href: "/logistics/delivery-notes",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
];

export default function LogisticsDashboard() {
  const { session, signOut } = useActor();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Panel de Logística
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bienvenido, {session?.name ?? "Operador"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-2 text-muted-foreground hover:text-red-500 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            Cambiar Perfil
          </Button>
        </div>

        {/* Construction Banner */}
        <div className="relative overflow-hidden rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Warehouse className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Módulo en Desarrollo
              </h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                El panel de logística está en construcción. Próximamente podrás
                gestionar preparación, envíos y albaranes desde aquí.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-medium">
                  <Construction className="h-3 w-3" />
                  En construcción
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group block rounded-xl border border-border/60 bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${link.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <link.icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground">
                      {link.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
