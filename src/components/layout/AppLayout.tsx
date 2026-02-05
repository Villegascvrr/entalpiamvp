import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
  userRole?: "customer" | "admin";
  userName?: string;
  companyName?: string;
}

export function AppLayout({ 
  children, 
  userRole = "customer",
  userName = "John Doe",
  companyName = "Industrial Corp"
}: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar 
        userRole={userRole} 
        userName={userName}
        companyName={companyName}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
