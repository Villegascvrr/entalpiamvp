import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActorProvider, useActor } from "@/contexts/ActorContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import SharyLanding from "./pages/landing/SharyLanding";
import NotFound from "./pages/NotFound";

// Pages
import { RoleGate } from "./components/auth/RoleGate";
import MainDashboard from "./pages/MainDashboard";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import OrderHistory from "./pages/OrderHistory";
import OrderPreview from "./pages/OrderPreview";
import PlaceholderPage from "./pages/PlaceholderPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPricing from "./pages/admin/AdminPricing";
// import AdminStock from "./pages/admin/AdminStock";
import CreateOrder from "./pages/admin/CreateOrder";
import CustomerDetail from "./pages/commercial/CustomerDetail";
import Customers from "./pages/commercial/Customers";

const queryClient = new QueryClient();

// ── Auth Guard: shows Login when not authenticated ──
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useActor();
  // STRICT ORDER: 1. Loading -> 2. Auth Check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Iniciando aplicación...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <TenantProvider>
          <ActorProvider>
            <OrderProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* ── Public routes: no authentication required ── */}
                  <Route path="/shary" element={<SharyLanding />} />

                  {/* ── Protected app: everything else goes through AuthGate ── */}
                  <Route
                    path="/*"
                    element={
                      <AuthGate>
                        <Routes>
                          {/* Main Dashboard - Routes logic based on Role */}
                          <Route path="/dashboard" element={<MainDashboard />} />

                          {/* Customer Routes */}
                          <Route
                            path="/order/new"
                            element={
                              <RoleGate roles={["customer", "admin"]}>
                                <CreateOrder />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/order/preview"
                            element={
                              <RoleGate roles={["customer", "admin"]}>
                                <OrderPreview />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <RoleGate roles={["customer", "admin"]}>
                                <MyOrders />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/orders/:id"
                            element={
                              <RoleGate roles={["customer", "admin"]}>
                                <OrderDetail />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/orders/history"
                            element={
                              <RoleGate roles={["customer", "admin"]}>
                                <OrderHistory />
                              </RoleGate>
                            }
                          />

                          {/* Commercial Routes */}
                          <Route
                            path="/commercial/orders"
                            element={
                              <RoleGate roles={["commercial", "admin"]}>
                                <PlaceholderPage title="Pedidos Pendientes (Comercial)" />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/commercial/customers"
                            element={
                              <RoleGate roles={["commercial", "admin"]}>
                                <Customers />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/commercial/customers/:id"
                            element={
                              <RoleGate roles={["commercial", "admin"]}>
                                <CustomerDetail />
                              </RoleGate>
                            }
                          />

                          {/* Logistics Routes */}
                          <Route
                            path="/logistics/prep"
                            element={
                              <RoleGate roles={["logistics", "admin"]}>
                                <PlaceholderPage title="Preparación de Pedidos" />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/logistics/shipping"
                            element={
                              <RoleGate roles={["logistics", "admin"]}>
                                <PlaceholderPage title="Gestión de Envíos" />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/logistics/delivery-notes"
                            element={
                              <RoleGate roles={["logistics", "admin"]}>
                                <PlaceholderPage title="Albaranes" />
                              </RoleGate>
                            }
                          />

                          {/* Admin Routes */}
                          <Route
                            path="/admin/dashboard"
                            element={
                              <RoleGate roles={["admin"]}>
                                <AdminDashboard />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/admin/pricing"
                            element={
                              <RoleGate roles={["admin", "commercial"]}>
                                <AdminPricing />
                              </RoleGate>
                            }
                          />
                          {/* <Route
                            path="/admin/stock"
                            element={
                              <RoleGate roles={["admin", "logistics"]}>
                                <AdminStock />
                              </RoleGate>
                            }
                          /> */}
                          <Route
                            path="/admin/orders"
                            element={
                              <RoleGate roles={["admin"]}>
                                <AdminOrders />
                              </RoleGate>
                            }
                          />
                          <Route
                            path="/admin/orders/new"
                            element={
                              <RoleGate roles={["admin"]}>
                                <CreateOrder />
                              </RoleGate>
                            }
                          />

                          {/* Redirects */}
                          <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                          />

                          {/* 404 */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AuthGate>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </OrderProvider>
          </ActorProvider>
        </TenantProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
