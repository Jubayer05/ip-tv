import { useState } from "react";

export const usePopupStates = () => {
  // Extract all popup state management
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [showGatewaySelect, setShowGatewaySelect] = useState(false);
  const [showBalanceCheckout, setShowBalanceCheckout] = useState(false);
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [orderWithCredentials, setOrderWithCredentials] = useState(null);

  // Handler functions
  const closePaymentConfirm = () => {
    setShowPaymentConfirm(false);
    setOrderWithCredentials(null);
  };

  const handleBalancePaymentSuccess = () => {
    setShowPaymentConfirm(true);
  };

  const handleDepositSuccess = async () => {
    setShowDepositPopup(false);
    setTimeout(async () => {
      window.location.reload();
    }, 1500);
  };

  const hideThankYouWhenOtherPopupOpens = () => {
    setShowThankYou(false);
  };

  const closeThankYou = () => {
    setShowThankYou(false);
  };

  const closeGuestCheckout = () => {
    setShowGuestCheckout(false);
  };

  return {
    // States
    showGuestCheckout,
    setShowGuestCheckout,
    showThankYou,
    setShowThankYou,
    showRegisterForm,
    setShowRegisterForm,
    showPaymentConfirm,
    setShowPaymentConfirm,
    placing,
    setPlacing,
    showGatewaySelect,
    setShowGatewaySelect,
    showBalanceCheckout,
    setShowBalanceCheckout,
    showDepositPopup,
    setShowDepositPopup,
    orderWithCredentials,
    setOrderWithCredentials,

    // Handlers
    closePaymentConfirm,
    handleBalancePaymentSuccess,
    handleDepositSuccess,
    hideThankYouWhenOtherPopupOpens,
    closeThankYou,
    closeGuestCheckout,
  };
};
