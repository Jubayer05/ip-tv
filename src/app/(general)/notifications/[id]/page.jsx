"use client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationDetailPage({ params }) {
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationId, setNotificationId] = useState(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setNotificationId(resolvedParams.id);
    };

    if (user) {
      getParams();
    }
  }, [user, params]);

  useEffect(() => {
    if (user && notificationId) {
      fetchNotification();
    }
  }, [user, notificationId]);

  const fetchNotification = async () => {
    if (!user?._id || !notificationId) return;
    try {
      setLoading(true);
      const userId = user._id || user.mongoId || user.id;
      const response = await fetch(
        `/api/notifications/${notificationId}?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setNotification(data.data);
        // Mark as read if not already read
        if (!data.data.isRead) {
          await markAsRead(notificationId);
        }
      } else {
        setError(data.error || "Failed to fetch notification");
      }
    } catch (error) {
      console.error("Error fetching notification:", error);
      setError("Failed to fetch notification");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const userId = user._id || user.mongoId || user.id;
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setNotification((prev) => ({
          ...prev,
          isRead: true,
        }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "discount":
        return "💰";
      case "promotions":
        return "🎉";
      case "notice":
        return "📢";
      default:
        return "ℹ️";
    }
  };

  const formatDate = (date) => {
    const notificationDate = new Date(date);
    return notificationDate.toLocaleString();
  };

  const isExpired = (validUntil) => {
    return new Date() > new Date(validUntil);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold uppercase">
            Loading...
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading notification...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold uppercase">Error</h2>
        </div>
        <div className="p-8 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Notification not found
          </h3>
          <p className="text-gray-500 mb-4">
            {error ||
              "The notification you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/notifications"
            className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase">
            Notification Details
          </h2>
          <p className="text-sm text-gray-400">
            {formatDate(notification.createdAt)}
          </p>
        </div>
      </div>

      {/* Notification Content */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <div className="flex items-start gap-4 mb-6">
          <span className="text-4xl flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </span>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1
                className={`text-xl font-bold ${
                  notification.isRead ? "text-gray-400" : "text-white"
                }`}
              >
                {notification.title}
              </h1>
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full">
                    New
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  {notification.type}
                </span>
                {isExpired(notification.validUntil) && (
                  <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                    Expired
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Valid until: {formatDate(notification.validUntil)}
            </p>
          </div>
        </div>

        {/* Message Content */}
        <div className="prose prose-invert max-w-none">
          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: notification.message.replace(/\n/g, "<br>"),
            }}
          />
        </div>

        {/* Status Information */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>
              <span
                className={`ml-2 ${
                  notification.isActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {notification.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Read Status:</span>
              <span
                className={`ml-2 ${
                  notification.isRead ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {notification.isRead ? "Read" : "Unread"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Expiry:</span>
              <span
                className={`ml-2 ${
                  isExpired(notification.validUntil)
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {isExpired(notification.validUntil) ? "Expired" : "Valid"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/notifications"
          className="flex-1 sm:flex-none px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
        >
          Back to Notifications
        </Link>
        {!notification.isRead && (
          <button
            onClick={() => markAsRead(notification._id)}
            className="flex-1 sm:flex-none px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            Mark as Read
          </button>
        )}
      </div>
    </div>
  );
}
