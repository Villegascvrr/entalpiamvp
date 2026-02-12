import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PlaceholderPage({ title }: { title: string }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-sm mb-6">
                    <Construction className="h-10 w-10 text-slate-400" />
                </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Esta funcionalidad está en desarrollo. Estamos trabajando para
                tenerla disponible pronto.
            </p>
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="mt-6 gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver
            </Button>
        </div>
    );
}
