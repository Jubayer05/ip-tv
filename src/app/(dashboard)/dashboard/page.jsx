import BillingTable from "@/components/features/Dashboard/OrderHistory/BillingTable";
import PaymentMethodCard from "@/components/features/Dashboard/DashboardHome/PaymentMethod";
import PremiumPlanCard from "@/components/features/Dashboard/DashboardHome/PremiumPlan";

export default function DashboardPage() {
  return (
    <div className="">
      <h2 className="text-2xl font-bold py-4">
        User Dashboard & Order Tracking
      </h2>
      <div className="flex gap-6 max-w-5xl mx-auto">
        <PremiumPlanCard />
        <PaymentMethodCard />
      </div>
      <BillingTable />
    </div>
  );
}
