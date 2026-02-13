import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { useActor } from "@/contexts/ActorContext";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Login Page — "Light Industrial" Design
// Clean, high-contrast, professional B2B look.
// ─────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
    { label: "Admin", email: "admin@entalpia-demo.com", role: "admin", active: true },
    { label: "Comercial", email: "comercial@entalpia-demo.com", role: "commercial", active: false },
    { label: "Logística", email: "logistica@entalpia-demo.com", role: "logistics", active: false },
    { label: "Cliente", email: "cliente@entalpia-demo.com", role: "customer", active: true },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useActor();
    const navigate = useNavigate();

    // DEV: Data Mode State
    const [dataMode, setDataMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("dev_data_mode") || "supabase-demo";
        }
        return "supabase-demo";
    });

    const handleDataModeChange = async (mode: string) => {
        // Clear Supabase session to prevent auto-login
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("SignOut failed", e);
        }

        setDataMode(mode);
        localStorage.setItem("dev_data_mode", mode);
        window.location.reload();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
            // Force redirect to dashboard to avoid lingering on previous routes (e.g. pricing)
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión");
        }
    };

    const handleQuickLogin = (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword("Demo2024!");
        setError(null);
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
            {/* Main Container - Industrial Card */}
            <div className="w-full max-w-5xl h-full max-h-[750px] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

                {/* LEFT: Authentication (Primary) - Spans 7 cols */}
                <div className="lg:col-span-7 p-6 lg:p-10 bg-white flex flex-col justify-center h-full overflow-y-auto">

                    {/* Header */}
                    <div className="mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-8 w-8 bg-blue-700 rounded flex items-center justify-center shadow-sm">
                                <span className="font-bold text-white text-lg">E</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                ENTALPIA
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm">
                            Plataforma de gestión industrial
                        </p>
                    </div>

                    <div className="mb-5 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-slate-900 mb-0.5">Bienvenido de nuevo</h2>
                        <p className="text-xs text-slate-500">Accede a la plataforma según tu rol operativo.</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4 max-w-md w-full flex-shrink-0">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">
                                Email Corporativo
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@entalpia.com"
                                required
                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-9 rounded-md transition-all shadow-sm text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">
                                    Contraseña
                                </Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 h-9 rounded-md transition-all shadow-sm text-sm"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="pt-1">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium h-9 rounded-md shadow-sm transition-all text-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                ) : (
                                    <LogIn className="h-3.5 w-3.5 mr-2" />
                                )}
                                Iniciar Sesión
                            </Button>
                            <p className="text-center text-slate-500 text-[10px] mt-2">
                                Usa una cuenta demo del panel derecho o introduce credenciales.
                            </p>
                        </div>
                    </form>

                    {/* DEV: Data Mode Selector */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-slate-100 text-slate-500 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-200">
                                DEV ONLY
                            </span>
                            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                Modo de datos
                            </h3>
                        </div>

                        <div className="space-y-1.5">
                            {[
                                {
                                    id: "mock",
                                    label: "Demo UI (datos fake)",
                                    desc: "Para diseño visual y pruebas rápidas sin backend."
                                },
                                {
                                    id: "supabase-demo",
                                    label: "Sandbox Demo",
                                    desc: "Flujo completo usando backend real con datos de prueba."
                                },
                                {
                                    id: "supabase-real-dev",
                                    label: "Sandbox Antonio",
                                    desc: "Entorno aislado para datos reales de Entalpia.\nActualmente puede aparecer vacío si aún no se han cargado datos."
                                },
                            ].map((mode) => (
                                <label key={mode.id} className="flex items-start gap-2.5 cursor-pointer group p-1.5 -mx-1.5 hover:bg-slate-50 rounded-md transition-colors">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input
                                            type="radio"
                                            name="data_mode"
                                            value={mode.id}
                                            checked={dataMode === mode.id}
                                            onChange={(e) => handleDataModeChange(e.target.value)}
                                            className="peer appearance-none h-3.5 w-3.5 border border-slate-300 rounded-full checked:border-blue-600 checked:bg-blue-600 transition-all shrink-0"
                                        />
                                        <div className="absolute h-1 w-1 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-[11px] font-medium transition-colors leading-none mb-0.5",
                                            dataMode === mode.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                                        )}>
                                            {mode.label}
                                        </span>
                                        <span className="text-[9px] text-slate-400 leading-tight whitespace-pre-line">
                                            {mode.desc}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 flex-shrink-0">
                        <p className="text-slate-400 text-[10px]">
                            © 2026 Entalpia MVP. Environment: Development.
                        </p>
                    </div>
                </div>

                {/* RIGHT: Contextual Roles (Secondary) - Spans 5 cols */}
                <div className="lg:col-span-5 p-6 lg:p-8 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-center h-full overflow-y-auto">
                    <div className="mb-4 flex-shrink-0">
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Cuentas Demo Disponibles
                        </h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Selecciona un perfil operativo para simular la experiencia de usuario.
                            Los roles desactivados estarán disponibles en futuras versiones.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 flex-shrink-0">
                        {DEMO_ACCOUNTS.map((account) => (
                            <button
                                key={account.email}
                                type="button"
                                disabled={!account.active}
                                onClick={() => handleQuickLogin(account.email)}
                                className={cn(
                                    "relative flex items-center justify-between p-3 rounded-md border transition-all text-left group",
                                    account.active
                                        ? "bg-white border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer shadow-sm"
                                        : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={cn("font-semibold text-xs", account.active ? "text-slate-900 group-hover:text-blue-700" : "text-slate-500")}>
                                            {account.label}
                                        </span>
                                        {account.active && (
                                            <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded ml-1.5 font-medium">
                                                Disponible
                                            </span>
                                        )}
                                        {!account.active && (
                                            <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded ml-1.5 font-medium">
                                                Próximamente
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {account.role}
                                    </span>
                                </div>

                                {account.active ? (
                                    <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <CheckCircle2 className="h-2.5 w-2.5 text-slate-400 group-hover:text-white" />
                                    </div>
                                ) : (
                                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 p-3 bg-white border border-slate-200 rounded text-[10px] text-slate-600 leading-relaxed shadow-sm flex-shrink-0">
                        <strong className="text-slate-800 block mb-0.5">Estado del Sistema</strong>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Operativo — v0.5.0-beta</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
