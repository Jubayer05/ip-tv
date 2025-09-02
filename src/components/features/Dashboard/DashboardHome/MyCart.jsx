"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "react-modal";

export default function ShoppingCartModal({ onClose, isOpen }) {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING = "YOUR CART (02)";
  const ORIGINAL_PREMIUM_PLAN = "PREMIUM PLAN";
  const ORIGINAL_SERVICE = "Service:";
  const ORIGINAL_DIGITAL_SUBSCRIPTION = "Digital Subscription Access";
  const ORIGINAL_PLAN = "Plan:";
  const ORIGINAL_DEVICES = "Devices:";
  const ORIGINAL_QUANTITY = "Quantity:";
  const ORIGINAL_ADULT_CHANNELS = "Adult Channels:";
  const ORIGINAL_OFF = "OFF";
  const ORIGINAL_PROCEED_CHECKOUT = "Proceed To Checkout";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [premiumPlan, setPremiumPlan] = useState(ORIGINAL_PREMIUM_PLAN);
  const [service, setService] = useState(ORIGINAL_SERVICE);
  const [digitalSubscription, setDigitalSubscription] = useState(
    ORIGINAL_DIGITAL_SUBSCRIPTION
  );
  const [plan, setPlan] = useState(ORIGINAL_PLAN);
  const [devices, setDevices] = useState(ORIGINAL_DEVICES);
  const [quantity, setQuantity] = useState(ORIGINAL_QUANTITY);
  const [adultChannels, setAdultChannels] = useState(ORIGINAL_ADULT_CHANNELS);
  const [off, setOff] = useState(ORIGINAL_OFF);
  const [proceedCheckout, setProceedCheckout] = useState(
    ORIGINAL_PROCEED_CHECKOUT
  );
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_PREMIUM_PLAN,
        ORIGINAL_SERVICE,
        ORIGINAL_DIGITAL_SUBSCRIPTION,
        ORIGINAL_PLAN,
        ORIGINAL_DEVICES,
        ORIGINAL_QUANTITY,
        ORIGINAL_ADULT_CHANNELS,
        ORIGINAL_OFF,
        ORIGINAL_PROCEED_CHECKOUT,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tPremiumPlan,
        tService,
        tDigitalSubscription,
        tPlan,
        tDevices,
        tQuantity,
        tAdultChannels,
        tOff,
        tProceedCheckout,
      ] = translated;

      setHeading(tHeading);
      setPremiumPlan(tPremiumPlan);
      setService(tService);
      setDigitalSubscription(tDigitalSubscription);
      setPlan(tPlan);
      setDevices(tDevices);
      setQuantity(tQuantity);
      setAdultChannels(tAdultChannels);
      setOff(tOff);
      setProceedCheckout(tProceedCheckout);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Set the app element for react-modal after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      Modal.setAppElement("body");
    }
  }, []);

  const handleCryptoPayment = async () => {
    try {
      setIsPaying(true);

      // Create exchange: User pays ETH, you receive ETH (for now)
      const exchangeRes = await fetch(
        "/api/payments/changenow/create-exchange",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromCurrency: "eth", // User pays in Ethereum
            toCurrency: "eth", // You receive Ethereum
            toAmount: 10, // 10 ETH worth
            address: "0xBE1058e92b7901987E168DaEa536B0F380F039b5", // Replace with your real ETH address
            refundAddress: "0xBE1058e92b7901987E168DaEa536B0F380F039b5", // Same address
          }),
        }
      );

      const exchangeData = await exchangeRes.json();
      if (exchangeRes.ok && exchangeData.success) {
        setPaymentData(exchangeData);
        setShowPaymentModal(true);
        localStorage.setItem("currentExchangeId", exchangeData.id);
      } else {
        console.error("Exchange creation failed:", exchangeData);
        alert(`Failed to create crypto exchange: ${exchangeData.error}`);
      }
    } catch (e) {
      console.error("Crypto payment error:", e);
      alert("Error creating crypto payment: " + e.message);
    } finally {
      setIsPaying(false);
      // close the modal
      handleClose();
    }
  };

  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 50,
    },
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "black",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "24px",
      padding: "32px",
      maxWidth: "600px",
      width: "100%",
      maxHeight: "90vh",
      overflow: "auto",
    },
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={handleClose}
        style={customStyles}
        contentLabel="Shopping Cart"
        className="font-secondary"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
            {heading}
          </h1>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {/* First Item - Detailed */}
          <div className="border border-cyan-400 rounded-xl p-4 bg-[#0e0e11]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {premiumPlan}
                </h3>
                <p className="text-sm font-semibold text-white/80">$87.93</p>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Trash2 size={20} />
              </button>
            </div>

            <div className="text-sm h-[0.5px] bg-[#313131] my-2" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">{service}</span>
                <span className="text-white">{digitalSubscription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">{plan}</span>
                <span className="text-white">Premium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">{devices}</span>
                <span className="text-white">04</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">{quantity}</span>
                <span className="text-white">02</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">{adultChannels}</span>
                <span className="text-white">{off}</span>
              </div>
            </div>
          </div>

          {/* Second Item - Simple */}
          <div className="card_bg_border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{premiumPlan}</h3>
                <p className="text-sm font-semibold text-white/80">$87.93</p>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Third Item - Simple */}
          <div className="card_bg_border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{premiumPlan}</h3>
                <p className="text-sm font-semibold text-white/80">$87.93</p>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="space-y-4">
          <Link href="https://vipstore.bgng.io/product/ip-tv">
            <button
              disabled={isPaying}
              className="w-full bg-cyan-400 text-black py-4 rounded-full font-semibold text-sm hover:bg-cyan-300 transition-colors"
            >
              {isPaying ? "Processing..." : proceedCheckout}
            </button>
          </Link>
        </div>
      </Modal>

      {/* Crypto Payment Instructions Modal */}
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 max-w-md w-full mx-4">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-cyan-400 text-2xl">🪙</span>
              </div>
              <h2 className="text-white text-xl font-bold mb-2">
                Crypto Payment Instructions
              </h2>
              <p className="text-gray-400 text-sm">
                Complete your payment to receive your order
              </p>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">Amount to send:</span>
                  <span className="text-cyan-400 font-bold">
                    {paymentData.exchange.amount} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">You'll receive:</span>
                  <span className="text-green-400 font-bold">
                    {paymentData.exchange.directedAmount ||
                      paymentData.toAmount}{" "}
                    ETH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Transaction ID:</span>
                  <span className="text-gray-400 text-xs font-mono">
                    {paymentData.id?.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Payment Address */}
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-300 text-sm mb-2 block">
                  Send to address:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={paymentData.payinAddress || paymentData.address}
                    readOnly
                    className="flex-1 bg-gray-700 text-white text-xs p-2 rounded border border-gray-600 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        paymentData.payinAddress || paymentData.address
                      );
                      // You could add a toast notification here
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Validity Period */}
              {paymentData.validUntil && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">⏰</span>
                    <span className="text-blue-300 text-sm">
                      Valid until:{" "}
                      {new Date(paymentData.validUntil).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-yellow-300 text-sm">
                  <strong>Important:</strong> Send the exact amount to avoid
                  delays!
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Optionally redirect to payment status page
                  // window.location.href = `/payment-status/${paymentData.id}`;
                  setShowPaymentModal(false);
                }}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Track Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
