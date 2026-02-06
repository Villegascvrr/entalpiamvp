import { Bell, Calendar, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Simulated LME copper price
  const lmeCopper = 8432.50;
  const lmeChange = 2.3;

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between flex-shrink-0">
      {/* Left side - Date and market info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{today}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">LME Cobre:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground">
              ${lmeCopper.toLocaleString("es-ES")} USD/t
            </span>
            <Badge 
              variant="outline" 
              className={`gap-1 border-0 text-xs ${lmeChange >= 0 ? "text-market-up bg-market-up/10" : "text-market-down bg-market-down/10"}`}
            >
              {lmeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {lmeChange >= 0 ? "+" : ""}{lmeChange}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-4 w-4" />
          <span className="text-xs">Actualizar Precios</span>
        </Button>
        <div className="h-4 w-px bg-border" />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
      </div>
    </header>
  );
}
