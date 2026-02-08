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
  unit = "uds",
  threshold = { low: 50, out: 10 },
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
      label: "OK",
      className: "text-green-600",
      dotClassName: "bg-green-500",
    },
    low: {
      label: "Bajo",
      className: "text-amber-600",
      dotClassName: "bg-amber-500",
    },
    out: {
      label: "Agotado",
      className: "text-red-500",
      dotClassName: "bg-red-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center justify-end gap-1.5", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", config.dotClassName)} />
      <span className={cn("text-sm", config.className)}>
        {quantity > 0 ? quantity.toLocaleString() : "0"}
      </span>
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
      label: "OK",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    low: {
      label: "Bajo",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    out: {
      label: "Agotado",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
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
