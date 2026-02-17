import { Category } from "@/data/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Box, Layers, Thermometer, Wind, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

// Map icon keys to actual components
const iconMap: Record<string, React.ReactNode> = {
  Thermometer: <Thermometer className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
  Wind: <Wind className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  default: <Box className="h-6 w-6" />,
};

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = iconMap[category.iconKey] || iconMap.default;

  return (
    <Link
      to={`/order/new?category=${category.id}`}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-primary/20 block h-full",
        className,
      )}
    >
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        {category.image ? (
          <img
            src={category.image}
            alt={category.label}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-muted to-muted/50" />
        )}
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
        <div className="mb-2 flex items-center gap-2 opacity-90">
          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-md">
            {Icon}
          </div>
        </div>

        <h3 className="mb-1 text-2xl font-bold tracking-tight text-white group-hover:text-primary-foreground/90 transition-colors">
          {category.label}
        </h3>

        <p className="line-clamp-2 text-sm text-white/80 md:line-clamp-1 group-hover:text-white/90 transition-colors">
          {category.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/0 transition-all duration-300 group-hover:-translate-y-1 group-hover:text-white group-hover:opacity-100">
          Ver Catálogo <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
