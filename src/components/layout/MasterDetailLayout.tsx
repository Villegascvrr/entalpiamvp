import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MasterDetailLayoutProps {
  /** Content for the master panel (left side - lists, navigation) */
  master: ReactNode;
  /** Content for the detail panel (right side - workspace, editing) */
  detail: ReactNode;
  /** Default size of master panel as percentage (default: 30) */
  masterDefaultSize?: number;
  /** Minimum size of master panel as percentage (default: 20) */
  masterMinSize?: number;
  /** Maximum size of master panel as percentage (default: 40) */
  masterMaxSize?: number;
  /** Additional class names for the container */
  className?: string;
}

/**
 * MasterDetailLayout - Industrial pattern for list + workspace views
 *
 * Used for high-density operational interfaces where users need to:
 * - Browse a list of items (master)
 * - Work on details of selected item (detail)
 *
 * The panels are resizable to accommodate different workflows.
 * On mobile, it switches to a Tabbed view.
 */
export function MasterDetailLayout({
  master,
  detail,
  masterDefaultSize = 30,
  masterMinSize = 20,
  masterMaxSize = 40,
  className,
}: MasterDetailLayoutProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      {/* Desktop View */}
      <div className="hidden md:block h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Master Panel - List/Navigation */}
          <ResizablePanel
            defaultSize={masterDefaultSize}
            minSize={masterMinSize}
            maxSize={masterMaxSize}
            className="bg-muted/20"
          >
            <div className="h-full overflow-auto scrollbar-thin">{master}</div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle
            withHandle
            className="bg-border/50 hover:bg-border"
          />

          {/* Detail Panel - Workspace */}
          <ResizablePanel defaultSize={100 - masterDefaultSize} minSize={50}>
            <div className="h-full overflow-auto scrollbar-thin">{detail}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile View - Tabs */}
      <div className="md:hidden h-full flex flex-col">
        <Tabs defaultValue="master" className="h-full flex flex-col">
          <div className="px-4 py-2 bg-muted/20 border-b flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="master">Lista / Menú</TabsTrigger>
              <TabsTrigger value="detail">Detalle / Trabajo</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="master"
            className="flex-1 overflow-auto mt-0 h-full"
          >
            {master}
          </TabsContent>
          <TabsContent
            value="detail"
            className="flex-1 overflow-auto mt-0 bg-background h-full"
          >
            {detail}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * MasterPanel - Styled container for master content
 */
export function MasterPanel({
  children,
  title,
  actions,
  className,
}: {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50">
          {title && (
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

/**
 * DetailPanel - Styled container for detail/workspace content
 */
export function DetailPanel({
  children,
  title,
  subtitle,
  actions,
  className,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
          <div>
            {title && (
              <h1 className="text-base font-semibold text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
