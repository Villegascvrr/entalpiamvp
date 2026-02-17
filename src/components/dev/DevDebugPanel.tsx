import { appConfig } from "@/config/appConfig";
import { useActor } from "@/contexts/ActorContext";
import { useOrders } from "@/hooks/useOrders";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export function DevDebugPanel() {
  // Only show in non-production modes
  if (appConfig.mode === "production") return null;

  const { session } = useActor();
  const { adminOrders, recentOrders, historyOrders, isLoading } = useOrders();
  const [isExpanded, setIsExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <div
        className={`
                bg-black/80 backdrop-blur-md border border-white/10 text-white 
                rounded-lg shadow-2xl transition-all duration-300 pointer-events-auto
                ${isExpanded ? "w-64" : "w-auto"}
            `}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 w-full hover:bg-white/5 rounded-t-lg transition-colors"
        >
          <Activity className="h-4 w-4 text-emerald-400" />
          {isExpanded && (
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              RLS Debugger
            </span>
          )}
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-3 space-y-3 text-xs border-t border-white/10">
            {/* Session Info */}
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">Actor Session</p>
              {session ? (
                <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1">
                  <span className="text-slate-500">Email:</span>
                  <span
                    className="font-mono text-blue-300 truncate"
                    title={session.email}
                  >
                    {session.email}
                  </span>

                  <span className="text-slate-500">Role:</span>
                  <span className="font-mono text-purple-300">
                    {session.role}
                  </span>

                  <span className="text-slate-500">Tenant:</span>
                  <span
                    className="font-mono text-orange-300 truncate"
                    title={session.tenantId}
                  >
                    {session.tenantId?.substring(0, 8)}...
                  </span>
                </div>
              ) : (
                <p className="text-red-400">No active session</p>
              )}
            </div>

            {/* Order Stats */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              <p className="text-slate-400 font-medium">Data Visibility</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-1.5 rounded text-center">
                  <span className="block text-[10px] text-slate-500">
                    Admin Orders
                  </span>
                  <span className="font-bold text-white">
                    {adminOrders?.length || 0}
                  </span>
                </div>
                <div className="bg-white/5 p-1.5 rounded text-center">
                  <span className="block text-[10px] text-slate-500">
                    My Orders
                  </span>
                  <span className="font-bold text-white">
                    {recentOrders?.length || 0}
                  </span>
                </div>
              </div>
              {isLoading && (
                <p className="text-[10px] text-yellow-400 animate-pulse mt-1">
                  Fetching data...
                </p>
              )}
            </div>

            <div className="pt-1 text-[10px] text-slate-600 text-center font-mono">
              APP_MODE: {appConfig.mode}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
