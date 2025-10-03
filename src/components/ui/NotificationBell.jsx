"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [prevUnread, setPrevUnread] = useState(0);

  // Audio state
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Prepare HTMLAudio using public file
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      const a = new window.Audio("/sound/notificaiton.wav");
      a.preload = "auto";
      a.volume = 0.85;
      audioRef.current = a;
      try {
        a.load();
      } catch {}
    }
  }, []);

  // Prepare AudioContext early to allow WebAudio fallback
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioCtxRef.current.resume().catch(() => {});
      } catch {}
    }
  }, []);

  // Web Audio fallback beep
  const synthBeep = (ctx) => {
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 1100;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.start(t);
      o.stop(t + 0.3);
    } catch {}
  };

  const playBeep = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => {})
          .catch(() => {
            try {
              if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext ||
                  window.webkitAudioContext)();
                audioCtxRef.current.resume().catch(() => {});
              }
              if (audioCtxRef.current) synthBeep(audioCtxRef.current);
            } catch {}
          });
        return;
      }
    } catch {}
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioCtxRef.current.resume().catch(() => {});
      }
      if (audioCtxRef.current) synthBeep(audioCtxRef.current);
    } catch {}
  };

  useEffect(() => {
    const uid = user?._id || user?.mongoId || user?.id;
    if (!uid) return;

    const hasNewSupportTicket = notifications.some((n) => {
      const sent = (n.sentTo || []).find((s) => String(s.user) === String(uid));
      const isUnread = sent && !sent.isRead;
      const isTicket = (n.title || "")
        .toLowerCase()
        .includes("new support ticket");
      return isUnread && isTicket;
    });

    // If unread increased and there's a new support ticket, play immediately
    if (unreadCount > prevUnread && hasNewSupportTicket) {
      playBeep();
    }
    setPrevUnread(unreadCount);
  }, [unreadCount, notifications, user]);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const userId = user._id || user.mongoId || user.id;
      const response = await fetch(
        `/api/notifications/user?userId=${userId}&limit=10`
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      } else {
        console.error("🔔 API error:", data.error);
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

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    const userSentTo = notification.sentTo.find(
      (sent) => sent.user === (user._id || user.mongoId || user.id)
    );
    const isRead = userSentTo?.isRead || false;

    if (!isRead) {
      await markAsRead(notification._id);
    }

    // Close dropdown
    setShowDropdown(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
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

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
        }}
        className="relative cursor-pointer p-2 text-gray-300 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const userSentTo = notification.sentTo.find(
                    (sent) =>
                      sent.user === (user._id || user.mongoId || user.id)
                  );
                  const isRead = userSentTo?.isRead || false;
                  return (
                    <Link
                      key={notification._id}
                      href={`/notifications/${notification._id}`}
                      onClick={() => handleNotificationClick(notification)}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        isRead ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message.replace(/<[^>]*>/g, "")}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
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

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link
                href="/notifications"
                onClick={() => setShowDropdown(false)}
                className="w-full text-center text-sm text-cyan-600 hover:text-cyan-700 font-medium block"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
