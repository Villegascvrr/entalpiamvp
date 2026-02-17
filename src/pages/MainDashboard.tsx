import { useActor } from "@/contexts/ActorContext";
import CustomerDashboard from "./CustomerDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import CommercialDashboard from "./commercial/CommercialDashboard";
import LogisticsDashboard from "./logistics/LogisticsDashboard";

export default function MainDashboard() {
  const { session } = useActor();

  if (!session) return null;

  switch (session.role) {
    case "admin":
      return <AdminDashboard />;
    case "commercial":
      return <CommercialDashboard />;
    case "logistics":
      return <LogisticsDashboard />;
    case "customer":
    default:
      return <CustomerDashboard />;
  }
}
