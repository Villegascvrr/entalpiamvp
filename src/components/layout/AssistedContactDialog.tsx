import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Headset, Mail, Phone, Send, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AssistedContactDialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

export function AssistedContactDialog({
  children,
}: AssistedContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast.success("Solicitud enviada", {
        description:
          "Un gestor comercial te contactará en menos de 30 minutos.",
        duration: 5000,
      });
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Headset className="h-4 w-4" />
            Atención Personalizada
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Headset className="h-5 w-5" />
            Asistencia Comercial Express
          </DialogTitle>
          <DialogDescription>
            ¿Dudas con tu pedido? Te llamamos ahora mismo para ayudarte a
            cerrarlo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Nombre
            </Label>
            <Input id="name" placeholder="Tu nombre" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Teléfono
              </Label>
              <Input id="phone" placeholder="+34 600..." required type="tel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                placeholder="tu@email.com"
                required
                type="email"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">¿En qué podemos ayudarte?</Label>
            <Textarea
              id="message"
              placeholder="Ej: Necesito confirmar stock de R32 o consultar descuento por volumen..."
              className="h-24 resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Solicitar Llamada
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground text-center">
          <p>Horario de atención: L-V de 8:00 a 18:00</p>
          <p className="mt-1 font-medium text-primary">
            Tiempo medio de respuesta: &lt; 5 min
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
