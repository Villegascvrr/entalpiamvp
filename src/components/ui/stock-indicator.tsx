import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  quantity: number;
  unit?: string;
  threshold?: {
    low: number;
    out: number;
  };
  showLabel?: boolean;
  className?: string;
}

export function StockIndicator({ 
  quantity, 
  unit = "units",
  threshold = { low: 100, out: 10 },
  showLabel = true,
  className 
}: StockIndicatorProps) {
  const getStatus = () => {
    if (quantity <= threshold.out) return "out";
    if (quantity <= threshold.low) return "low";
    return "available";
  };

  const status = getStatus();

  const statusConfig = {
    available: {
      label: "In Stock",
      className: "stock-available",
      dotClassName: "bg-status-available",
    },
    low: {
      label: "Low Stock",
      className: "stock-low",
      dotClassName: "bg-status-low",
    },
    out: {
      label: "Out of Stock",
      className: "stock-out",
      dotClassName: "bg-status-out",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("h-2 w-2 rounded-full", config.dotClassName)} />
      <span className={cn("font-mono text-sm", config.className)}>
        {quantity.toLocaleString()} {unit}
      </span>
      {showLabel && (
        <span className={cn("text-xs", config.className)}>
          ({config.label})
        </span>
      )}
    </div>
  );
}

interface StockBadgeProps {
  status: "available" | "low" | "out";
  className?: string;
}

export function StockBadge({ status, className }: StockBadgeProps) {
  const config = {
    available: {
      label: "Available",
      className: "bg-status-available/10 text-status-available border-status-available/20",
    },
    low: {
      label: "Low Stock",
      className: "bg-status-low/10 text-status-low border-status-low/20",
    },
    out: {
      label: "Out of Stock",
      className: "bg-status-out/10 text-status-out border-status-out/20",
    },
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
      config[status].className,
      className
    )}>
      {config[status].label}
    </span>
  );
}
