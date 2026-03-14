import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/useCustomers";
import { useUsers } from "@/hooks/useUsers";
import {
  Ban,
  Building2,
  ChevronLeft,
  Mail,
  Save,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminUserNew() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { createUser } = useUsers();
  const { customers } = useCustomers();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "commercial",
    customer_id: "",
  });

  const handleSubmit = async (sendInvite: boolean) => {
    if (!formData.name || !formData.email) {
      toast.error(t("common.required"));
      return;
    }
    if (formData.role === "customer" && !formData.customer_id) {
      toast.error(t("adminUsers.toasts.missingCompany"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        customer_id: formData.role === "customer" ? formData.customer_id : undefined,
      }, sendInvite);
      toast.success(sendInvite ? t("adminUsers.toasts.created") : t("adminUsers.toasts.saved"));
      navigate("/admin/users");
    } catch {
      toast.error(t("adminUsers.toasts.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-full bg-slate-50/50 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/users")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-100 border"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                {t("adminUsers.newUserTitle")}
              </h1>
              <p className="text-xs text-muted-foreground">{t("adminUsers.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/users")}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Save className="h-3.5 w-3.5" />
              {isSubmitting ? t("common.loading") : t("adminUsers.form.saveButton", "Save User")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? t("common.loading") : t("adminUsers.form.createButton")}
            </Button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }} className="max-w-2xl mx-auto p-6 space-y-5">

          {/* Section 1: User Information */}
          <Card className="shadow-sm border-border">
            <CardHeader className="border-b bg-slate-50/70 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-indigo-100 flex items-center justify-center">
                  <UserRound className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                {t("adminUsers.form.userInfo")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("adminUsers.form.userInfoDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium">
                  {t("adminUsers.form.name")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej: Antonio Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  {t("adminUsers.form.email")} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="antonio@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-9 pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Company (only for customer role) */}
          {formData.role === "customer" && (
            <Card className="shadow-sm border-amber-200 animate-in slide-in-from-top-1 fade-in duration-200">
              <CardHeader className="border-b bg-amber-50/50 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-amber-100 flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  {t("adminUsers.form.companySection")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("adminUsers.form.companySectionDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-2">
                  <Label htmlFor="customer_id" className="text-xs font-medium">
                    {t("adminUsers.form.companyLabel")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(val) => setFormData({ ...formData, customer_id: val })}
                  >
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder={t("adminUsers.form.companyPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.name}</span>
                            {c.cif && (
                              <span className="text-muted-foreground text-xs">({c.cif})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 3: Access & Permissions */}
          <Card className="shadow-sm border-border">
            <CardHeader className="border-b bg-slate-50/70 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
                </div>
                {t("adminUsers.form.accessSection")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("adminUsers.form.accessSectionDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-medium">
                  {t("adminUsers.form.role")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value, customer_id: "" })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("adminUsers.form.roleOptions.admin")}</SelectItem>
                    <SelectItem value="commercial">{t("adminUsers.form.roleOptions.commercial")}</SelectItem>
                    <SelectItem value="logistics">{t("adminUsers.form.roleOptions.logistics")}</SelectItem>
                    <SelectItem value="customer">{t("adminUsers.form.roleOptions.customer")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground pt-0.5">
                  {t("adminUsers.form.roleHint")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invite notice */}
          <div className="flex items-start gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-md">
            <Send className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-700">
              {t("adminUsers.form.inviteNotice")}
            </p>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
