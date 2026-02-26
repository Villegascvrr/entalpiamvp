import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useActor } from "@/contexts/ActorContext";
import {
  Activity,
  ArrowRight,
  Construction,
  FileText,
  LogOut,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CommercialDashboard() {
  const { session, signOut } = useActor();
  const { t } = useTranslation();

  const quickLinks = [
    {
      title: t("adminOrders.title"),
      description: t("sidebar.commercial.orders"),
      icon: FileText,
      href: "/commercial/orders",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: t("customers.title"),
      description: t("customers.subtitle"),
      icon: Users,
      href: "/commercial/customers",
      color: "text-sky-600",
      bg: "bg-sky-500/10",
    },
    {
      title: t("adminPricing.title"),
      description: t("sidebar.commercial.pricing"),
      icon: TrendingUp,
      href: "/admin/pricing",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("commercialDashboard.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {session?.name ?? "Comercial"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-2 text-muted-foreground hover:text-red-500 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            {t("auth.signOut")}
          </Button>
        </div>

        {/* Construction Banner */}
        <div className="relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Activity className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {t("auth.demoComingSoon")}
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-700 text-xs font-medium">
                  <Construction className="h-3 w-3" />
                  {t("auth.demoComingSoon")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {t("adminDashboard.quickAccess")}
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
