import { useState } from "react";
import { Bell, Calendar, RefreshCw, TrendingUp, TrendingDown, Check, X, Info, Package, Truck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock Notifications
const initialNotifications = [
  {
    id: 1,
    title: "Pedido Enviado",
    message: "Tu pedido #PED-2024-0150 ha salido del almacén.",
    time: "Hace 2 min",
    read: false,
    type: "order"
  },
  {
    id: 2,
    title: "Alerta de Stock",
    message: "Tubo Cobre 15mm está por debajo del mínimo.",
    time: "Hace 1 hora",
    read: false,
    type: "alert"
  },
  {
    id: 3,
    title: "Actualización de Precios",
    message: "Nuevas tarifas LME aplicadas correctamente.",
    time: "Ayer, 08:30",
    read: true,
    type: "info"
  }
];

export function AppHeader() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulated LME copper price state
  const [lmeData, setLmeData] = useState({
    price: 8432.50,
    change: 2.3
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleUpdatePrices = () => {
    setIsUpdating(true);
    toast.info("Actualizando precios de mercado...", {
      description: "Conectando con LME (London Metal Exchange)...",
    });

    setTimeout(() => {
      // Simulate new price
      const randomChange = (Math.random() * 2 - 1).toFixed(2); // Random between -1 and 1
      const newPrice = lmeData.price + (Math.random() * 100 - 50);

      setLmeData({
        price: newPrice,
        change: parseFloat(randomChange)
      });

      setIsUpdating(false);
      toast.success("Precios actualizados correctamente", {
        description: `LME Cobre: $${newPrice.toLocaleString("es-ES", { maximumFractionDigits: 2 })} USD/t`,
      });

      // Add a notification about the update
      const newNotification = {
        id: Date.now(),
        title: "Precios Actualizados",
        message: `LME Cobre actualizado a $${newPrice.toLocaleString("es-ES", { maximumFractionDigits: 2 })}.`,
        time: "Ahora mismo",
        read: false,
        type: "info"
      };
      setNotifications([newNotification, ...notifications]);

    }, 2000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return <Truck className="h-4 w-4 text-blue-500" />;
      case "alert": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info": return <Info className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });



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
              ${lmeData.price.toLocaleString("es-ES", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USD/t
            </span>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-0 text-xs",
                lmeData.change >= 0 ? "text-market-up bg-market-up/10" : "text-market-down bg-market-down/10"
              )}
            >
              {lmeData.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {lmeData.change >= 0 ? "+" : ""}{lmeData.change}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleUpdatePrices}
          disabled={isUpdating}
        >
          <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
          <span className="text-xs">{isUpdating ? "Actualizando..." : "Actualizar Precios"}</span>
        </Button>
        <div className="h-4 w-px bg-border" />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
              <h4 className="font-semibold text-sm">Notificaciones</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-0.5 text-xs text-muted-foreground hover:text-primary"
                  onClick={markAllAsRead}
                >
                  Marcar leídas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors relative group ${!notification.read ? 'bg-muted/10' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center bg-background border shadow-sm shrink-0`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => removeNotification(notification.id, e)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {!notification.read && (
                        <span className="absolute top-4 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t bg-muted/10">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8">
                Ver historial completo
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
