import { AppLayout } from "@/components/layout/AppLayout";
import { AssistedContactDialog } from "@/components/layout/AssistedContactDialog";
import { ConfirmationModal } from "@/components/orders/ConfirmationModal";
import { OrderSuccess } from "@/components/orders/OrderSuccess";
import { OrderSummaryPanel } from "@/components/orders/OrderSummaryPanel";
import { ProductSelector } from "@/components/orders/ProductSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@/contexts/ActorContext";
import { useOrder } from "@/contexts/OrderContext";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronRight,
  FileSearch,
  Headset,
  Info,
  Send,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const { session, hasRole } = useActor();
  const { t } = useTranslation();
  const isInterno = hasRole("admin");
  const {
    items,
    currentStep,
    setStep,
    addItem,
    removeItem,
    updateQuantity,
    shippingDetails,
    updateShipping,
    clearOrder,
    submitOrder,
    orderTotal,
  } = useOrder();

  const backPath = isInterno ? "/admin/orders" : "/dashboard";
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for Step 3
  const [copyClient, setCopyClient] = useState(true);
  const [copyInternal, setCopyInternal] = useState(true);
  const [stepTransition, setStepTransition] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // DELIVERY VALIDATION
  // ─────────────────────────────────────────────────────────────
  const [deliveryErrors, setDeliveryErrors] = useState<Record<string, string>>({});

  function validateDeliveryDetails(): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    const d = shippingDetails.delivery;
    const todayStr = new Date().toISOString().split("T")[0];

    // Required fields
    if (!d.address?.trim())     errors.address     = "Este campo es obligatorio";
    if (!d.city?.trim())        errors.city        = "Este campo es obligatorio";
    if (!d.postalCode?.trim())  errors.postalCode  = "Este campo es obligatorio";
    if (!d.province?.trim())    errors.province    = "Este campo es obligatorio";
    if (!d.contactName?.trim()) errors.contactName = "Este campo es obligatorio";
    if (!d.contactPhone?.trim()) errors.contactPhone = "Este campo es obligatorio";

    // Delivery date required + not in the past
    if (!shippingDetails.date || shippingDetails.date === "asap") {
      // "ASAP" selection is allowed, skip date validation
    } else if (shippingDetails.date < todayStr) {
      errors.date = "La fecha de entrega no puede ser pasada";
    }

    // Phone format (optional but if filled must match)
    if (d.contactPhone?.trim()) {
      const phoneRegex = /^\+?[0-9\s]{7,15}$/;
      if (!phoneRegex.test(d.contactPhone.trim())) {
        errors.contactPhone = "Formato de teléfono inválido (ej: +34 600000000)";
      }
    }

    // Email format (optional — only validate if filled)
    if (d.contactEmail?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(d.contactEmail.trim())) {
        errors.contactEmail = "Formato de email no válido";
      }
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  // Re-run validation whenever shipping details change
  useEffect(() => {
    if (currentStep === 3) {
      const { errors } = validateDeliveryDetails();
      setDeliveryErrors(errors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingDetails, currentStep]);

  const isDeliveryValid = Object.keys(deliveryErrors).length === 0;

  // ─────────────────────────────────────────────────────────────
  // ORDER ITEMS VALIDATION BEFORE SUBMIT
  // ─────────────────────────────────────────────────────────────
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [isValidatingItems, setIsValidatingItems] = useState(false);

  const validateOrderItems = async (): Promise<boolean> => {
    setIsValidatingItems(true);
    const errors: Record<string, string> = {};
    let hasError = false;

    // 1. Min lots validation
    for (const item of items) {
      const lotSize = Number(item.lotSize) || 1;
      const minLots = Number(item.minOrder) || 1;
      const minQty = lotSize * minLots;
      
      if (item.quantity < minQty) {
        errors[item.id] = `Minimum order quantity for this product is ${minQty} units.`;
        hasError = true;
      }
    }

    if (!hasError) {
      try {
        const { supabase } = await import("@/lib/supabaseClient");
        // 2. Stock validation
        const productIds = items.map((i) => i.id);
        const { data: stockData } = await supabase
          .from("stock")
          .select("product_id, available_stock")
          .in("product_id", productIds);

        if (stockData) {
          const stockMap = new Map(stockData.map((s) => [s.product_id, s.available_stock]));
          for (const item of items) {
            const available = stockMap.get(item.id);
            if (available !== undefined && available !== null) {
              if (item.quantity > available) {
                errors[item.id] = `Requested quantity exceeds available stock (${available}).`;
                hasError = true;
              }
            }
          }
        }
      } catch (e) {
        console.error("Stock validation failed", e);
      }
    }

    setItemErrors(errors);
    setIsValidatingItems(false);
    return !hasError;
  };

  // Animate step transitions
  useEffect(() => {
    setStepTransition(true);
    const timer = setTimeout(() => setStepTransition(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleConfirm = async () => {
    if (!session) {
      console.error("No active session");
      return;
    }

    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      // Lazy load repository to avoid cyclic dependencies or heavy loads if not needed immediately
      // But here we can import it directly at top level or use the global one
      // We'll use the one from @/data/repositories
      const { orderRepository } = await import("@/data/repositories");

      await submitOrder(async (orderData) => {
        return await orderRepository.createOrder(session, orderData);
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit order:", error);
      // In a real app, show error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = orderTotal;
  const discountTotal = items.reduce((sum, item) => {
    const lineTotal = item.price * item.quantity;
    const itemDiscount = (item as any).discountPercentage || 0;
    return sum + (lineTotal * itemDiscount) / 100;
  }, 0);
  const totalWithDiscount = subtotal - discountTotal;
  const vatAmount = totalWithDiscount * 0.21;
  const total = totalWithDiscount + vatAmount;

  // ─────────────────────────────────────────────────────────────
  // COMPACT STEPPER
  // ─────────────────────────────────────────────────────────────
  const steps = [
    { id: 1, label: t("createOrder.steps.selection"), icon: ShoppingCart },
    { id: 2, label: t("createOrder.steps.review"), icon: FileSearch },
    { id: 3, label: t("createOrder.steps.data"), icon: Truck },
    { id: 4, label: t("createOrder.steps.end"), icon: Send },
  ];

  if (isSuccess) {
    return (
      <AppLayout>
        <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex items-center justify-center gap-1 bg-background border-b border-border/60 h-8 shrink-0 select-none">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-0.5 rounded-full transition-all duration-300",
                  currentStep === s.id ? "bg-primary/10 text-primary"
                    : currentStep > s.id ? "text-muted-foreground/80" : "text-muted-foreground/40",
                )}
              >
                <div className={cn("flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ring-1 ring-current", currentStep >= s.id ? "bg-background" : "bg-transparent")}>
                  {currentStep > s.id ? <Check className="h-2.5 w-2.5" /> : s.id}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-4 h-px bg-border/50 mx-1" />}
            </div>
          ))}
        </div>
          <OrderSuccess
            onReset={() => {
              clearOrder();
              setIsSuccess(false);
              setStep(1);
            }}
            onViewOrders={() => {
              clearOrder();
              navigate(backPath);
            }}
            shippingDate={shippingDetails.date}
            emailClient="usuario.demo@entalpia.com"
            emailInternal={copyInternal ? "pedidos@entalpia.com" : undefined}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout mainClassName="p-0 overflow-hidden">
      <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden">
        {/* 1. COMPACT HEADER */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-background shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (currentStep > 1) {
                  setStep(currentStep - 1);
                } else {
                  navigate(backPath);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold tracking-tight">
                {t("createOrder.title")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AssistedContactDialog>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] gap-1.5 hidden md:flex"
              >
                <Headset className="h-3.5 w-3.5" />
                {t("createOrder.support")}
              </Button>
            </AssistedContactDialog>
          </div>
        </div>

        {/* 2. STEPPER STRIP */}
        <div className="flex items-center justify-center gap-1 bg-background border-b border-border/60 h-8 shrink-0 select-none">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-0.5 rounded-full transition-all duration-300",
                  currentStep === s.id ? "bg-primary/10 text-primary"
                    : currentStep > s.id ? "text-muted-foreground/80" : "text-muted-foreground/40",
                )}
              >
                <div className={cn("flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ring-1 ring-current", currentStep >= s.id ? "bg-background" : "bg-transparent")}>
                  {currentStep > s.id ? <Check className="h-2.5 w-2.5" /> : s.id}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className="w-4 h-px bg-border/50 mx-1" />}
            </div>
          ))}
        </div>

        {/* 3. MAIN CONTENT GRID (No Scroll Container) */}
        <div className="flex-1 overflow-hidden relative">
          {/* Step 1: Split View (Catalog + Sidebar) */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
              {/* MAIN ZONE: Categories/Products */}
              <div className="lg:col-span-8 xl:col-span-9 h-full overflow-hidden bg-muted/5 relative">
                <ProductSelector
                  onSelectProduct={addItem}
                  selectedItems={items}
                  onUpdateQuantity={updateQuantity}
                  initialCategory={initialCategory}
                />
              </div>

              {/* SIDEBAR: Order Summary (Fixed) */}
              <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 h-full border-l border-border bg-card z-10 flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                <OrderSummaryPanel
                  items={items}
                  onRemoveItem={removeItem}
                  onUpdateQuantity={updateQuantity}
                  onProceed={() => setStep(2)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Review (Compact Table) */}
          {currentStep === 2 && (
            <div className="h-full overflow-auto bg-muted/10 p-4 md:p-8 flex justify-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="max-w-5xl w-full flex flex-col md:flex-row gap-6 h-fit min-h-0 bg-background border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Table */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                      <FileSearch className="h-4 w-4 text-primary" />
                      {t("createOrder.step2.reviewTitle")}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() => setStep(1)}
                    >
                      {t("createOrder.step2.edit")}
                    </Button>
                  </div>
                  <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/20 sticky top-0">
                        <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider text-[10px]">
                          <th className="px-4 py-2 text-left font-medium">
                            {t("createOrder.step2.columns.product")}
                          </th>
                          <th className="px-4 py-2 text-center font-medium w-20">
                            {t("createOrder.step2.columns.qty")}
                          </th>
                          <th className="px-4 py-2 text-right font-medium w-24">
                            {t("createOrder.step2.columns.total")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {items.map((item) => (
                          <tr key={item.id} className={cn("hover:bg-muted/10", itemErrors[item.id] && "bg-destructive/5")}>
                            <td className="px-4 py-2">
                              <div className="font-medium text-foreground">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {item.id}
                              </div>
                              {itemErrors[item.id] && (
                                <p className="text-[11px] font-medium text-destructive mt-1 bg-destructive/10 inline-block px-1.5 py-0.5 rounded-sm">
                                  {itemErrors[item.id]}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Badge
                                variant="secondary"
                                className="font-mono text-[10px] h-5 px-1.5"
                              >
                                {item.quantity}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-medium">
                              €{(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Right Panel */}
                <div className="w-full md:w-72 bg-muted/10 border-l border-border p-6 flex flex-col gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("createOrder.step2.subtotal", "Order Summary")}
                    </h3>
                    <div className="flex justify-between text-sm">
                      <span>{t("createOrder.step2.subtotal", "Subtotal")}</span>
                      <span className="font-mono">€{subtotal.toFixed(2)}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Descuento</span>
                        <span className="font-mono">-€{discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t("createOrder.step2.vat", "IVA (21%)")}</span>
                      <span className="font-mono">€{vatAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("createOrder.step2.total", "Total")}</span>
                      <span className="font-mono text-primary">€{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    <Button
                      className="w-full font-bold shadow-md"
                      disabled={isValidatingItems}
                      onClick={async () => {
                        const valid = await validateOrderItems();
                        if (valid) setStep(3);
                      }}
                    >
                      {isValidatingItems ? "..." : t("createOrder.step2.continue")} <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Shipping (Detailed Form) */}
          {currentStep === 3 && (
            <div className="h-full overflow-auto bg-muted/10 p-4 md:p-8 flex justify-center animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="max-w-4xl w-full bg-background border border-border rounded-xl shadow-sm overflow-hidden h-fit mb-8">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {t("createOrder.step3.deliveryTitle")}
                  </h2>
                </div>

                <div className="p-6 grid gap-8">
                  {/* Section 1: Notes & Notifications */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60" />
                      {t("createOrder.step3.notesSection")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("createOrder.step3.deliveryInstructions")}</Label>
                        <textarea
                          className="flex min-h-[76px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          placeholder={t("createOrder.step3.deliveryInstructionsPlaceholder")}
                          value={shippingDetails.delivery.instructions}
                          onChange={(e) => updateShipping({ instructions: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("createOrder.step3.notifications")}</Label>
                        <div className="flex flex-col gap-2.5 p-3 bg-muted/5 rounded-md border border-border h-[76px] justify-center">
                          <div className="flex items-center gap-2">
                            <Checkbox id="c1" checked={copyClient} onCheckedChange={(c) => setCopyClient(!!c)} />
                            <Label htmlFor="c1" className="text-xs font-normal cursor-pointer">
                              {t("createOrder.step3.copyClient")}
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="c2" checked={copyInternal} onCheckedChange={(c) => setCopyInternal(!!c)} />
                            <Label htmlFor="c2" className="text-xs font-normal cursor-pointer">
                              {t("createOrder.step3.copyInternal")}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Address & Location */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      {t("createOrder.step3.locationSection")}
                    </h3>
                    {/* Street address — full width */}
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {t("createOrder.step3.deliveryAddress")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={shippingDetails.delivery.address}
                        onChange={(e) => updateShipping({ address: e.target.value })}
                        placeholder={t("createOrder.step3.addressPlaceholder")}
                        className={cn("h-9", deliveryErrors.address && "border-destructive focus-visible:ring-destructive/20")}
                      />
                      {deliveryErrors.address && <p className="text-[11px] text-destructive">{deliveryErrors.address}</p>}
                    </div>
                    {/* City / Postal / Province in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("createOrder.step3.cityLabel")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={shippingDetails.delivery.city}
                          onChange={(e) => updateShipping({ city: e.target.value })}
                          className={cn("h-9", deliveryErrors.city && "border-destructive focus-visible:ring-destructive/20")}
                        />
                        {deliveryErrors.city && <p className="text-[11px] text-destructive">{deliveryErrors.city}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("createOrder.step3.postalCode")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={shippingDetails.delivery.postalCode}
                          onChange={(e) => updateShipping({ postalCode: e.target.value })}
                          className={cn("h-9", deliveryErrors.postalCode && "border-destructive focus-visible:ring-destructive/20")}
                        />
                        {deliveryErrors.postalCode && <p className="text-[11px] text-destructive">{deliveryErrors.postalCode}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("createOrder.step3.province")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={shippingDetails.delivery.province}
                          onChange={(e) => updateShipping({ province: e.target.value })}
                          className={cn("h-9", deliveryErrors.province && "border-destructive focus-visible:ring-destructive/20")}
                        />
                        {deliveryErrors.province && <p className="text-[11px] text-destructive">{deliveryErrors.province}</p>}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 3: Contact + Logistics (side by side) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                        {t("createOrder.step3.contactSection")}
                      </h3>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("createOrder.step3.contactName")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={shippingDetails.delivery.contactName}
                          onChange={(e) => updateShipping({ contactName: e.target.value })}
                          placeholder={t("createOrder.step3.contactNamePlaceholder")}
                          className={cn("h-9", deliveryErrors.contactName && "border-destructive focus-visible:ring-destructive/20")}
                        />
                        {deliveryErrors.contactName && <p className="text-[11px] text-destructive">{deliveryErrors.contactName}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {t("createOrder.step3.phone")} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={shippingDetails.delivery.contactPhone}
                            onChange={(e) => updateShipping({ contactPhone: e.target.value })}
                            className={cn("h-9", deliveryErrors.contactPhone && "border-destructive focus-visible:ring-destructive/20")}
                          />
                          {deliveryErrors.contactPhone && <p className="text-[11px] text-destructive">{deliveryErrors.contactPhone}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("createOrder.step3.emailOptional")}</Label>
                          <Input
                            value={shippingDetails.delivery.contactEmail}
                            onChange={(e) => updateShipping({ contactEmail: e.target.value })}
                            className={cn("h-9", deliveryErrors.contactEmail && "border-destructive focus-visible:ring-destructive/20")}
                          />
                          {deliveryErrors.contactEmail && <p className="text-[11px] text-destructive">{deliveryErrors.contactEmail}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                        {t("createOrder.step3.logisticsSection")}
                      </h3>

                      {/* Delivery date mode — card-style radio buttons */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("createOrder.step3.deliveryDate")}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {/* ASAP */}
                          <button
                            type="button"
                            onClick={() => updateShipping({ date: "asap" })}
                            className={cn(
                              "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-xs transition-all",
                              shippingDetails.date === "asap"
                                ? "border-primary bg-primary/5 text-primary font-semibold"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
                            )}
                          >
                            <span className="font-semibold text-[11px] uppercase tracking-wide">Primera disponible</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Lo antes posible</span>
                          </button>
                          {/* Preferred date */}
                          <button
                            type="button"
                            onClick={() => {
                              if (shippingDetails.date === "asap") {
                                updateShipping({ date: new Date().toISOString().split("T")[0] });
                              }
                            }}
                            className={cn(
                              "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-xs transition-all",
                              shippingDetails.date !== "asap"
                                ? "border-primary bg-primary/5 text-primary font-semibold"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
                            )}
                          >
                            <span className="font-semibold text-[11px] uppercase tracking-wide">Fecha preferida</span>
                            <span className="text-[10px] text-muted-foreground font-normal">Elegir en calendario</span>
                          </button>
                        </div>
                      </div>

                      {/* Calendar date picker */}
                      <div className="space-y-1">
                        <Popover open={calendarOpen && shippingDetails.date !== "asap"} onOpenChange={(o) => {
                          if (shippingDetails.date === "asap") return;
                          setCalendarOpen(o);
                        }}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              disabled={shippingDetails.date === "asap"}
                              className={cn(
                                "w-full flex items-center gap-2 h-9 rounded-md border px-3 py-2 text-sm text-left shadow-sm transition-colors",
                                "focus:outline-none focus:ring-1 focus:ring-ring",
                                shippingDetails.date === "asap"
                                  ? "bg-muted/40 border-border/40 text-muted-foreground/50 cursor-not-allowed opacity-60 pointer-events-none"
                                  : cn(
                                      "bg-background border-input hover:border-primary/50",
                                      deliveryErrors.date && "border-destructive"
                                    )
                              )}
                            >
                              <CalendarIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                              <span className={cn(
                                "flex-1",
                                shippingDetails.date === "asap" || !shippingDetails.date
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              )}>
                                {shippingDetails.date && shippingDetails.date !== "asap" && isValid(parseISO(shippingDetails.date))
                                  ? format(parseISO(shippingDetails.date), "dd/MM/yyyy")
                                  : "Seleccionar fecha"}
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={shippingDetails.date && shippingDetails.date !== "asap" && isValid(parseISO(shippingDetails.date))
                                ? parseISO(shippingDetails.date)
                                : undefined
                              }
                              onSelect={(day) => {
                                if (day) {
                                  updateShipping({ date: format(day, "yyyy-MM-dd") });
                                  setCalendarOpen(false);
                                }
                              }}
                              disabled={{ before: new Date() }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {deliveryErrors.date
                          ? <p className="text-[11px] text-destructive">{deliveryErrors.date}</p>
                          : shippingDetails.date !== "asap" && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Info className="h-2.5 w-2.5" />
                              La fecha preferida está sujeta a confirmación logística.
                            </p>
                          )
                        }
                      </div>

                      {/* Time slot + Delivery type */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("createOrder.step3.timeSlot")}</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={shippingDetails.delivery.timeSlot}
                            onChange={(e) => updateShipping({ timeSlot: e.target.value as any })}
                          >
                            <option value="all_day">{t("createOrder.step3.allDay")}</option>
                            <option value="morning">{t("createOrder.step3.morning")}</option>
                            <option value="afternoon">{t("createOrder.step3.afternoon")}</option>
                            <option value="custom">{t("createOrder.step3.custom")}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("createOrder.step3.deliveryType")}</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={shippingDetails.delivery.type}
                            onChange={(e) => updateShipping({ type: e.target.value as any })}
                          >
                            <option value="standard">{t("createOrder.step3.standard")}</option>
                            <option value="pickup">{t("createOrder.step3.pickup")}</option>
                            <option value="urgent">{t("createOrder.step3.urgent")}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-center border-t border-border mt-2">
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      {t("createOrder.step3.back")}
                    </Button>
                    <Button
                      size="lg"
                      className="px-8 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isDeliveryValid || isValidatingItems}
                      onClick={async () => {
                        const { valid, errors } = validateDeliveryDetails();
                        setDeliveryErrors(errors);
                        if (!valid) return;

                        const itemsValid = await validateOrderItems();
                        if (!itemsValid) {
                          setStep(2);
                          return;
                        }

                        setShowConfirmation(true);
                      }}
                    >
                      {isValidatingItems ? "..." : t("createOrder.step3.finalize")} <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ConfirmationModal
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onConfirm={() => {
            setStep(4);
            handleConfirm();
          }}
          total={total}
        />
      </div>
    </AppLayout>
  );
}
