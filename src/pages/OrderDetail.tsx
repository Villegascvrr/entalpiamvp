import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    FileText,
    Truck,
    Package,
    Building2,
    Calendar,
    CreditCard,
    MapPin,
    Building,
    User,
    Clock
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useActor } from "@/contexts/ActorContext";
import { orderRepository } from "@/data/repositories";
import { OrderTimelineEvent, OrderStatus, ORDER_STATUS_LABELS } from "@/data/types";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { cn } from "@/lib/utils";

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useActor();
    const { activeOrders, archivedOrders, isLoading: isOrdersLoading } = useOrders();

    const [timeline, setTimeline] = useState<OrderTimelineEvent[]>([]);
    const [isTimelineLoading, setIsTimelineLoading] = useState(false);

    // Find order in loaded lists
    const order = useMemo(() => {
        return activeOrders.find(o => o.id === id) || archivedOrders.find(o => o.id === id);
    }, [id, activeOrders, archivedOrders]);

    // Fetch timeline on mount (lazy load)
    useEffect(() => {
        const fetchTimeline = async () => {
            if (!session || !id || !order) return;

            setIsTimelineLoading(true);
            try {
                const events = await orderRepository.getOrderTimeline(session, id);
                setTimeline(events);
            } catch (err) {
                console.error("Failed to load timeline", err);
            } finally {
                setIsTimelineLoading(false);
            }
        };

        fetchTimeline();
    }, [session, id, order]); // Depend on order to ensure it exists before fetching detail

    if (isOrdersLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (!order) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto py-8 text-center">
                    <div className="bg-muted/30 rounded-lg p-12 flex flex-col items-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Pedido no encontrado</h2>
                        <p className="text-muted-foreground mb-6">El pedido {id} no existe o no tienes permisos para verlo.</p>
                        <Button onClick={() => navigate("/orders")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Mis Pedidos
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const statusColors: Record<OrderStatus, string> = {
        draft: "bg-gray-100 text-gray-700 border-gray-200",
        pending_validation: "bg-amber-50 text-amber-700 border-amber-200",
        confirmed: "bg-blue-50 text-blue-700 border-blue-200",
        preparing: "bg-orange-50 text-orange-700 border-orange-200",
        shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
        delivered: "bg-green-50 text-green-700 border-green-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {/* Header Actions */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Atrás
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Main Order Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Header Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-2xl font-mono">{order.id}</CardTitle>
                                            <Badge variant="outline" className={cn("capitalize shadow-none", statusColors[order.status])}>
                                                {ORDER_STATUS_LABELS[order.status]}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Creado el {order.date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Pedido</p>
                                        <p className="text-2xl font-bold font-mono">€{order.total.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Items Table */}
                                <div>
                                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        Artículos ({order.items.length})
                                    </h3>
                                    <div className="rounded-md border border-border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40 text-muted-foreground font-medium">
                                                <tr>
                                                    <th className="py-3 px-4 text-left">Producto</th>
                                                    <th className="py-3 px-4 text-center">Cant.</th>
                                                    <th className="py-3 px-4 text-right">Precio</th>
                                                    <th className="py-3 px-4 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {order.items.map((item) => (
                                                    <tr key={item.id} className="bg-card hover:bg-muted/5 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <p className="font-medium text-foreground">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.id}</p>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge variant="secondary" className="font-mono font-normal">
                                                                {item.quantity}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                                                            €{item.price.toFixed(2)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono font-medium">
                                                            €{(item.price * item.quantity).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            Dirección de Entrega
                                        </h3>
                                        <div className="bg-muted/20 p-4 rounded-lg border border-border/50 text-sm space-y-1">
                                            <p className="font-medium">{order.delivery?.contactName || order.customer.name}</p>
                                            <p>{order.delivery?.address || order.address}</p>
                                            <p>{order.delivery?.city && `${order.delivery.city}, `} {order.delivery?.postalCode} {order.delivery?.province}</p>
                                            <p className="text-muted-foreground mt-2 flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5" />
                                                {order.company}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            Notas / Observaciones
                                        </h3>
                                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-sm h-full">
                                            {order.notes ? (
                                                <p className="text-amber-900">{order.notes}</p>
                                            ) : (
                                                <p className="text-muted-foreground italic">Sin notas adicionales.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Timeline & Actions */}
                    <div className="space-y-6">
                        {/* Timeline Card */}
                        <Card className="h-fit">
                            <CardHeader className="pb-2 border-b border-border/40 bg-muted/5">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Línea de Tiempo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 pl-2">
                                <OrderTimeline events={timeline} isLoading={isTimelineLoading} />
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start h-9">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Descargar Pedido (PDF)
                                </Button>
                                {order.status === "delivered" && (
                                    <Button variant="outline" className="w-full justify-start h-9">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Descargar Albarán
                                    </Button>
                                )}
                                <Separator className="my-2" />
                                <Button className="w-full h-9">
                                    <Truck className="h-4 w-4 mr-2" />
                                    Repetir Pedido
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
