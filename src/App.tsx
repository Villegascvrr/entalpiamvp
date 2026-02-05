import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Pages
import LoginPage from "./pages/LoginPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import OrderBuilder from "./pages/OrderBuilder";
import OrderPreview from "./pages/OrderPreview";
import MyOrders from "./pages/MyOrders";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminStock from "./pages/admin/AdminStock";
import AdminOrders from "./pages/admin/AdminOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Customer Routes */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/order/new" element={<OrderBuilder />} />
          <Route path="/order/preview" element={<OrderPreview />} />
          <Route path="/orders" element={<MyOrders />} />
          
          {/* Admin Routes */}
          <Route path="/admin/pricing" element={<AdminPricing />} />
          <Route path="/admin/stock" element={<AdminStock />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
