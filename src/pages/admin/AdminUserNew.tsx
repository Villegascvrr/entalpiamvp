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
import { Building2, ChevronLeft, Save } from "lucide-react";
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
      await createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        customer_id: formData.role === "customer" ? formData.customer_id : undefined,
      });
      navigate("/admin/users");
    } catch (error) {
      // toast is handled in hook or throw
      toast.error(t("adminUsers.toasts.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-full bg-slate-50/50 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin/users")}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white border shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {t("adminUsers.newUserTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("adminUsers.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users")}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4" />
                {isSubmitting ? t("common.loading") : t("adminUsers.form.createButton")}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="shadow-sm border-border">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg">
                  {t("adminUsers.form.userInfo")}
                </CardTitle>
                <CardDescription>
                  Datos de acceso de la nueva persona.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("adminUsers.form.name")}</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Antonio Pérez"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("adminUsers.form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="antonio@empresa.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="role">{t("adminUsers.form.role")}</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger className="shadow-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        {t("adminUsers.form.roleOptions.admin")}
                      </SelectItem>
                      <SelectItem value="commercial">
                        {t("adminUsers.form.roleOptions.commercial")}
                      </SelectItem>
                      <SelectItem value="logistics">
                        {t("adminUsers.form.roleOptions.logistics")}
                      </SelectItem>
                      <SelectItem value="customer">
                        {t("adminUsers.form.roleOptions.customer")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {formData.role === "customer" && (
              <Card className="shadow-sm border-border animate-in slide-in-from-bottom-2 fade-in duration-300">
                <CardHeader className="border-b bg-amber-50/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-600" />
                    {t("adminUsers.form.companyLabel")}
                  </CardTitle>
                  <CardDescription>
                    Asignación obligatoria al perfil de cliente B2B.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer_id">
                      {t("adminUsers.form.companyLabel")}
                    </Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(val) =>
                        setFormData({ ...formData, customer_id: val })
                      }
                    >
                      <SelectTrigger className="shadow-sm bg-white w-full">
                        <SelectValue placeholder="Selecciona la empresa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{c.name}</span>
                              {c.cif && (
                                <span className="text-muted-foreground text-xs">
                                  ({c.cif})
                                </span>
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
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
