import BillingTable from "@/components/features/Dashboard/OrderHistory/BillingTable";

export default function AdminOrdersPage() {
  return (
    <div className="px-4">
      <h2 className="text-2xl font-bold py-4">ORDER HISTORY</h2>
      <BillingTable />
    </div>
  );
}
