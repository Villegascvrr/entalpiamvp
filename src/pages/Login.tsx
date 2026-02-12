import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";
import { useActor } from "@/contexts/ActorContext";

// ─────────────────────────────────────────────────────────────
// Login Page — Minimal email/password auth
// Uses ActorContext login for optimized flow.
// ─────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
    { label: "Admin", email: "admin@entalpia-demo.com", role: "admin" },
    { label: "Comercial", email: "comercial@entalpia-demo.com", role: "commercial" },
    { label: "Logística", email: "logistica@entalpia-demo.com", role: "logistics" },
    { label: "Cliente", email: "cliente@entalpia-demo.com", role: "customer" },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useActor();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
            // Login successful, redirect happens via AuthGate (or we can navigate here, but AuthGate handles it)
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md mx-4">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        ENTALPIA
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Plataforma de gestión industrial
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300 text-sm">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@entalpia-demo.com"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-sm">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <LogIn className="h-4 w-4 mr-2" />
                            )}
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Quick Login Buttons */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-slate-500 mb-3 text-center">
                            Cuentas demo — clic para autorellenar
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {DEMO_ACCOUNTS.map((account) => (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() => handleQuickLogin(account.email)}
                                    className="text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-left"
                                >
                                    <span className="font-medium">{account.label}</span>
                                    <br />
                                    <span className="text-slate-500 text-[10px]">{account.role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    Entalpia MVP — Entorno de desarrollo
                </p>
            </div>
        </div>
    );
}
