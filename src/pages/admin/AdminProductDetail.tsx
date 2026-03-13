import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useMatch, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, UploadCloud, Loader2, Image as ImageIcon, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useActor } from "@/contexts/ActorContext";
import { adminProductRepository } from "@/data/repositories";
import { supabase } from "@/lib/supabaseClient";
import type { ProductDetailsInput } from "@/data/types";

const LANGUAGES = ["ES", "EN", "DE", "FR"] as const;
type ConfiguredLanguage = typeof LANGUAGES[number];

type LanguageDetailsState = {
  [K in ConfiguredLanguage]: ProductDetailsInput;
};

export default function AdminProductDetail() {
  // Detect create mode by matching the exact "/admin/products/new" route.
  // The edit route "/admin/*/products/:code/edit" exposes :code via useParams().
  // We cannot rely on code === "new" because /admin/products/new has NO :code param.
  const isNewRoute = useMatch("/admin/products/new");
  const isNew = Boolean(isNewRoute);
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const { categories } = useProducts();
  const { session } = useActor();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  // General App State
  const [formData, setFormData] = useState({
    code: "",
    categoryId: "",
    price: 0,
    unit: "",
    lotSize: 1,
    minLots: 1,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Language Specific State
  const [languageDetails, setLanguageDetails] = useState<LanguageDetailsState>({
    ES: { language: "ES", description: "", features: {}, sourceUrl: "" },
    EN: { language: "EN", description: "", features: {}, sourceUrl: "" },
    DE: { language: "DE", description: "", features: {}, sourceUrl: "" },
    FR: { language: "FR", description: "", features: {}, sourceUrl: "" },
  });
  
  // Maps original PDF URLs so we can render them before a new File is selected
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [isSavingLanguage, setIsSavingLanguage] = useState<Record<string, boolean>>({});
  const [isDeletingLanguage, setIsDeletingLanguage] = useState<Record<string, boolean>>({});
  const [savedLanguages, setSavedLanguages] = useState<ConfiguredLanguage[]>([]);

  // Fetch product data if editing
  useEffect(() => {
    if (isNew) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("code", code)
          .single();

        if (productError) throw productError;
        
        if (productData) {
          setProductId(productData.id);
          setFormData({
            code: productData.code || "",
            categoryId: productData.category_id || "",
            price: Number(productData.price) || 0,
            unit: productData.unit || "",
            lotSize: productData.lot_size || 1,
            minLots: productData.min_lots || 1,
            isActive: productData.is_active ?? true,
          });
          setPreviewUrl(productData.image_url);

          // Fetch product_details
          const { data: detailsData, error: detailsError } = await supabase
            .from("product_details")
            .select("*")
            .eq("product_id", productData.id);

          if (detailsError) throw detailsError;

          // Hydrate the state with defaults for missing variants
          const newLangDetails = { ...languageDetails };
          const newPdfUrls: Record<string, string> = {};
          const loadedLangs: ConfiguredLanguage[] = [];

          if (detailsData) {
            detailsData.forEach(detail => {
              const lang = detail.language as ConfiguredLanguage;
              if (LANGUAGES.includes(lang)) {
                loadedLangs.push(lang);
                newLangDetails[lang] = {
                  language: lang,
                  description: detail.description || "",
                  features: detail.features || {},
                  sourceUrl: detail.source_url || "",
                };
                if (detail.safety_sheet_url) {
                  newPdfUrls[lang] = detail.safety_sheet_url;
                }
              }
            });
          }
          setLanguageDetails(newLangDetails);
          setPdfUrls(newPdfUrls);
          setSavedLanguages(loadedLangs);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        toast.error("Error al cargar el producto");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isNew]);

  // Handle local image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit General Information
  const handleSubmitGeneral = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    const codeStr = formData.code.trim();
    if (!codeStr) {
      toast.error("Product code is required");
      return;
    }
    
    if (!/^[A-Za-z0-9-]+$/.test(codeStr)) {
      toast.error("Code can only contain letters, numbers and hyphens.");
      return;
    }

    const normalizedCode = codeStr.toLowerCase();
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (isNew && !imageFile && !previewUrl) {
      toast.error("Image is required when creating a new product");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Seleccione una categoría");
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await adminProductRepository.createProduct(session, {
          code: normalizedCode,
          categoryId: formData.categoryId,
          price: formData.price,
          unit: formData.unit,
          lotSize: formData.lotSize,
          minLots: formData.minLots,
          isActive: formData.isActive,
          imageFile: imageFile!,
        });
        toast.success("Producto creado con éxito");
        // Redirect to edit mode to allow entering language tabs
        navigate(`/admin/products/${normalizedCode}/edit`);
      } else {
        if (!productId) throw new Error("Producto sin ID");
        await adminProductRepository.updateProduct(session, productId, {
          code: normalizedCode,
          price: Number(formData.price),
          unit: formData.unit,
          lotSize: Number(formData.lotSize),
          minLots: Number(formData.minLots),
          isActive: formData.isActive,
          imageFile: imageFile || undefined,
        });
        toast.success("Información base actualizada");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Specific Language
  const handleSaveLanguage = async (lang: ConfiguredLanguage) => {
    if (!session || !productId || !formData.code) return;
    
    setIsSavingLanguage(prev => ({ ...prev, [lang]: true }));
    try {
      const payload = languageDetails[lang];
      await adminProductRepository.upsertProductDetails(
        session,
        productId,
        formData.code,
        payload
      );
      toast.success(`Textos en ${lang} guardados con éxito`);
      
      // Include in saved translations if not already
      if (!savedLanguages.includes(lang)) {
        setSavedLanguages(prev => [...prev, lang]);
      }
      
      // If we uploaded a new PDF, clean the file out of state so it doesn't upload again next time unnecessarily
      if (payload.pdfFile) {
        setLanguageDetails(prev => ({
          ...prev,
          [lang]: { ...prev[lang], pdfFile: undefined }
        }));
      }
    } catch (err: any) {
      console.error("Error saving language details:", err);
      toast.error(`Error guardando idioma ${lang}`);
    } finally {
      setIsSavingLanguage(prev => ({ ...prev, [lang]: false }));
    }
  };

  // Delete Specific Language Translation
  const handleDeleteLanguage = async (lang: ConfiguredLanguage) => {
    if (!session || !productId || !formData.code) return;

    setIsDeletingLanguage(prev => ({ ...prev, [lang]: true }));
    try {
      await adminProductRepository.deleteProductDetails(session, productId, formData.code, lang);
      
      toast.success(`Traducción en ${lang} eliminada`);
      
      // Reset state for this language
      setLanguageDetails(prev => ({
        ...prev,
        [lang]: { language: lang, description: "", features: {}, sourceUrl: "" }
      }));
      setPdfUrls(prev => {
        const clone = { ...prev };
        delete clone[lang];
        return clone;
      });
      setSavedLanguages(prev => prev.filter(l => l !== lang));

    } catch (err: any) {
      console.error("Error deleting translation:", err);
      toast.error(`Error al eliminar idioma ${lang}`);
    } finally {
      setIsDeletingLanguage(prev => ({ ...prev, [lang]: false }));
    }
  };

  // Feature editing helpers
  const handleAddFeature = (lang: ConfiguredLanguage) => {
    setLanguageDetails(prev => {
      const clone = { ...prev };
      const currentFeatures = { ...clone[lang].features };
      // Note: Object keys must be unique. Let's pre-generate a unique key.
      const newKey = `Nueva Propiedad ${Object.keys(currentFeatures).length + 1}`;
      currentFeatures[newKey] = "";
      clone[lang].features = currentFeatures;
      return clone;
    });
  };

  const handleUpdateFeature = (lang: ConfiguredLanguage, oldKey: string, newKey: string, newValue: string) => {
    setLanguageDetails(prev => {
      const clone = { ...prev };
      const currentFeatures = { ...clone[lang].features };
      
      if (oldKey !== newKey) {
        delete currentFeatures[oldKey];
      }
      currentFeatures[newKey] = newValue;
      clone[lang].features = currentFeatures;
      
      return clone;
    });
  };

  const handleRemoveFeature = (lang: ConfiguredLanguage, keyToRemove: string) => {
    setLanguageDetails(prev => {
      const clone = { ...prev };
      const currentFeatures = { ...clone[lang].features };
      delete currentFeatures[keyToRemove];
      clone[lang].features = currentFeatures;
      return clone;
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isNew ? "Nuevo Producto" : "Editar Producto"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isNew 
              ? "Da de alta un nuevo producto y su ficha técnica base."
              : `Gestionando el producto ${formData.code}`
            }
          </p>
        </div>
      </div>

      {/* --- FORMULARIO GENERAL --- */}
      <form onSubmit={handleSubmitGeneral} className="space-y-6">
        {/* General Information Panel */}
        <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Datos Base Centralizados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código (SKU)</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={e => setFormData(f => ({ ...f, code: e.target.value }))}
                disabled={!isNew}
                required
              />
              {!isNew && <p className="text-xs text-muted-foreground">El código no se puede editar una vez creado.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={v => setFormData(f => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccionar categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio Base (€)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                min="0"
                value={formData.price} 
                onChange={e => setFormData(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidad de Medida (Ej: kg, garrafa)</Label>
              <Input 
                id="unit" 
                value={formData.unit} 
                onChange={e => setFormData(f => ({ ...f, unit: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotSize">Kilos o Unidades por Lote</Label>
              <Input 
                id="lotSize" 
                type="number" 
                min="1"
                value={formData.lotSize} 
                onChange={e => setFormData(f => ({ ...f, lotSize: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minLots">Lotes Mínimos (Pedidos)</Label>
              <Input 
                id="minLots" 
                type="number" 
                min="1"
                value={formData.minLots} 
                onChange={e => setFormData(f => ({ ...f, minLots: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2 flex flex-col justify-center pt-2">
              <Label htmlFor="isActive" className="mb-3">Estado del Producto</Label>
              <div className="flex items-center gap-3">
                <Switch 
                  id="isActive" 
                  checked={formData.isActive}
                  onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))}
                />
                <span className="text-sm font-medium">
                  {formData.isActive ? "Activo (Visible en catálogo a clientes)" : "Inactivo (Oculto)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Panel */}
        <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm space-y-6">
          <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Imagen Central del Producto</h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-40 h-40 shrink-0 bg-muted/30 border-2 border-dashed border-border flex items-center justify-center rounded-xl overflow-hidden relative">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                  <span className="text-xs">Sin imagen</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3 pt-2 w-full text-center sm:text-left">
              <div>
                <Label htmlFor="imageUpload" className="cursor-pointer inline-block">
                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors w-full sm:w-auto">
                    <UploadCloud className="w-4 h-4" />
                    <span>{previewUrl ? "Reemplazar Imagen" : "Subir Imagen"}</span>
                  </div>
                </Label>
                <Input 
                  id="imageUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-muted-foreground w-full">
                Recomendado: Imagen cuadrada (1:1), formato JPG o PNG. Tamaño máximo 2MB.
                {isNew && <span className="block mt-1 font-medium text-destructive">La imagen es obligatoria para nuevos productos.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Footer */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate("/admin/products")}>
            Volver
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            {isNew ? "Crear Producto Base" : "Guardar General"}
          </Button>
        </div>
      </form>

      {/* --- FORMULARIO MULTILINGUE (Sólo visible cuando no es un producto nuevo) --- */}
      {!isNew && productId && (
        <div className="pt-6 border-t border-border/50">
          <h2 className="text-xl font-bold mb-1">Textos y Fichas Técnicas</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Personaliza el contenido de texto que verá el cliente según su idioma local.
          </p>
          
          <Tabs defaultValue="ES" className="w-full">
            <TabsList className="w-full sm:w-auto bg-muted/50 p-1 mb-6">
              {LANGUAGES.map(l => (
                <TabsTrigger key={l} value={l} className="min-w-20 font-medium">
                  {l === "ES" && "🇪🇸 ES"}
                  {l === "EN" && "🇬🇧 EN"}
                  {l === "DE" && "🇩🇪 DE"}
                  {l === "FR" && "🇫🇷 FR"}
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map(lang => {
              const details = languageDetails[lang];
              const isSavingThisLang = isSavingLanguage[lang];
              
              return (
                <TabsContent key={lang} value={lang} className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                  <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm space-y-6">
                    
                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Descripción del Producto ({lang})</Label>
                      <Textarea 
                        placeholder="Descripción detallada para la tienda..."
                        className="min-h-[120px]"
                        value={details.description}
                        onChange={(e) => setLanguageDetails(prev => ({
                          ...prev,
                          [lang]: { ...details, description: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Source URL */}
                    <div className="space-y-2">
                      <Label>URL Fabricante (Opcional)</Label>
                      <Input 
                        placeholder="https://..."
                        type="url"
                        value={details.sourceUrl}
                        onChange={(e) => setLanguageDetails(prev => ({
                          ...prev,
                          [lang]: { ...details, sourceUrl: e.target.value }
                        }))}
                      />
                    </div>

                    {/* Advanced Features Matrix */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Label>Tabla de Propiedades (Key / Value)</Label>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleAddFeature(lang)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Añadir fila
                        </Button>
                      </div>
                      
                      {Object.keys(details.features).length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                          Sin propiedades adicionales. Añade filas para construir la tabla técnica (ej: "Pureza" -&gt; "99.9%").
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(details.features).map(([key, value], idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <Input 
                                placeholder="Propiedad (Ej: Envase)" 
                                value={key}
                                className="w-1/3"
                                onChange={(e) => handleUpdateFeature(lang, key, e.target.value, value)}
                              />
                              <Input 
                                placeholder="Valor (Ej: Botella de 10 Litros)" 
                                value={value}
                                className="flex-1"
                                onChange={(e) => handleUpdateFeature(lang, key, key, e.target.value)}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive shrink-0"
                                onClick={() => handleRemoveFeature(lang, key)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PDF Document Upload */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <Label>Ficha de Seguridad (PDF)</Label>
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/10">
                        <div className="bg-muted p-3 rounded-full shrink-0">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          {details.pdfFile ? (
                            <p className="text-sm font-medium truncate text-primary">{details.pdfFile.name}</p>
                          ) : pdfUrls[lang] ? (
                            <a href={pdfUrls[lang]} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-500 hover:underline truncate block">
                              View current technical sheet
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">Sin documento PDF asociado a este idioma</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">Sube la ficha técnica de seguridad en {lang}</p>
                        </div>
                        <div>
                          <Label htmlFor={`pdf-${lang}`} className="cursor-pointer">
                            <div className="h-9 px-4 inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors">
                              <UploadCloud className="w-4 h-4 mr-2" />
                              Reemplazar PDF
                            </div>
                          </Label>
                          <Input 
                            id={`pdf-${lang}`} 
                            type="file" 
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setLanguageDetails(prev => ({
                                  ...prev,
                                  [lang]: { ...details, pdfFile: f }
                                }));
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save specific language layout */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      
                      {/* Delete Translation Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline"
                            disabled={!savedLanguages.includes(lang) || isDeletingLanguage[lang]}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                          >
                            {isDeletingLanguage[lang] ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Eliminar Traducción
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar traducción {lang}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete translation {lang}? This will remove the description, features and technical sheet.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteLanguage(lang)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Sí, eliminar base de idioma
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button 
                        type="button" 
                        onClick={() => handleSaveLanguage(lang)} 
                        disabled={isSavingThisLang}
                      >
                        {isSavingThisLang ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Guardar Textos en {lang}
                      </Button>
                    </div>

                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      )}
    </div>
  );
}
