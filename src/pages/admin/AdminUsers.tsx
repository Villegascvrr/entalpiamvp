import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/useCustomers";
import { useUsers, UserRow, UserStatus } from "@/hooks/useUsers";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const { users, isLoading, toggleUserStatus, resendInvite, resetPassword } = useUsers();
  const { customers } = useCustomers();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    // 1. Search (name or email)
    const term = searchQuery.toLowerCase();
    const searchMatch =
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);

    // 2. Role
    const roleMatch = roleFilter === "all" || user.role === roleFilter;

    // 3. Status
    const statusMatch = statusFilter === "all" || user.status === statusFilter;

    // 4. Company
    const companyMatch = companyFilter === "all" || user.customer_id === companyFilter;

    return searchMatch && roleMatch && statusMatch && companyMatch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-100">
            {t("adminUsers.form.roleOptions.admin")}
          </Badge>
        );
      case "commercial":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
            {t("adminUsers.form.roleOptions.commercial")}
          </Badge>
        );
      case "logistics":
        return (
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
            {t("adminUsers.form.roleOptions.logistics")}
          </Badge>
        );
      case "customer":
      default:
        return (
          <Badge variant="outline" className="text-slate-600 border-slate-200">
            {t("adminUsers.form.roleOptions.customer")}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] h-5 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            {t("adminUsers.statusActive")}
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
            {t("adminUsers.statusInvited")}
          </Badge>
        );
      case "disabled":
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] h-5 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block" />
            {t("adminUsers.statusDisabled")}
          </Badge>
        );
    }
  };

  const formatLastLogin = (dateStr?: string) => {
    if (!dateStr) return <span className="text-muted-foreground/50 text-xs">—</span>;
    return (
      <span className="text-xs text-muted-foreground" title={format(new Date(dateStr), "dd MMM yyyy HH:mm", { locale: es })}>
        {formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })}
      </span>
    );
  };

  const handleToggleStatus = async (user: UserRow) => {
    await toggleUserStatus(user.id, !user.is_active);
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
                  {t(
                    users.length === 1
                      ? "adminUsers.userCount_one"
                      : "adminUsers.userCount_other",
                    { count: users.length }
                  )}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("adminUsers.subtitle")}</p>
          </div>
          <Button
            onClick={() => navigate("/admin/users/new")}
            size="sm"
            className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            {t("adminUsers.newUser")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-none px-6 py-3 border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminUsers.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm w-full"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminUsers.filters.roles.all")}</SelectItem>
                <SelectItem value="admin">{t("adminUsers.form.roleOptions.admin")}</SelectItem>
                <SelectItem value="commercial">{t("adminUsers.form.roleOptions.commercial")}</SelectItem>
                <SelectItem value="logistics">{t("adminUsers.form.roleOptions.logistics")}</SelectItem>
                <SelectItem value="customer">{t("adminUsers.form.roleOptions.customer")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminUsers.filters.status.all")}</SelectItem>
                <SelectItem value="active">{t("adminUsers.statusActive")}</SelectItem>
                <SelectItem value="invited">{t("adminUsers.statusInvited")}</SelectItem>
                <SelectItem value="disabled">{t("adminUsers.statusDisabled")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-[220px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminUsers.filters.companies.all")}</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden min-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[240px]">{t("adminUsers.columns.name")}</TableHead>
                  <TableHead>{t("adminUsers.columns.email")}</TableHead>
                  <TableHead>{t("adminUsers.columns.role")}</TableHead>
                  <TableHead>{t("adminUsers.columns.company")}</TableHead>
                  <TableHead>{t("adminUsers.columns.status")}</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {t("adminUsers.columns.lastLogin")}
                    </span>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">{t("common.loading")}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-[300px] text-center">
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
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      className="group hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <TableCell className="py-3">
                        <span
                          className={`font-semibold text-sm ${
                            user.status === "disabled"
                              ? "text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {user.name}
                        </span>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>{getRoleBadge(user.role)}</TableCell>

                      {/* Company */}
                      <TableCell className="text-sm">
                        {user.role === "customer" ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-slate-700 text-xs">
                              {user.customer_name || "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(user.status)}</TableCell>

                      {/* Last Login */}
                      <TableCell>{formatLastLogin(user.last_login)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                              className="gap-2"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {t("adminUsers.actions.edit")}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              className={`gap-2 ${
                                user.is_active
                                  ? "text-red-600 focus:text-red-600 focus:bg-red-50"
                                  : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                              }`}
                            >
                              {user.is_active ? (
                                <>
                                  <Ban className="h-3.5 w-3.5" />
                                  {t("adminUsers.actions.disable")}
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {t("adminUsers.actions.enable")}
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => resendInvite(user.id)}
                              className="gap-2"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              {t("adminUsers.actions.resendInvite")}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => resetPassword(user.email)}
                              className="gap-2"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              {t("adminUsers.actions.resetPassword")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
