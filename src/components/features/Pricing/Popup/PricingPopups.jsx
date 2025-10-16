"use client";
import { usePayment } from "@/contexts/PaymentContext";
import PaymentConfirmPopup from "./PaymentConfirmPopup";

export default function PricingPopups(
  {
    // ... existing props ...
  }
) {
  const { orderWithCredentials, showPaymentConfirm, closePaymentConfirm } =
    usePayment();

  return (
    <>
      {/* ... other popups ... */}

      <PaymentConfirmPopup
        isOpen={showPaymentConfirm}
        onClose={closePaymentConfirm}
        order={orderWithCredentials}
      />
    </>
  );
}
