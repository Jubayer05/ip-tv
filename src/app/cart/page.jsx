"use client";

import PricingPopups from "@/components/features/Pricing/components/PricingPopups";
import { usePopupStates } from "@/components/features/Pricing/hooks/usePopupStates";
import CartCheckoutPopup from "@/components/features/Pricing/Popup/CartCheckoutPopup";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCartCheckout, setShowCartCheckout] = useState(false);
  const { user } = useAuth();
  const popupStates = usePopupStates();

  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("cs_cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      setLoading(false);
    };

    loadCart();
  }, []);

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("cs_cart", JSON.stringify(updatedCart));

    // Dispatch custom event to update navbar
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cs_cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.finalPrice, 0);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;

    // Calculate comprehensive summary
    const totalAmount = calculateTotal();
    const totalAccounts = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Calculate total devices across all accounts
    const totalDevices = cartItems.reduce((total, item) => {
      return (
        total + item.accounts.reduce((acc, account) => acc + account.devices, 0)
      );
    }, 0);

    // Get unique durations
    const durations = [...new Set(cartItems.map((item) => item.planDuration))];
    const durationText =
      durations.length === 1
        ? `${durations[0]} month(s)`
        : `${durations.length} different durations`;

    // Get unique product names
    const productNames = [
      ...new Set(cartItems.map((item) => item.productName)),
    ];
    const serviceText =
      productNames.length === 1
        ? productNames[0]
        : `${productNames.length} different services`;

    // Get the first item's product info for the main display
    const firstItem = cartItems[0];

    // Create a combined product structure that's compatible with the popup system
    const combinedProduct = {
      _id: `cart_${Date.now()}`,
      name: serviceText,
      variants: [
        {
          _id: `cart_variant_${Date.now()}`,
          name: cartItems.length === 1 ? firstItem.planName : "Cart Items",
          duration: durationText,
          price: totalAmount,
          originalPrice: totalAmount,
        },
      ],
    };

    // Create combined account configurations from all cart items
    const combinedAccountConfigurations = [];
    cartItems.forEach((item, itemIndex) => {
      item.accounts.forEach((account, accountIndex) => {
        combinedAccountConfigurations.push({
          ...account,
          // Add item reference for tracking
          itemId: item.id,
          itemIndex: itemIndex,
          accountIndex: accountIndex,
        });
      });
    });

    // Create selection data in the format expected by the payment popup
    // This needs to be compatible with the existing popup system
    const selectionData = {
      // Main product info (compatible with existing system)
      product: combinedProduct,
      productId: firstItem.productId, // Use first item's product ID
      variantId: `cart_variant_${Date.now()}`, // Use the variant _id instead of name
      selectedPlan: 0, // Always 0 for cart items
      selectedQuantity: totalAccounts,

      // Plan info (for popup compatibility)
      plan: {
        name: serviceText,
        duration: durations.length === 1 ? parseInt(durations[0]) : 1,
        price: totalAmount,
      },

      // Legacy fields for popup compatibility
      quantity: totalAccounts,
      selectedDevices: totalDevices,
      devices: totalDevices,
      adultChannels: combinedAccountConfigurations.some(
        (acc) => acc.adultChannels
      ),

      // Account configurations
      accountConfigurations: combinedAccountConfigurations,

      // Pricing info
      priceCalculation: {
        finalTotal: totalAmount,
        originalTotal: totalAmount,
        discount: 0,
      },
      finalPrice: totalAmount,

      // Cart specific info
      cartItems: cartItems,
      totalItems: cartItems.length,
      totalAccounts: totalAccounts,
      totalDevices: totalDevices,

      // Coupon info (if any item has a coupon)
      appliedCoupon: cartItems.find((item) => item.coupon)?.coupon || null,
      couponResult: cartItems.find((item) => item.coupon)?.coupon || null,
      coupon: cartItems.find((item) => item.coupon)?.coupon || null,

      // Device info
      deviceInfo: cartItems.reduce((acc, item, index) => {
        acc[index] = item.deviceInfo;
        return acc;
      }, {}),

      // Metadata
      type: "cart_checkout",
      timestamp: new Date().toISOString(),

      // Display info for popup - CORRECTED VALUES
      displayInfo: {
        service: serviceText,
        duration: durationText,
        devices: totalDevices, // Total devices across all accounts
        quantity: totalAccounts, // Total accounts
        totalAmount: totalAmount,
        // Additional summary info
        summary: {
          totalItems: cartItems.length,
          totalAccounts: totalAccounts,
          totalDevices: totalDevices,
          durations: durations,
          productNames: productNames,
          // Detailed breakdown
          breakdown: cartItems.map((item) => ({
            productName: item.productName,
            planName: item.planName,
            planDuration: item.planDuration,
            quantity: item.quantity,
            accounts: item.accounts.length,
            devices: item.accounts.reduce(
              (acc, account) => acc + account.devices,
              0
            ),
            totalPrice: item.finalPrice,
          })),
        },
      },
    };

    try {
      localStorage.setItem("cs_order_selection", JSON.stringify(selectionData));
      if (user) {
        setShowCartCheckout(true);
      } else {
        popupStates.setShowGuestCheckout(true);
      }
    } catch (e) {
      console.error("Error storing cart selection data:", e);
    }
  };

  const handleCartCheckoutSuccess = () => {
    setShowCartCheckout(false);
    // Clear cart and show success message
    setCartItems([]);
    localStorage.removeItem("cs_cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    // Trigger PaymentConfirmPopup by setting orderWithCredentials
    const lastOrder = localStorage.getItem("cs_last_order");
    if (lastOrder) {
      try {
        const orderData = JSON.parse(lastOrder);
        popupStates.setOrderWithCredentials(orderData);
        popupStates.setShowPaymentConfirm(true);
      } catch (e) {
        console.error("Error parsing last order:", e);
      }
    }
  };

  // Helper function to get device type name
  const getDeviceTypeName = (deviceType) => {
    switch (deviceType) {
      case 0:
        return "M3U Playlist";
      case 1:
        return "MAG Device";
      case 2:
        return "Enigma2";
      default:
        return "Unknown";
    }
  };

  // Helper function to get device type icon
  const getDeviceTypeIcon = (deviceType) => {
    switch (deviceType) {
      case 0:
        return "📱"; // M3U Playlist
      case 1:
        return "📺"; // MAG Device
      case 2:
        return "📡"; // Enigma2
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/packages"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
          </div>
          {cartItems.length > 0 && (
            <Button
              onClick={clearCart}
              variant="danger"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Add some items to get started</p>
            <Link href="/packages">
              <Button>Browse Packages</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-700 font-secondary"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white font-secondary">
                        {item.productName}
                      </h3>
                      <strong className="text-gray-400">
                        {item.planName} - {item.planDuration} Months
                      </strong>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">
                        {item.quantity} account
                        {item.quantity > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300 font-secondary">
                        Account Configurations:
                      </h4>
                      {item.accounts.map((account, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 rounded p-3 text-sm"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">
                              Account #{index + 1}:
                            </span>
                            <span className="text-white">
                              {account.devices} device
                              {account.devices > 1 ? "s" : ""} •
                              {account.adultChannels ? " Adult" : " Non Adult"}
                            </span>
                          </div>

                          {/* Device Type Information */}
                          <div className="mb-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500">
                                Device Type:
                              </span>
                              <span className="flex items-center gap-1 text-cyan-400">
                                <span>
                                  {getDeviceTypeIcon(account.deviceType || 0)}
                                </span>
                                <span className="font-medium">
                                  {getDeviceTypeName(account.deviceType || 0)}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Device-specific information */}
                          {account.deviceInfo && (
                            <div className="text-xs text-gray-500 space-y-1">
                              {account.deviceType === 1 &&
                                account.deviceInfo.macAddress && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                      MAC Address:
                                    </span>
                                    <span className="text-green-400 font-mono">
                                      {account.deviceInfo.macAddress}
                                    </span>
                                  </div>
                                )}
                              {account.deviceType === 2 &&
                                account.deviceInfo.enigma2Info && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                      Enigma2 Info:
                                    </span>
                                    <span className="text-purple-400">
                                      {account.deviceInfo.enigma2Info}
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {item.coupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Coupon Applied:</span>
                        <span className="text-green-400">
                          {item.coupon.code} (-${item.coupon.discount})
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-700">
                      <span>Total:</span>
                      <span className="text-cyan-400">
                        ${item.finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 sticky top-8">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Items ({cartItems.length})
                    </span>
                    <span className="text-white">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-700">
                    <span>Total</span>
                    <span className="text-cyan-400">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={proceedToCheckout}
                  variant="secondary"
                  className="w-full font-bold text-white py-3"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Cart Checkout Popup */}
      <CartCheckoutPopup
        isOpen={showCartCheckout}
        onClose={() => setShowCartCheckout(false)}
        onSuccess={handleCartCheckoutSuccess}
      />

      {/* Payment Popups - Same as PricingPlan.jsx */}
      <PricingPopups
        showThankYou={popupStates.showThankYou}
        closeThankYou={popupStates.closeThankYou}
        showGuestCheckout={popupStates.showGuestCheckout}
        closeGuestCheckout={popupStates.closeGuestCheckout}
        showRegisterForm={popupStates.showRegisterForm}
        setShowRegisterForm={popupStates.setShowRegisterForm}
        showPaymentConfirm={popupStates.showPaymentConfirm}
        closePaymentConfirm={popupStates.closePaymentConfirm}
        orderWithCredentials={popupStates.orderWithCredentials}
        showGatewaySelect={popupStates.showGatewaySelect}
        setShowGatewaySelect={popupStates.setShowGatewaySelect}
        hideThankYouWhenOtherPopupOpens={
          popupStates.hideThankYouWhenOtherPopupOpens
        }
        showBalanceCheckout={popupStates.showBalanceCheckout}
        setShowBalanceCheckout={popupStates.setShowBalanceCheckout}
        handleBalancePaymentSuccess={popupStates.handleBalancePaymentSuccess}
        showDepositPopup={popupStates.showDepositPopup}
        setShowDepositPopup={popupStates.setShowDepositPopup}
        handleDepositSuccess={popupStates.handleDepositSuccess}
        placing={popupStates.placing}
        setPlacing={popupStates.setPlacing}
        user={user}
      />
    </div>
  );
};

export default CartPage;
