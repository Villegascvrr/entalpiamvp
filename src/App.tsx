import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ActorProvider, useActor } from "@/contexts/ActorContext";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Pages
import CustomerDashboard from "./pages/CustomerDashboard";
import OrderBuilder from "./pages/OrderBuilder";
import OrderPreview from "./pages/OrderPreview";
import MyOrders from "./pages/MyOrders";
import OrderHistory from "./pages/OrderHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminStock from "./pages/admin/AdminStock";
import AdminOrders from "./pages/admin/AdminOrders";
import CreateOrder from "./pages/admin/CreateOrder";
import MainDashboard from "./pages/MainDashboard";
import { RoleGate } from "./components/auth/RoleGate";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

// ── Auth Guard: shows Login when not authenticated ──
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useActor();
  const [showSpinner, setShowSpinner] = useState(false);
  const [showForceLogout, setShowForceLogout] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSpinner(false);
      setShowForceLogout(false);
      return;
    }
    // Only show spinner after 400ms (prevents flash on fast checks)
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 400);
    // Show force-logout after 5s (true stuck state)
    const forceTimer = setTimeout(() => setShowForceLogout(true), 5000);
    return () => {
      clearTimeout(spinnerTimer);
      clearTimeout(forceTimer);
    };
  }, [isLoading]);

  if (isLoading) {
    if (!showSpinner) {
      // Blank screen for first 400ms — no flash
      return <div className="min-h-screen bg-background" />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verificando sesión...</p>
          {showForceLogout && (
            <button
              onClick={async () => {
                const { supabase } = await import("@/lib/supabaseClient");
                localStorage.clear();
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium underline mt-2 cursor-pointer animate-in fade-in duration-300"
            >
              ¿Atascado? Reiniciar sesión
            </button>
          )}
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
                <AuthGate>
                  <Routes>
                    {/* Main Dashboard - Routes logic based on Role */}
                    <Route path="/dashboard" element={<MainDashboard />} />

                    {/* Customer Routes */}
                    <Route
                      path="/order/new"
                      element={
                        <RoleGate roles={['customer', 'admin']}>
                          <CreateOrder />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/order/preview"
                      element={
                        <RoleGate roles={['customer', 'admin']}>
                          <OrderPreview />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <RoleGate roles={['customer', 'admin']}>
                          <MyOrders />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/orders/history"
                      element={
                        <RoleGate roles={['customer', 'admin']}>
                          <OrderHistory />
                        </RoleGate>
                      }
                    />

                    {/* Commercial Routes */}
                    <Route
                      path="/commercial/orders"
                      element={
                        <RoleGate roles={['commercial', 'admin']}>
                          <PlaceholderPage title="Pedidos Pendientes (Comercial)" />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/commercial/customers"
                      element={
                        <RoleGate roles={['commercial', 'admin']}>
                          <PlaceholderPage title="Gestión de Clientes" />
                        </RoleGate>
                      }
                    />

                    {/* Logistics Routes */}
                    <Route
                      path="/logistics/prep"
                      element={
                        <RoleGate roles={['logistics', 'admin']}>
                          <PlaceholderPage title="Preparación de Pedidos" />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/logistics/shipping"
                      element={
                        <RoleGate roles={['logistics', 'admin']}>
                          <PlaceholderPage title="Gestión de Envíos" />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/logistics/delivery-notes"
                      element={
                        <RoleGate roles={['logistics', 'admin']}>
                          <PlaceholderPage title="Albaranes" />
                        </RoleGate>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <RoleGate roles={['admin']}>
                          <AdminDashboard />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/admin/pricing"
                      element={
                        <RoleGate roles={['admin', 'commercial']}>
                          <AdminPricing />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/admin/stock"
                      element={
                        <RoleGate roles={['admin', 'logistics']}>
                          <AdminStock />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <RoleGate roles={['admin']}>
                          <AdminOrders />
                        </RoleGate>
                      }
                    />
                    <Route
                      path="/admin/orders/new"
                      element={
                        <RoleGate roles={['admin']}>
                          <CreateOrder />
                        </RoleGate>
                      }
                    />

                    {/* Redirects */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthGate>
              </BrowserRouter>
            </OrderProvider>
          </ActorProvider>
        </TenantProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
