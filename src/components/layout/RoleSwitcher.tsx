import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";
import { User, Building2 } from "lucide-react";

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-1 p-1 bg-sidebar-accent/30 rounded-lg">
      <button
        onClick={() => setRole("cliente")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
          role === "cliente"
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <User className="h-3.5 w-3.5" />
        <span>Vista Cliente</span>
      </button>
      <button
        onClick={() => setRole("interno")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
          role === "interno"
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <Building2 className="h-3.5 w-3.5" />
        <span>Vista Interna</span>
      </button>
    </div>
  );
}
