import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsers } from "@/hooks/useUsers";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  Mail,
  Plus,
  Search,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const { users, isLoading } = useUsers();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  const filteredUsers = users.filter((user) => {
    const term = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.customer_name?.toLowerCase().includes(term)
    );
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">{t("adminUsers.form.roleOptions.admin")}</Badge>;
      case "commercial":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{t("adminUsers.form.roleOptions.commercial")}</Badge>;
      case "logistics":
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">{t("adminUsers.form.roleOptions.logistics")}</Badge>;
      case "customer":
      default:
        return <Badge variant="outline" className="text-slate-600 border-slate-200">{t("adminUsers.form.roleOptions.customer")}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                {t("adminUsers.title")}
              </h1>
              {!isLoading && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 h-5 font-normal bg-indigo-500/10 text-indigo-700 border-indigo-200"
                >
                  {t(users.length === 1 ? "adminUsers.userCount_one" : "adminUsers.userCount_other", { count: users.length })}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("adminUsers.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => navigate("/admin/users/new")}
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("adminUsers.newUser")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-none p-4 space-y-4 border-b">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminUsers.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden min-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[280px]">{t("adminUsers.columns.name")}</TableHead>
                  <TableHead>{t("adminUsers.columns.email")}</TableHead>
                  <TableHead>{t("adminUsers.columns.role")}</TableHead>
                  <TableHead>{t("adminUsers.columns.company")}</TableHead>
                  <TableHead>{t("adminUsers.columns.status")}</TableHead>
                  <TableHead className="text-right">{t("adminUsers.columns.createdAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">{t("common.loading")}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {t("adminUsers.noUsers")}
                        </h3>
                        <Button
                          onClick={() => navigate("/admin/users/new")}
                          className="gap-2 mt-6"
                        >
                          <UserPlus className="h-4 w-4" />
                          {t("adminUsers.newUser")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="group hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm text-foreground">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm">
                        {user.role === "customer" ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-slate-700">
                              {user.customer_name || "-"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-5"
                        >
                          {t("adminUsers.statusActive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {user.created_at
                          ? format(new Date(user.created_at), "dd MMM yyyy", {
                              locale: es,
                            })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
