import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isNew ? "Nuevo Producto" : "Editar Producto"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew 
              ? "Da de alta un nuevo producto y su ficha técnica base."
              : `Gestionando el producto ${id}`
            }
          </p>
        </div>
      </div>
      
      <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
        [Work in progress: {isNew ? "Creación de productos" : "Edición de productos y pestañas de idiomas"}]
      </div>
    </div>
  );
}
