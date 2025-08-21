"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentStatusPage() {
  const params = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/changenow/status/${params.id}`);
        const data = await res.json();
        setStatus(data);
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      checkStatus();
      // Check status every 30 seconds
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  if (loading) return <div>Loading payment status...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment Status</h1>

        {status && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl mb-4">Transaction: {params.id}</h2>
            <p className="mb-2">
              Status: <span className="font-bold">{status.status}</span>
            </p>

            {status.exchange && (
              <div className="mt-4">
                <p>
                  Expected Amount: {status.exchange.amountExpectedFrom}{" "}
                  {status.exchange.fromCurrency?.toUpperCase()}
                </p>
                <p>
                  Payout Amount: {status.exchange.amountExpectedTo}{" "}
                  {status.exchange.toCurrency?.toUpperCase()}
                </p>
                <p>
                  Send to:{" "}
                  <code className="bg-gray-700 px-2 py-1 rounded">
                    {status.exchange.payinAddress}
                  </code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
