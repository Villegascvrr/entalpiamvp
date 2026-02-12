import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    total: number;
}

export function ConfirmationModal({ open, onOpenChange, onConfirm, total }: ConfirmationModalProps) {
    const [confirmed, setConfirmed] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (open) setConfirmed(false);
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
                    <AlertDialogDescription>
                        Estás a punto de crear un pedido por un total de <span className="font-mono font-semibold text-foreground">€{total.toFixed(2)}</span>.
                        Esta acción notificará al almacén inmediatamente.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex items-start space-x-2 p-3 bg-muted/50 rounded-md border border-muted-foreground/10">
                        <Checkbox
                            id="confirm-terms"
                            checked={confirmed}
                            onCheckedChange={(c) => setConfirmed(c === true)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="confirm-terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Verificación Final
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                He revisado las cantidades y confirmo que los datos son correctos.
                            </p>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            if (confirmed) onConfirm();
                        }}
                        disabled={!confirmed}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Confirmar Pedido
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
