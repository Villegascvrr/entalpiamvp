import { createContext, useContext, useState, ReactNode } from "react";

type Role = "cliente" | "interno";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isInterno: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("cliente");

  return (
    <RoleContext.Provider value={{ role, setRole, isInterno: role === "interno" }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
