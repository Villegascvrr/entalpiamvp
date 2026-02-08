import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import NotFound from "./pages/NotFound";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Customer Routes */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/order/new" element={<OrderBuilder />} />
            <Route path="/order/preview" element={<OrderPreview />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/history" element={<OrderHistory />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/stock" element={<AdminStock />} />
            <Route path="/admin/orders" element={<AdminOrders />} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
