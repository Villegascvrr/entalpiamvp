import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceDisplayProps {
  value: number;
  currency?: string;
  unit?: string;
  change?: {
    percentage: number;
    direction: "up" | "down" | "neutral";
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ 
  value, 
  currency = "€",
  unit = "/kg",
  change,
  size = "md",
  className 
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("price-display", sizeClasses[size])}>
        {currency}{value.toFixed(2)}
      </span>
      <span className="text-xs text-muted-foreground">{unit}</span>
      {change && (
        <span className={cn(
          "inline-flex items-center gap-0.5 text-xs font-medium",
          change.direction === "up" && "price-up",
          change.direction === "down" && "price-down",
          change.direction === "neutral" && "text-muted-foreground"
        )}>
          {change.direction === "up" && <TrendingUp className="h-3 w-3" />}
          {change.direction === "down" && <TrendingDown className="h-3 w-3" />}
          {change.direction === "neutral" && <Minus className="h-3 w-3" />}
          {change.percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

interface PriceTickerProps {
  label: string;
  value: number;
  change: number;
  className?: string;
}

export function PriceTicker({ label, value, change, className }: PriceTickerProps) {
  const direction = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-3 py-2 rounded-md border",
      direction === "up" && "bg-market-up/5 border-market-up/20",
      direction === "down" && "bg-market-down/5 border-market-down/20",
      direction === "neutral" && "bg-muted border-border",
      className
    )}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="font-mono font-semibold">${value.toFixed(2)}</span>
      <span className={cn(
        "text-xs font-medium font-mono",
        direction === "up" && "text-market-up",
        direction === "down" && "text-market-down",
        direction === "neutral" && "text-muted-foreground"
      )}>
        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
      </span>
    </div>
  );
}
