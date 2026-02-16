import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export function AppLayout({ children, mainClassName }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="hidden md:flex h-full flex-col">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main
          className={`flex-1 overflow-auto p-6 scrollbar-thin ${mainClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
