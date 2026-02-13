import { ReactNode } from "react";
import { useActor, ActorRole } from "@/contexts/ActorContext";
import { AlertCircle } from "lucide-react";

interface RoleGateProps {
    children: ReactNode;
    roles: ActorRole[];
    fallback?: ReactNode;
}

export function RoleGate({ children, roles, fallback }: RoleGateProps) {
    const { hasRole, isLoading } = useActor();

    if (isLoading) return null; // Or skeleton

    if (!hasRole(roles)) {
        if (fallback) return <>{fallback}</>;

        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Acceso Restringido</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    No tienes permisos para ver esta sección. Contacta con tu administrador si crees que es un error.
                </p>
                <div className="mt-4 text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    Roles permitidos: {roles.join(", ")}
                </div>

                <div className="mt-6">
                    <a href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                        Volver al Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
