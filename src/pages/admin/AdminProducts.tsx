import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch, Plus, Search, Edit2, Archive, ArchiveRestore, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminProducts() {
  const { products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.code?.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <PackageSearch className="w-8 h-8 text-primary" />
            Catálogo de Productos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los productos, traducciones y fichas técnicas.
          </p>
        </div>
        <Button onClick={() => navigate("/admin/products/new")} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border border-border/50 bg-card rounded-xl shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código..."
            className="pl-9 bg-background/50 border-border/50 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-5 py-3.5 w-16">IMG</th>
                <th className="px-5 py-3.5">Código</th>
                <th className="px-5 py-3.5">Precio / Unidad</th>
                <th className="px-5 py-3.5">Lotes</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 w-[100px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-5 py-3"><Skeleton className="h-10 w-10 rounded-md" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-8 w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No se encontraron productos en el catálogo.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-border/50">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.code || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <PackageSearch size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {product.code || product.name}
                        {product.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px] text-xs">
                                {product.description}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      <div className="flex flex-col">
                        <span>
                          {product.basePrice !== undefined 
                            ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(product.basePrice)
                            : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(product.price)}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          / {product.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {product.minLots && product.minLots > 1 ? (
                        <div className="flex flex-col">
                          <span>Mín: {product.minLots}</span>
                          <span className="text-muted-foreground text-[10px]">Caja de {product.lotSize}</span>
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-5 py-3">
                      {product.code ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 text-[10px] font-semibold h-5 px-1.5">Activo</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Legacy</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
