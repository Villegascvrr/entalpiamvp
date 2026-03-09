import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui/data-card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useActor } from "@/contexts/ActorContext";
import { assistanceRequestRepository } from "@/data/repositories";
import type { AssistanceRequest, AssistanceRequestStatus } from "@/data/types";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Clock,
    HeadphonesIcon,
    Loader2,
    Mail,
    MessageSquare,
    Phone,
    User,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Status configuration
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    AssistanceRequestStatus,
    { label: string; badgeClass: string; filterLabel: string }
> = {
    NEW: {
        label: "Nuevo",
        filterLabel: "Nuevo",
        badgeClass:
            "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    IN_PROGRESS: {
        label: "En Gestión",
        filterLabel: "En Gestión",
        badgeClass:
            "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    CLOSED: {
        label: "Cerrado",
        filterLabel: "Cerrado",
        badgeClass:
            "bg-muted text-muted-foreground border-border",
    },
};

type FilterType = "ALL" | AssistanceRequestStatus;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function truncate(text: string, max = 70) {
    return text.length > max ? text.slice(0, max) + "…" : text;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function AdminAssistance() {
    const { session } = useActor();

    const [requests, setRequests] = useState<AssistanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("ALL");

    const [selectedRequest, setSelectedRequest] =
        useState<AssistanceRequest | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // ── Data loading ────────────────────────────────────────
    const loadRequests = useCallback(async () => {
        if (!session) return;
        setIsLoading(true);
        try {
            const data =
                await assistanceRequestRepository.getAssistanceRequestsByTenant(
                    session,
                );
            setRequests(data);
        } catch (err) {
            toast.error("No se pudieron cargar las solicitudes.");
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // ── Realtime updates ─────────────────────────────────────
    useEffect(() => {
        if (!session || (session.role !== "admin" && session.role !== "commercial")) return;

        const channel = supabase
            .channel("public:assistance_requests")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "assistance_requests" },
                (payload) => {
                    // Refresh data on any insert, update or delete without reloading page
                    loadRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, loadRequests]);

    // Keep selectedRequest in sync after status updates
    useEffect(() => {
        if (selectedRequest) {
            const fresh = requests.find((r) => r.id === selectedRequest.id);
            if (fresh && fresh.status !== selectedRequest.status) {
                setSelectedRequest(fresh);
            }
        }
    }, [requests, selectedRequest]);

    // ── Derived counts ───────────────────────────────────────
    const counts = {
        NEW: requests.filter((r) => r.status === "NEW").length,
        IN_PROGRESS: requests.filter((r) => r.status === "IN_PROGRESS").length,
        CLOSED: requests.filter((r) => r.status === "CLOSED").length,
    };

    const filtered =
        filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

    // ── Status update ────────────────────────────────────────
    const handleStatusUpdate = async (
        id: string,
        status: AssistanceRequestStatus,
    ) => {
        if (!session) return;
        setIsUpdating(true);
        try {
            const updated =
                await assistanceRequestRepository.updateAssistanceRequestStatus(
                    session,
                    id,
                    status,
                );

            setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
            setSelectedRequest(updated);

            toast.success(`Estado actualizado → ${STATUS_CONFIG[status].label}`);
        } catch (err) {
            toast.error("No se pudo actualizar el estado.");
        } finally {
            setIsUpdating(false);
        }
    };

    const openDetail = (req: AssistanceRequest) => {
        setSelectedRequest(req);
        setIsSheetOpen(true);
    };

    // ── Loading state ────────────────────────────────────────
    if (isLoading) {
        return (
            <AppLayout>
                <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm">Cargando solicitudes...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-full bg-background overflow-hidden">

                {/* ── Header ──────────────────────────────────────── */}
                <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground/90 uppercase flex items-center gap-2">
                            <HeadphonesIcon className="h-5 w-5 text-primary" />
                            Solicitudes Comerciales
                        </h1>

                        <div className="h-8 w-px bg-border/60" />

                        {/* Counters */}
                        <div className="flex items-center gap-4">
                            <StatChip
                                label="Nuevas"
                                count={counts.NEW}
                                highlight={counts.NEW > 0}
                                highlightClass="bg-blue-500/20 text-blue-600"
                            />
                            <StatChip
                                label="En Gestión"
                                count={counts.IN_PROGRESS}
                                highlight={counts.IN_PROGRESS > 0}
                                highlightClass="bg-amber-500/20 text-amber-600"
                            />
                            <StatChip
                                label="Cerradas"
                                count={counts.CLOSED}
                                highlight={false}
                                highlightClass="bg-muted text-muted-foreground"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Filter bar ──────────────────────────────────── */}
                <div className="flex-none px-6 py-3 border-b border-border/60 bg-card flex gap-2 overflow-x-auto scrollbar-none">
                    {(
                        [
                            { key: "ALL", label: "Todas" },
                            { key: "NEW", label: "Nuevas" },
                            { key: "IN_PROGRESS", label: "En Gestión" },
                            { key: "CLOSED", label: "Cerradas" },
                        ] as { key: FilterType; label: string }[]
                    ).map(({ key, label }) => (
                        <Button
                            key={key}
                            variant={filter === key ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs px-3 rounded-full"
                            onClick={() => setFilter(key)}
                        >
                            {label}
                            {key !== "ALL" && key in counts && (
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    ({counts[key as AssistanceRequestStatus]})
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* ── Table ───────────────────────────────────────── */}
                <div className="flex-1 p-6 overflow-hidden bg-muted/10">
                    <div className="h-full bg-card border border-border/60 rounded-lg flex flex-col overflow-hidden shadow-sm">
                        <div className="flex-1 overflow-y-auto scrollbar-thin">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 sticky top-0 z-10 shadow-sm">
                                    <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                                        <th className="px-5 py-3 font-medium w-8" />
                                        <th className="px-5 py-3 font-medium">Estado</th>
                                        <th className="px-5 py-3 font-medium">Nombre</th>
                                        <th className="px-5 py-3 font-medium">Teléfono</th>
                                        <th className="px-5 py-3 font-medium">Mensaje</th>
                                        <th className="px-5 py-3 font-medium">Recibido</th>
                                        <th className="px-5 py-3 font-medium text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((req) => {
                                        const cfg = STATUS_CONFIG[req.status];
                                        const isNew = req.status === "NEW";

                                        return (
                                            <tr
                                                key={req.id}
                                                onClick={() => openDetail(req)}
                                                className={cn(
                                                    "border-b border-border/40 last:border-0 transition-colors cursor-pointer group",
                                                    isNew
                                                        ? "bg-blue-500/[0.04] hover:bg-blue-500/[0.08]"
                                                        : "hover:bg-muted/30",
                                                )}
                                            >
                                                {/* Indicator dot for NEW */}
                                                <td className="px-3 py-3.5 align-middle w-8">
                                                    {isNew && (
                                                        <span className="flex h-2 w-2 mx-auto">
                                                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 align-middle">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[10px] h-5 shadow-none whitespace-nowrap",
                                                            cfg.badgeClass,
                                                        )}
                                                    >
                                                        {cfg.label}
                                                    </Badge>
                                                </td>

                                                <td className="px-5 py-3.5 align-middle">
                                                    <p className="font-medium text-foreground/90 text-xs">
                                                        {req.name}
                                                    </p>
                                                    {req.email && (
                                                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[160px]">
                                                            {req.email}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 align-middle">
                                                    {req.phone ? (
                                                        <a
                                                            href={`tel:${req.phone}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            <Phone className="h-3 w-3 shrink-0" />
                                                            {req.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>

                                                <td className="px-5 py-3.5 align-middle max-w-[240px]">
                                                    <p className="text-xs text-foreground/80 line-clamp-2">
                                                        {truncate(req.message)}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-3.5 align-middle text-xs font-mono text-muted-foreground whitespace-nowrap">
                                                    {formatDate(req.created_at)}
                                                </td>

                                                <td className="px-5 py-3.5 align-middle text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs bg-background hover:bg-muted"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDetail(req);
                                                        }}
                                                    >
                                                        Ver
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filtered.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="p-12 text-center text-muted-foreground"
                                            >
                                                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium">Sin solicitudes</p>
                                                <p className="text-sm mt-1 text-muted-foreground/60">
                                                    No hay solicitudes que coincidan con el filtro
                                                    seleccionado.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Detail Sheet ──────────────────────────────────── */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-hidden p-0 flex flex-col">
                    {selectedRequest && (
                        <>
                            <SheetHeader className="p-6 border-b text-left space-y-0 bg-background z-10">
                                <div className="flex items-center justify-between gap-3">
                                    <SheetTitle className="text-base font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {selectedRequest.name}
                                    </SheetTitle>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] shadow-none",
                                            STATUS_CONFIG[selectedRequest.status].badgeClass,
                                        )}
                                    >
                                        {STATUS_CONFIG[selectedRequest.status].label}
                                    </Badge>
                                </div>
                                <SheetDescription className="text-[11px] mt-1">
                                    Recibido el {formatDate(selectedRequest.created_at)}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {/* Contact info */}
                                <DataCard title="Contacto" className="shadow-sm border-border/60">
                                    <div className="flex flex-col gap-2.5">
                                        {selectedRequest.phone && (
                                            <div className="flex items-center gap-2.5">
                                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <a
                                                    href={`tel:${selectedRequest.phone}`}
                                                    className="text-sm font-mono text-primary hover:underline"
                                                >
                                                    {selectedRequest.phone}
                                                </a>
                                            </div>
                                        )}
                                        {selectedRequest.email && (
                                            <div className="flex items-center gap-2.5">
                                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <a
                                                    href={`mailto:${selectedRequest.email}`}
                                                    className="text-sm text-primary hover:underline truncate"
                                                >
                                                    {selectedRequest.email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </DataCard>

                                {/* Message */}
                                <DataCard title="Mensaje" className="shadow-sm border-border/60">
                                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                        {selectedRequest.message}
                                    </p>
                                </DataCard>

                                {/* Timestamps */}
                                {selectedRequest.updated_at && (
                                    <p className="text-[10px] text-muted-foreground px-1">
                                        Última actualización:{" "}
                                        {formatDate(selectedRequest.updated_at)}
                                    </p>
                                )}
                            </div>

                            {/* Action footer */}
                            <div className="p-4 border-t bg-muted/10 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    {selectedRequest.status === "NEW" && (
                                        <Button
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2"
                                            disabled={isUpdating}
                                            onClick={() =>
                                                handleStatusUpdate(selectedRequest.id, "IN_PROGRESS")
                                            }
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Clock className="h-4 w-4" />
                                            )}
                                            Marcar En Gestión
                                        </Button>
                                    )}

                                    {selectedRequest.status === "IN_PROGRESS" && (
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                                            disabled={isUpdating}
                                            onClick={() =>
                                                handleStatusUpdate(selectedRequest.id, "CLOSED")
                                            }
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                            Marcar como Cerrado
                                        </Button>
                                    )}

                                    {selectedRequest.status === "NEW" && (
                                        <Button
                                            variant="outline"
                                            className="flex-1 gap-2 bg-background"
                                            disabled={isUpdating}
                                            onClick={() =>
                                                handleStatusUpdate(selectedRequest.id, "CLOSED")
                                            }
                                        >
                                            <XCircle className="h-4 w-4 text-muted-foreground" />
                                            Cerrar directamente
                                        </Button>
                                    )}

                                    {selectedRequest.status === "CLOSED" && (
                                        <div className="text-center text-xs text-muted-foreground w-full py-2">
                                            Esta solicitud está cerrada.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

// ─────────────────────────────────────────────────────────────
// StatChip sub-component
// ─────────────────────────────────────────────────────────────

function StatChip({
    label,
    count,
    highlight,
    highlightClass,
}: {
    label: string;
    count: number;
    highlight: boolean;
    highlightClass: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    "h-8 w-8 rounded flex items-center justify-center",
                    highlight ? highlightClass : "bg-muted text-muted-foreground",
                )}
            >
                <span className="text-sm font-bold">{count}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {label}
            </p>
        </div>
    );
}
