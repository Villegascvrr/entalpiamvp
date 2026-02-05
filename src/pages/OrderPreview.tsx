import { useLocation, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataCard } from "@/components/ui/data-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  Calendar,
  Building,
  Package,
  CheckCircle,
  Printer
} from "lucide-react";
import { useState } from "react";

interface OrderItem {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
  };
  quantity: number;
}

export default function OrderPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const orderItems: OrderItem[] = location.state?.orderItems || [];
  const orderTotal: number = location.state?.orderTotal || 0;

  const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (orderItems.length === 0 && !isSubmitted) {
    return (
      <AppLayout userRole="customer" userName="Marcus Chen" companyName="Metro Distributors">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Order to Preview</h2>
            <p className="text-muted-foreground mb-4">Please create an order first</p>
            <Link to="/order/new">
              <Button>Create New Order</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isSubmitted) {
    return (
      <AppLayout userRole="customer" userName="Marcus Chen" companyName="Metro Distributors">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 rounded-full bg-status-available/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-status-available" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Submitted!</h2>
            <p className="text-muted-foreground mb-2">
              Your order <span className="font-mono font-semibold text-foreground">{orderNumber}</span> has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You will receive a confirmation email shortly. Our team will process your order within 24 hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/orders">
                <Button variant="outline">View My Orders</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole="customer" userName="Marcus Chen" companyName="Metro Distributors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order Preview</h1>
              <p className="text-muted-foreground">Review your order before submission</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Order Document */}
        <div className="industrial-card">
          {/* Document Header */}
          <div className="p-6 border-b border-border bg-muted/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">OrderFlow</h2>
                  <p className="text-sm text-muted-foreground">Purchase Order</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-lg">{orderNumber}</p>
                <Badge variant="outline" className="border-status-low text-status-low">
                  Draft
                </Badge>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6 grid grid-cols-2 gap-6 border-b border-border">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer</p>
                  <p className="font-medium">Metro Distributors</p>
                  <p className="text-sm text-muted-foreground">Marcus Chen</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Date</p>
                  <p className="font-medium">{today}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Items
            </h3>
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Product</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, index) => (
                  <tr key={item.product.id}>
                    <td>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.product.id}</p>
                      </div>
                    </td>
                    <td className="text-center font-mono">
                      {item.quantity.toLocaleString()} {item.product.unit}
                    </td>
                    <td className="text-right font-mono">
                      €{item.product.price.toFixed(2)}
                    </td>
                    <td className="text-right font-mono font-semibold">
                      €{(item.quantity * item.product.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-6 bg-muted/20">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">€{orderTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono text-muted-foreground">TBD</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Order Total</span>
                  <span className="font-mono">€{orderTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  * Final pricing confirmed upon order acceptance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            By submitting this order, you agree to the current day's pricing and stock availability.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Edit Order
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Order
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
