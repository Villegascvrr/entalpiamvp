import React from "react";
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
import AdminStock from "./pages/admin/AdminStock";
import AdminAssistance from "./pages/admin/AdminAssistance";
import CreateOrder from "./pages/admin/CreateOrder";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminLayout from "./components/layout/AdminLayout";
import AdminProductDetail from "./pages/admin/AdminProductDetail";
import CustomerDetail from "./pages/commercial/CustomerDetail";
import Customers from "./pages/commercial/Customers";

const queryClient = new QueryClient();

// ── Auth Guard: shows loading spinner or Login when not authenticated ──
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useActor();

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

// ── Login Gate: redirects to /dashboard if already authenticated ──
function LoginGate() {
  const { isAuthenticated, isLoading } = useActor();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
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
                  {/* ── Public routes ── */}
                  <Route path="/shary" element={<SharyLanding />} />
                  <Route path="/login" element={<LoginGate />} />

                  {/* ── Protected routes: flat, each individually wrapped with AuthGate ──
                      NOTE: Avoids nested <Routes> inside <Route path="/*"> which caused
                      the double-render / double "Iniciando aplicación..." bug.
                  */}

                  {/* Main Dashboard */}
                  <Route path="/dashboard" element={<AuthGate><MainDashboard /></AuthGate>} />

                  {/* Customer Routes */}
                  <Route path="/order/new" element={<AuthGate><RoleGate roles={["customer", "admin"]}><CreateOrder /></RoleGate></AuthGate>} />
                  <Route path="/order/preview" element={<AuthGate><RoleGate roles={["customer", "admin"]}><OrderPreview /></RoleGate></AuthGate>} />
                  <Route path="/orders" element={<AuthGate><RoleGate roles={["customer", "admin"]}><MyOrders /></RoleGate></AuthGate>} />
                  <Route path="/orders/history" element={<AuthGate><RoleGate roles={["customer", "admin"]}><OrderHistory /></RoleGate></AuthGate>} />
                  <Route path="/orders/:id" element={<AuthGate><RoleGate roles={["customer", "admin"]}><OrderDetail /></RoleGate></AuthGate>} />

                  {/* Commercial Routes */}
                  <Route path="/commercial/orders" element={<AuthGate><RoleGate roles={["commercial", "admin"]}><PlaceholderPage title="Pedidos Pendientes (Comercial)" /></RoleGate></AuthGate>} />
                  <Route path="/commercial/customers" element={<AuthGate><RoleGate roles={["commercial", "admin"]}><Customers /></RoleGate></AuthGate>} />
                  <Route path="/commercial/customers/:id" element={<AuthGate><RoleGate roles={["commercial", "admin"]}><CustomerDetail /></RoleGate></AuthGate>} />

                  {/* Logistics Routes */}
                  <Route path="/logistics/prep" element={<AuthGate><RoleGate roles={["logistics", "admin"]}><PlaceholderPage title="Preparación de Pedidos" /></RoleGate></AuthGate>} />
                  <Route path="/logistics/shipping" element={<AuthGate><RoleGate roles={["logistics", "admin"]}><PlaceholderPage title="Gestión de Envíos" /></RoleGate></AuthGate>} />
                  <Route path="/logistics/delivery-notes" element={<AuthGate><RoleGate roles={["logistics", "admin"]}><PlaceholderPage title="Albaranes" /></RoleGate></AuthGate>} />

                  {/* Admin flat routes */}
                  <Route path="/admin/dashboard" element={<AuthGate><RoleGate roles={["admin"]}><AdminDashboard /></RoleGate></AuthGate>} />
                  <Route path="/admin/pricing" element={<AuthGate><RoleGate roles={["admin", "commercial"]}><AdminPricing /></RoleGate></AuthGate>} />
                  <Route path="/admin/stock" element={<AuthGate><RoleGate roles={["admin", "logistics"]}><AdminStock /></RoleGate></AuthGate>} />
                  <Route path="/admin/orders" element={<AuthGate><RoleGate roles={["admin"]}><AdminOrders /></RoleGate></AuthGate>} />
                  <Route path="/admin/orders/new" element={<AuthGate><RoleGate roles={["admin"]}><CreateOrder /></RoleGate></AuthGate>} />
                  <Route path="/admin/assistance" element={<AuthGate><RoleGate roles={["admin", "commercial"]}><AdminAssistance /></RoleGate></AuthGate>} />

                  {/* Admin layout routes (AdminLayout with Outlet for nested pages) */}
                  <Route path="/admin" element={<AuthGate><AdminLayout /></AuthGate>}>
                    <Route path="products" element={<RoleGate roles={["admin"]}><AdminProducts /></RoleGate>} />
                    <Route path="products/new" element={<RoleGate roles={["admin"]}><AdminProductDetail /></RoleGate>} />
                    <Route path="products/:code/edit" element={<RoleGate roles={["admin"]}><AdminProductDetail /></RoleGate>} />
                  </Route>

                  {/* Redirect root → dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
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
