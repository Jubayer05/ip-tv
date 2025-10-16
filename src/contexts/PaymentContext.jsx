"use client";
import { createContext, useContext, useState } from "react";

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [orderWithCredentials, setOrderWithCredentials] = useState(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  const setOrderAndShowPopup = (order) => {
    setOrderWithCredentials(order);
    setShowPaymentConfirm(true);
  };

  const closePaymentConfirm = () => {
    setShowPaymentConfirm(false);
    setOrderWithCredentials(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        orderWithCredentials,
        showPaymentConfirm,
        setOrderAndShowPopup,
        closePaymentConfirm,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
