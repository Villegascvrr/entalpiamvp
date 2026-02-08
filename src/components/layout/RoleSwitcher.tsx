import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";
import { User, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: "cliente" | "interno") => {
    if (newRole === role) return;
    
    setRole(newRole);
    // Navigate to the main page for the selected role
    if (newRole === "interno") {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-sidebar-accent/30 rounded-lg">
      <button
        onClick={() => handleRoleChange("cliente")}
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
        onClick={() => handleRoleChange("interno")}
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
