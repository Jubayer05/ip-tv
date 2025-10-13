"use client";
import DepositPopup from "@/components/features/AffiliateRank/DepositPopup";
import BalanceCheckoutPopup from "../Popup/BalanceCheckoutPopup";
import GatewaySelectPopup from "../Popup/GatewaySelectPopup";
import GuestCheckoutPopup from "../Popup/GuestCheckoutPopup";
import PaymentConfirmPopup from "../Popup/PaymentConfirmPopup";
import RegisterFormPopup from "../Popup/RegisterFormPopup";
import ThankRegisterPopup from "../Popup/ThankRegisterPopup";

const PricingPopups = ({
  showThankYou,
  closeThankYou,
  showGuestCheckout,
  closeGuestCheckout,
  showRegisterForm,
  setShowRegisterForm,
  showPaymentConfirm,
  setShowPaymentConfirm,
  closePaymentConfirm,
  orderWithCredentials,
  setOrderWithCredentials,
  showGatewaySelect,
  setShowGatewaySelect,
  hideThankYouWhenOtherPopupOpens,
  showBalanceCheckout,
  setShowBalanceCheckout,
  handleBalancePaymentSuccess,
  showDepositPopup,
  setShowDepositPopup,
  handleDepositSuccess,
  placing,
  setPlacing,
  user,
}) => {
  return (
    <>
      <ThankRegisterPopup
        isOpen={showThankYou}
        onClose={closeThankYou}
        showPaymentConfirm={showPaymentConfirm}
        setShowPaymentConfirm={setShowPaymentConfirm}
        placing={placing}
        setPlacing={setPlacing}
        showGatewaySelect={showGatewaySelect}
        setShowGatewaySelect={setShowGatewaySelect}
        showBalanceCheckout={showBalanceCheckout}
        setShowBalanceCheckout={setShowBalanceCheckout}
        showDepositPopup={showDepositPopup}
        setShowDepositPopup={setShowDepositPopup}
        orderWithCredentials={orderWithCredentials}
        setOrderWithCredentials={setOrderWithCredentials}
        closePaymentConfirm={closePaymentConfirm}
        handleBalancePaymentSuccess={handleBalancePaymentSuccess}
        handleDepositSuccess={handleDepositSuccess}
        handleDepositFunds={() => setShowDepositPopup(true)}
        hideThankYouWhenOtherPopupOpens={hideThankYouWhenOtherPopupOpens}
      />
      <GuestCheckoutPopup
        isOpen={showGuestCheckout}
        onClose={closeGuestCheckout}
        setShowRegisterForm={setShowRegisterForm}
      />
      <RegisterFormPopup
        isOpen={showRegisterForm}
        onClose={() => setShowRegisterForm(false)}
      />
      <PaymentConfirmPopup
        isOpen={showPaymentConfirm}
        onClose={closePaymentConfirm}
        order={orderWithCredentials}
      />
      <GatewaySelectPopup
        isOpen={showGatewaySelect}
        onClose={() => {
          setShowGatewaySelect(false);
          hideThankYouWhenOtherPopupOpens();
        }}
        onSuccess={() => {
          hideThankYouWhenOtherPopupOpens();
        }}
      />
      <BalanceCheckoutPopup
        isOpen={showBalanceCheckout}
        onClose={() => {
          setShowBalanceCheckout(false);
          hideThankYouWhenOtherPopupOpens();
        }}
        onSuccess={() => {
          handleBalancePaymentSuccess();
          hideThankYouWhenOtherPopupOpens();
        }}
      />
      <DepositPopup
        isOpen={showDepositPopup}
        onClose={() => {
          setShowDepositPopup(false);
          hideThankYouWhenOtherPopupOpens();
        }}
        onSuccess={handleDepositSuccess}
        userId={user?._id}
        userEmail={user?.email}
      />
    </>
  );
};

export default PricingPopups;
