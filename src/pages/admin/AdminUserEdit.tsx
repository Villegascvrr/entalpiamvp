import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
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
import { useUsers, UserStatus } from "@/hooks/useUsers";
import {
  Ban,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function AdminUserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { users, updateUser, disableUser, enableUser, deleteUser } = useUsers();
  const { customers } = useCustomers();

  const user = users.find((u) => u.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "commercial",
    is_active: true,
    customer_id: "",
  });

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        customer_id: user.customer_id ?? "",
      });
    }
  }, [user]);

  if (!user && users.length > 0) {
    return (
      <AppLayout>
        <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <p className="text-sm">{t("adminUsers.userNotFound")}</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("adminUsers.backToUsers")}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await updateUser(id!, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
        customer_id: formData.role === "customer" ? formData.customer_id : undefined,
      });
      toast.success(t("adminUsers.toasts.updated"));
      navigate("/admin/users");
    } catch {
      toast.error(t("adminUsers.toasts.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (!user) return;
    await disableUser(user.id);
    setFormData((prev) => ({ ...prev, is_active: false }));
  };

  const handleEnable = async () => {
    if (!user) return;
    await enableUser(user.id);
    setFormData((prev) => ({ ...prev, is_active: true }));
  };

  const handleDelete = async () => {
    if (!user) return;
    await deleteUser(user.id);
    navigate("/admin/users");
  };

  // Derive the display status from the persisted user status
  // (use user.status as source of truth, not formData.is_active)
  const currentStatus: UserStatus = user?.status ?? "draft";

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "active":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1.5" />
            {t("adminUsers.statusActive")}
          </Badge>
        );
      case "pending_invite":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block mr-1.5" />
            {t("adminUsers.statusPendingInvite")}
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-slate-50 text-slate-500 border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block mr-1.5" />
            {t("adminUsers.statusDraft")}
          </Badge>
        );
      case "deleted":
        return (
          <Badge className="bg-red-50 text-red-500 border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block mr-1.5" />
            {t("adminUsers.statusDeleted")}
          </Badge>
        );
      case "disabled":
      default:
        return (
          <Badge className="bg-slate-700 text-white border-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 inline-block mr-1.5" />
            {t("adminUsers.statusDisabled")}
          </Badge>
        );
    }
  };

  // Show status info for the status card
  const isDisabled = currentStatus === "disabled" || currentStatus === "deleted";

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
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-900">
                  {t("adminUsers.editUserTitle")}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/users")}
              disabled={isSubmitting}
            >
              {t("adminUsers.buttons.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              {isSubmitting ? t("common.loading") : t("adminUsers.buttons.saveUser")}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* LEFT COLUMN (main content) */}
          <div className="xl:col-span-7 space-y-6">
            {/* User Information */}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-9 pl-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (secondary controls) */}
          <div className="xl:col-span-5 space-y-6">
            {/* Access & Permissions */}
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
              <CardContent className="pt-5 space-y-5">
                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-medium">
                    {t("adminUsers.form.role")}
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value, customer_id: "" })
                    }
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
                </div>

                {/* Status control */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t("adminUsers.columns.status")}</Label>
                  <div className="flex items-center justify-between p-3 rounded-md border bg-white">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isDisabled ? "bg-slate-100" : "bg-emerald-100"
                        }`}
                      >
                        {isDisabled ? (
                          <Ban className="h-4 w-4 text-slate-400" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isDisabled
                            ? t("adminUsers.statusDisabled")
                            : t("adminUsers.statusActive")}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                          {isDisabled
                            ? t("adminUsers.statusDisabledDesc")
                            : t("adminUsers.statusActiveDesc")}
                        </p>
                      </div>
                    </div>
                    {currentStatus !== "deleted" && currentStatus !== "draft" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={isDisabled ? handleEnable : handleDisable}
                        className={`text-xs h-7 px-2 ${
                          isDisabled
                            ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            : "text-amber-600 border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        {isDisabled
                          ? t("adminUsers.actions.enable")
                          : t("adminUsers.actions.disable")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company (only for customer role) */}
            {formData.role === "customer" && (
              <Card className="shadow-sm border-amber-200 animate-in slide-in-from-top-1 fade-in duration-200">
                <CardHeader className="border-b bg-amber-50/50 pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-amber-100 flex items-center justify-center">
                      <Building2 className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    {t("adminUsers.form.companySection")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
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
                                <span className="text-muted-foreground text-[10px]">({c.cif})</span>
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

            {/* Danger Zone */}
            {currentStatus !== "deleted" && !user?.auth_user_id && (
              <Card className="shadow-sm border-red-100">
                <CardHeader className="border-b bg-red-50/50 pb-3">
                  <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-red-100 flex items-center justify-center">
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    {t("adminUsers.dangerZone")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t("adminUsers.dangerZoneDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("adminUsers.actions.delete")}
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center leading-tight flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 inline-block" />
                    {t("adminUsers.deleteNotice")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
