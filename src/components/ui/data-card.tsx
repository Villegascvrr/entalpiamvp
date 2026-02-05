import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function DataCard({ 
  title, 
  subtitle, 
  children, 
  action,
  className,
  headerClassName,
  bodyClassName
}: DataCardProps) {
  return (
    <div className={cn("industrial-card", className)}>
      <div className={cn("industrial-card-header flex items-center justify-between", headerClassName)}>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("industrial-card-body", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, change, icon, className }: MetricCardProps) {
  return (
    <div className={cn("industrial-card p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold mt-1 price-display">{value}</p>
          {change && (
            <div className={cn(
              "mt-1 text-xs font-medium",
              change.trend === "up" && "price-up",
              change.trend === "down" && "price-down",
              change.trend === "neutral" && "text-muted-foreground"
            )}>
              {change.trend === "up" && "↑ "}
              {change.trend === "down" && "↓ "}
              {change.value}
            </div>
          )}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
