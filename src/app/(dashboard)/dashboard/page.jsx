import PremiumPlanCard from "@/components/features/Dashboard/DashboardHome/PremiumPlan";
import BillingTable from "@/components/features/Dashboard/OrderHistory/BillingTable";

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold py-2 sm:py-4 uppercase">
        User Dashboard & Order Tracking
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-5xl mx-auto">
        <PremiumPlanCard />
        {/* <PaymentMethodCard /> */}
      </div>
      <BillingTable />
    </div>
  );
}
