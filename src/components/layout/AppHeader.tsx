import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Info,
  Menu,
  TrendingDown,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AppSidebar } from "./AppSidebar";

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: t("notifications.orderShipped"),
      message: t("notifications.orderShippedMsg"),
      time: t("notifications.timeAgo2min"),
      read: false,
      type: "order",
    },
    {
      id: 2,
      title: t("notifications.stockAlert"),
      message: t("notifications.stockAlertMsg"),
      time: t("notifications.timeAgo1h"),
      read: false,
      type: "alert",
    },
    {
      id: 3,
      title: t("notifications.priceUpdate"),
      message: t("notifications.priceUpdateMsg"),
      time: t("notifications.timeAgoYesterday"),
      read: true,
      type: "info",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const [lmeData, setLmeData] = useState({
    price: 8432.5,
    change: 2.3,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Info className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const locale = i18n.language === "es" ? "es-ES" : "en-US";
  const today = new Date().toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-14 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 w-full">
      {/* Left side - Date and market info */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 border-0 w-64 bg-sidebar text-sidebar-foreground"
            >
              <AppSidebar
                className="border-0 w-full"
                onNavigate={() => document.body.click()}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="capitalize">{today}</span>
        </div>
        <div className="hidden md:block h-4 w-px bg-border" />
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline">
            {t("header.lmeCopper")}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground text-sm md:text-base">
              $
              {lmeData.price.toLocaleString("es-ES", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border-0 text-[10px] md:text-xs px-1.5",
                lmeData.change >= 0
                  ? "text-market-up bg-market-up/10"
                  : "text-market-down bg-market-down/10",
              )}
            >
              {lmeData.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {lmeData.change >= 0 ? "+" : ""}
              {lmeData.change}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
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
              <h4 className="font-semibold text-sm">{t("header.notifications")}</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-0.5 text-xs text-muted-foreground hover:text-primary"
                  onClick={markAllAsRead}
                >
                  {t("header.markAllRead")}
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t("header.noNotifications")}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors relative group ${!notification.read ? "bg-muted/10" : ""}`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center bg-background border shadow-sm shrink-0`}
                        >
                          {getIcon(notification.type)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-sm ${!notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}
                            >
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
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground h-8"
              >
                {t("header.viewFullHistory")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
