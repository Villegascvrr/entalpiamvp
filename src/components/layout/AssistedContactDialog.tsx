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
import { useActor } from "@/contexts/ActorContext";
import { assistanceRequestRepository } from "@/data/repositories";
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
  const { session } = useActor();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    if (!data.name || !data.message) {
      toast.error("Faltan datos requeridos");
      setLoading(false);
      return;
    }

    try {
      if (!session) {
        throw new Error("No session found");
      }
      await assistanceRequestRepository.createAssistanceRequest(session, data);

      // Reset form to clear stale state
      e.currentTarget.reset();

      setOpen(false);
      toast.success("Solicitud enviada", {
        description:
          "Un gestor comercial te contactará lo antes posible.",
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Error creating assistance request:", err);
      toast.error("Error al enviar la solicitud", {
        description: err.message || "Por favor, inténtelo de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
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
            <Input id="name" name="name" placeholder="Tu nombre" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Teléfono
              </Label>
              <Input id="phone" name="phone" placeholder="+34 600..." required type="tel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="tu@email.com"
                required
                type="email"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message" className="flex items-center gap-2">¿En qué podemos ayudarte?</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Ej: Necesito confirmar stock de R32 o consultar descuento por volumen..."
              className="h-24 resize-none"
              required
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
