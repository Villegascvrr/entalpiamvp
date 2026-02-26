import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/useCustomers";
import {
  Briefcase,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Helper to generate consistent visual status from ID
const getCustomerStatus = (id: string): "active" | "inactive" | "risk" => {
  const charCode = id.charCodeAt(id.length - 1) || 0;
  const statuses: ("active" | "inactive" | "risk")[] = [
    "active",
    "active",
    "active",
    "inactive",
    "risk",
  ];
  return statuses[charCode % statuses.length];
};

function StatusBadge({
  status,
}: {
  status: "active" | "inactive" | "risk";
}) {
  const { t } = useTranslation();

  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-5"
        >
          {t("customers.statusActive")}
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-500 border-slate-500/20 text-[10px] h-5"
        >
          {t("customers.statusInactive")}
        </Badge>
      );
    case "risk":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] h-5"
        >
          {t("customers.statusRisk")}
        </Badge>
      );
  }
}

export default function Customers() {
  const { customers, isLoading } = useCustomers();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const { t } = useTranslation();

  const provinces = Array.from(
    new Set(customers.map((c) => c.province).filter(Boolean)),
  ).sort();

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contact_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.cif?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvince =
      provinceFilter === "all" || customer.province === provinceFilter;

    return matchesSearch && matchesProvince;
  });

  const activeCount = filteredCustomers.filter(
    (c) => getCustomerStatus(c.id) === "active",
  ).length;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border/60">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-600" />
                {t("customers.title")}
              </h1>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-5 font-normal bg-sky-500/10 text-sky-700 border-sky-200"
              >
                {activeCount} {t("customers.statusActive").toLowerCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("customers.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => navigate("/commercial/customers/new")}
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("customers.newCustomer")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-none p-4 space-y-4 border-b">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("customers.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            <select
              className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
            >
              <option value="all">{t("customers.allProvinces")}</option>
              {provinces.map((p) => (
                <option key={p} value={p as string}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[300px]">{t("customers.columns.company")}</TableHead>
                  <TableHead>{t("customers.columns.tier")}</TableHead>
                  <TableHead>{t("customers.columns.status")}</TableHead>
                  <TableHead>{t("customers.columns.province")}</TableHead>
                  <TableHead>{t("customers.columns.cif")}</TableHead>
                  <TableHead>{t("customers.columns.contact")}</TableHead>
                  <TableHead>{t("customers.columns.data")}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
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
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Briefcase className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {t("customers.noCustomers")}
                        </h3>
                        <Button
                          onClick={() =>
                            navigate("/commercial/customers/new")
                          }
                          className="gap-2 mt-6"
                        >
                          <UserPlus className="h-4 w-4" />
                          {t("customers.newCustomer")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const status = getCustomerStatus(customer.id);
                    const initials = customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow
                        key={customer.id}
                        className="group cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() =>
                          navigate(`/commercial/customers/${customer.id}`)
                        }
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarFallback className="text-xs font-medium text-slate-600 bg-slate-100">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-sm text-foreground">
                                {customer.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {t("customers.salePoints", { count: customer.sales_points })}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.discount_tier ? (
                            <Badge
                              variant="secondary"
                              className="font-normal text-[10px] bg-violet-50 text-violet-700 border-violet-200"
                            >
                              {customer.discount_tier.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>
                          {customer.province ? (
                            <Badge
                              variant="secondary"
                              className="font-normal text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              {customer.province}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {customer.cif || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {customer.contact_name ? (
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <span>{customer.contact_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {customer.email && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-sky-600">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/commercial/customers/${customer.id}`,
                                  )
                                }
                              >
                                {t("customerDetail.backToCustomers").replace("Volver a ", "Ver ")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/order/new?customer=${customer.id}`)
                                }
                              >
                                {t("sidebar.customer.createOrder")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
