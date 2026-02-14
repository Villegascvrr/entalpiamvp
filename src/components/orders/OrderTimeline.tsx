import { OrderTimelineEvent } from "@/data/types";
import { cn } from "@/lib/utils";
import {
    Circle,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    MapPin,
    XCircle,
    FileText
} from "lucide-react";

interface OrderTimelineProps {
    events: OrderTimelineEvent[];
    isLoading?: boolean;
}

export function OrderTimeline({ events, isLoading }: OrderTimelineProps) {
    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground animate-pulse">Cargando historial...</div>;
    }

    if (!events || events.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No hay historial disponible</div>;
    }

    // Sort by created_at desc (newest first) for vertical timeline usually looks better, 
    // but user requested "Created -> Pending -> ..." so typically that's ASC order logic 
    // but displayed vertically top-to-bottom. 
    // Let's assume input is already sorted ASC.

    // Status Icon Mapping
    const getIcon = (status: string) => {
        switch (status) {
            case "draft": return FileText;
            case "pending_validation": return Clock;
            case "confirmed": return CheckCircle2;
            case "preparing": return Package;
            case "shipped": return Truck;
            case "delivered": return MapPin;
            case "cancelled": return XCircle;
            default: return Circle;
        }
    };

    const getColor = (status: string) => {
        switch (status) {
            case "confirmed": return "text-green-600 bg-green-100";
            case "delivered": return "text-blue-600 bg-blue-100";
            case "cancelled": return "text-red-600 bg-red-100";
            case "shipped": return "text-purple-600 bg-purple-100";
            case "preparing": return "text-orange-600 bg-orange-100";
            case "pending_validation": return "text-amber-600 bg-amber-100";
            default: return "text-gray-500 bg-gray-100";
        }
    };

    return (
        <div className="relative space-y-0 pb-4">
            {events.map((event, index) => {
                const isLast = index === events.length - 1;
                const Icon = getIcon(event.to_status);
                const colorClass = getColor(event.to_status);

                return (
                    <div key={index} className="flex gap-4">
                        {/* Timeline Line & Dot */}
                        <div className="flex flex-col items-center">
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-white ring-2 ring-white", colorClass)}>
                                <Icon className="h-4 w-4" />
                            </div>
                            {!isLast && (
                                <div className="w-px h-full bg-border my-1" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                                <h4 className="text-sm font-semibold capitalize text-foreground">
                                    {event.to_status.replace("_", " ")}
                                </h4>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {event.created_at}
                                </span>
                            </div>

                            {event.notes && (
                                <p className="text-sm text-foreground/80 mt-1 bg-muted/30 p-2 rounded border border-border/50">
                                    {event.notes}
                                </p>
                            )}

                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <span>Por:</span>
                                <span className="font-medium text-foreground/70">{event.changed_by}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
