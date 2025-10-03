"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const limit = 10;

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, currentPage, filterType]);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const userId = user._id || user.mongoId || user.id;
      const params = new URLSearchParams({
        userId,
        limit: limit.toString(),
        page: currentPage.toString(),
      });

      if (filterType !== "all") {
        params.append("type", filterType);
      }

      const response = await fetch(`/api/notifications/user?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
        setTotalPages(Math.ceil(data.total / limit) || 1);
      } else {
        console.error("Error fetching notifications:", data.error);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const userId = user._id || user.mongoId || user.id;
      const response = await fetch("/api/notifications/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, userId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? {
                  ...notification,
                  sentTo: notification.sentTo.map((sent) =>
                    sent.user === userId ? { ...sent, isRead: true } : sent
                  ),
                }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user._id || user.mongoId || user.id;
      const unreadNotifications = notifications.filter((notification) => {
        const userSentTo = notification.sentTo.find(
          (sent) => sent.user === userId
        );
        return userSentTo && !userSentTo.isRead;
      });

      for (const notification of unreadNotifications) {
        await markAsRead(notification._id);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
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
    const now = new Date();
    const notificationDate = new Date(date);
    const diffTime = Math.abs(now - notificationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return notificationDate.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (!user) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold py-2 sm:py-4 uppercase">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="discount">Discount</option>
            <option value="promotions">Promotions</option>
            <option value="notice">Notice</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-900 rounded-lg border border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== "all"
                ? "No notifications match your search criteria."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredNotifications.map((notification) => {
              const userSentTo = notification.sentTo.find(
                (sent) => sent.user === (user._id || user.mongoId || user.id)
              );
              const isRead = userSentTo?.isRead || false;

              return (
                <Link
                  key={notification._id}
                  href={`/notifications/${notification._id}`}
                  className={`block p-4 hover:bg-gray-800 transition-colors ${
                    isRead ? "opacity-75" : ""
                  }`}
                  onClick={() => !isRead && markAsRead(notification._id)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm font-medium truncate ${
                            isRead ? "text-gray-400" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!isRead && (
                          <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {notification.message.replace(/<[^>]*>/g, "")}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
