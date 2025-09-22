"use client";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const OrderHistory = () => {
  const { user, getAuthToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redownloadingOrder, setRedownloadingOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/orders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedownloadCredentials = async (orderNumber) => {
    setRedownloadingOrder(orderNumber);

    try {
      const response = await fetch("/api/orders/redownload-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "IPTV credentials have been sent to your email address.",
          icon: "success",
          confirmButtonColor: "#00b877",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Failed to send credentials",
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (error) {
      console.error("Redownload error:", error);
      Swal.fire({
        title: "Error",
        text: "Network error. Please try again.",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setRedownloadingOrder(null);
    }
  };

  const getLineTypeName = (lineType) => {
    const names = {
      0: "M3U Playlist",
      1: "MAG Device",
      2: "Enigma2",
    };
    return names[lineType] || "M3U Playlist";
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "text-green-500",
      pending: "text-yellow-500",
      cancelled: "text-red-500",
      new: "text-blue-500",
    };
    return colors[status] || "text-gray-500";
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
        <p className="text-gray-400 mb-6">
          You haven't made any purchases yet. Start exploring our packages!
        </p>
        <Button
          variant="primary"
          onClick={() => (window.location.href = "/packages")}
        >
          Browse Packages
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Order History</h2>
        <div className="text-sm text-gray-400">
          {orders.length} order{orders.length !== 1 ? "s" : ""} found
        </div>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => {
          const product = order.products?.[0];

          return (
            <div
              key={order._id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#FFFFFF26] rounded-xl p-6"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.paymentStatus
                    )} bg-gray-800`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              {product && (
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Subscription</p>
                      <p className="text-white font-medium">
                        {product.duration} Month
                        {product.duration !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Device Type</p>
                      <p className="text-white font-medium">
                        {getLineTypeName(product.lineType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Quantity</p>
                      <p className="text-white font-medium">
                        {product.quantity}{" "}
                        {product.quantity === 1 ? "Account" : "Accounts"}
                      </p>
                    </div>
                  </div>

                  {/* IPTV Configuration Details */}
                  {product.lineType > 0 && product.adultChannelsConfig && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">
                        Device Configuration:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.adultChannelsConfig.map(
                          (adultEnabled, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                adultEnabled
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {getLineTypeName(product.lineType)} #{index + 1}:{" "}
                              {adultEnabled ? "Adult" : "Non Adult"}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {product.lineType === 0 && product.adultChannels && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400">
                        Adult Channels Enabled
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* IPTV Credentials Status */}
              {order.paymentStatus === "completed" && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 font-medium">
                          IPTV Credentials Ready ({order.iptvCredentials.length}{" "}
                          accounts)
                        </span>
                      </>
                    }
                  </div>

                  {/* Action Buttons */}
                  {
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRedownloadCredentials(order.orderNumber)
                        }
                        disabled={redownloadingOrder === order.orderNumber}
                        className="flex items-center gap-2"
                      >
                        {redownloadingOrder === order.orderNumber ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Resend to Email
                          </>
                        )}
                      </Button>
                    </div>
                  }
                </div>
              )}

              {order.paymentStatus === "pending" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 font-medium">
                    Awaiting Payment - IPTV credentials will be sent after
                    payment confirmation
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
