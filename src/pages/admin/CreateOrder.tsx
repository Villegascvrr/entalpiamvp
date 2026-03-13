import { AppLayout } from "@/components/layout/AppLayout";
import { AssistedContactDialog } from "@/components/layout/AssistedContactDialog";
import { ConfirmationModal } from "@/components/orders/ConfirmationModal";
import { OrderSuccess } from "@/components/orders/OrderSuccess";
import { OrderSummaryPanel } from "@/components/orders/OrderSummaryPanel";
import { ProductSelector } from "@/components/orders/ProductSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@/contexts/ActorContext";
import { useOrder } from "@/contexts/OrderContext";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  FileSearch,
  Headset,
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
  } = useOrder();

  const backPath = isInterno ? "/admin/orders" : "/dashboard";
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for Step 3
  const [copyClient, setCopyClient] = useState(true);
  const [copyInternal, setCopyInternal] = useState(true);
  const [stepTransition, setStepTransition] = useState(false);

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

  const total =
    items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.21;

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
                          <tr key={item.id} className="hover:bg-muted/10">
                            <td className="px-4 py-2">
                              <div className="font-medium text-foreground">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {item.id}
                              </div>
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
                      {t("createOrder.step2.subtotal")}
                    </h3>
                    <div className="flex justify-between text-sm">
                      <span>{t("createOrder.step2.subtotal")}</span>
                      <span className="font-mono">
                        €{(total / 1.21).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t("createOrder.step2.vat")}</span>
                      <span className="font-mono">
                        €{(total - total / 1.21).toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("createOrder.step2.total")}</span>
                      <span className="font-mono text-primary">
                        €{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    <Button
                      className="w-full font-bold shadow-md"
                      onClick={() => setStep(3)}
                    >
                      {t("createOrder.step2.continue")} <ChevronRight className="h-4 w-4 ml-1" />
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
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60"></span>
                      {t("createOrder.step3.notesSection")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-xs">
                          {t("createOrder.step3.deliveryInstructions")}
                        </Label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-ref"
                          placeholder={t("createOrder.step3.deliveryInstructionsPlaceholder")}
                          value={shippingDetails.delivery.instructions}
                          onChange={(e) =>
                            updateShipping({ instructions: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t("createOrder.step3.notifications")}</Label>
                        <div className="flex flex-col gap-2 p-3 bg-muted/5 rounded-md border border-border">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="c1"
                              checked={copyClient}
                              onCheckedChange={(c) => setCopyClient(!!c)}
                            />
                            <Label
                              htmlFor="c1"
                              className="text-xs font-normal cursor-pointer"
                            >
                              {t("createOrder.step3.copyClient")}
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="c2"
                              checked={copyInternal}
                              onCheckedChange={(c) => setCopyInternal(!!c)}
                            />
                            <Label
                              htmlFor="c2"
                              className="text-xs font-normal cursor-pointer"
                            >
                              {t("createOrder.step3.copyInternal")}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Address & Location */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                      {t("createOrder.step3.locationSection")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs">{t("createOrder.step3.deliveryAddress")}</Label>
                        <Input
                          value={shippingDetails.delivery.address}
                          onChange={(e) =>
                            updateShipping({ address: e.target.value })
                          }
                          placeholder={t("createOrder.step3.addressPlaceholder")}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t("createOrder.step3.cityLabel")}</Label>
                        <Input
                          value={shippingDetails.delivery.city}
                          onChange={(e) =>
                            updateShipping({ city: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">{t("createOrder.step3.postalCode")}</Label>
                          <Input
                            value={shippingDetails.delivery.postalCode}
                            onChange={(e) =>
                              updateShipping({ postalCode: e.target.value })
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t("createOrder.step3.province")}</Label>
                          <Input
                            value={shippingDetails.delivery.province}
                            onChange={(e) =>
                              updateShipping({ province: e.target.value })
                            }
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Contact & Logistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60"></span>
                        {t("createOrder.step3.contactSection")}
                      </h3>
                      <div className="space-y-2">
                        <Label className="text-xs">{t("createOrder.step3.contactName")}</Label>
                        <Input
                          value={shippingDetails.delivery.contactName}
                          onChange={(e) =>
                            updateShipping({ contactName: e.target.value })
                          }
                          placeholder={t("createOrder.step3.contactNamePlaceholder")}
                          className="h-9"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">{t("createOrder.step3.phone")}</Label>
                          <Input
                            value={shippingDetails.delivery.contactPhone}
                            onChange={(e) =>
                              updateShipping({ contactPhone: e.target.value })
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t("createOrder.step3.emailOptional")}</Label>
                          <Input
                            value={shippingDetails.delivery.contactEmail}
                            onChange={(e) =>
                              updateShipping({ contactEmail: e.target.value })
                            }
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60"></span>
                        {t("createOrder.step3.logisticsSection")}
                      </h3>
                      <div className="space-y-4">
                        <Label className="text-xs">{t("createOrder.step3.deliveryDate")}</Label>
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="datePreference"
                              checked={shippingDetails.date === "asap"}
                              onChange={() => updateShipping({ date: "asap" })}
                              className="accent-primary"
                            />
                            <span className="text-sm">{t("createOrder.step3.asap")}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="datePreference"
                              checked={shippingDetails.date !== "asap"}
                              onChange={() => {
                                updateShipping({ date: new Date().toISOString().split("T")[0] });
                              }}
                              className="accent-primary"
                            />
                            <span className="text-sm">{t("createOrder.step3.preferredDate")}</span>
                          </label>
                        </div>
                        
                        {shippingDetails.date !== "asap" && (
                          <div className="pt-2 animate-in fade-in zoom-in-95 duration-200">
                            <Input
                              type="date"
                              value={shippingDetails.date}
                              onChange={(e) =>
                                updateShipping({ date: e.target.value })
                              }
                              className="h-9 w-full sm:w-1/2"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                              {t("createOrder.step3.dateDisclaimer")}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">{t("createOrder.step3.timeSlot")}</Label>
                          <select
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={shippingDetails.delivery.timeSlot}
                            onChange={(e) =>
                              updateShipping({
                                timeSlot: e.target.value as any,
                              })
                            }
                          >
                            <option value="all_day">{t("createOrder.step3.allDay")}</option>
                            <option value="morning">{t("createOrder.step3.morning")}</option>
                            <option value="afternoon">{t("createOrder.step3.afternoon")}</option>
                            <option value="custom">{t("createOrder.step3.custom")}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t("createOrder.step3.deliveryType")}</Label>
                          <select
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={shippingDetails.delivery.type}
                            onChange={(e) =>
                              updateShipping({ type: e.target.value as any })
                            }
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
                      className="px-8 font-bold shadow-lg"
                      onClick={() => setShowConfirmation(true)}
                    >
                      {t("createOrder.step3.finalize")} <Send className="h-4 w-4 ml-2" />
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
