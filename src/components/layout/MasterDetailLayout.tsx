import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ... (inside MasterDetailLayout)

{/* Mobile View - Tabs */ }
<div className="md:hidden h-full flex flex-col">
    <Tabs defaultValue="master" className="h-full flex flex-col">
        <div className="px-4 py-2 bg-muted/20 border-b">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="master">Lista / Menú</TabsTrigger>
                <TabsTrigger value="detail">Detalle / Área de Trabajo</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="master" className="flex-1 overflow-auto mt-0">
            {master}
        </TabsContent>
        <TabsContent value="detail" className="flex-1 overflow-auto mt-0 bg-background">
            {detail}
        </TabsContent>
    </Tabs>
</div>
        </div >
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
