"use client";
import {
  CheckCircle,
  Clock,
  Filter,
  MessageCircle,
  Send,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useState } from "react";

const SupportTicketAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [lastViewedTickets, setLastViewedTickets] = useState({}); // Track last viewed message count
  const [expandedImage, setExpandedImage] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const q = statusFilter
        ? `?status=${encodeURIComponent(statusFilter)}`
        : "";
      const res = await fetch(`/api/support/tickets${q}`);
      const data = await res.json();
      if (data?.success) {
        // Populate user data for each ticket
        const ticketsWithUsers = await Promise.all(
          (data.data || []).map(async (ticket) => {
            try {
              const userRes = await fetch(
                `/api/users/profile?userId=${encodeURIComponent(ticket.user)}`
              );
              const userData = await userRes.json();
              return {
                ...ticket,
                userDisplayName: userData.success
                  ? `${userData.data.firstName || ""} ${
                      userData.data.lastName || ""
                    }`.trim() || "Unknown User"
                  : "Unknown User",
              };
            } catch (e) {
              return { ...ticket, userDisplayName: "Unknown User" };
            }
          })
        );
        setTickets(ticketsWithUsers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const sendMessage = async (ticketId) => {
    if (!replyText.trim()) return;
    const messageText = replyText; // Store the text before clearing
    try {
      setReplying(true);
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: { sender: "admin", text: messageText },
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setReplyText(""); // Clear input after successful send
        await load(); // Reload tickets
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  };

  const setStatus = async (ticketId, status) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data?.success) {
        await load();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "reply":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "close":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-900/20 text-yellow-300 border-yellow-500/30";
      case "reply":
        return "bg-blue-900/20 text-blue-300 border-blue-500/30";
      case "close":
        return "bg-green-900/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-900/20 text-gray-300 border-gray-500/30";
    }
  };

  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      reply: tickets.filter((t) => t.status === "reply").length,
      closed: tickets.filter((t) => t.status === "close").length,
    };
  };

  const hasNewMessages = (ticket) => {
    const lastViewed = lastViewedTickets[ticket._id] || 0;
    const currentMessages = ticket.messages?.length || 0;
    return currentMessages > lastViewed && ticket.lastUpdatedBy === "user";
  };

  const markAsViewed = (ticketId, messageCount) => {
    setLastViewedTickets((prev) => ({ ...prev, [ticketId]: messageCount }));
  };

  const stats = getTicketStats();

  return (
    <div className="flex flex-col gap-4 font-secondary">
      {/* Header with Stats */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Support Tickets (Admin)</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="bg-black border border-[#212121] rounded px-3 py-2 text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All ({stats.total})</option>
              <option value="open">Open ({stats.open})</option>
              <option value="reply">Reply ({stats.reply})</option>
              <option value="close">Closed ({stats.closed})</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-300">
              {stats.open}
            </div>
            <div className="text-xs text-gray-400">Open</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-300">
              {stats.reply}
            </div>
            <div className="text-xs text-gray-400">Reply</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-300">
              {stats.closed}
            </div>
            <div className="text-xs text-gray-400">Closed</div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t._id}
                className="border border-[#212121] rounded-lg overflow-hidden"
              >
                {/* Ticket Header */}
                <div
                  className={`bg-gray-900/50 p-4 border-b border-[#212121] ${
                    hasNewMessages(t) ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg mb-1">
                          {t.title}
                        </h4>
                        {hasNewMessages(t) && (
                          <span className="bg-primary text-black text-xs px-2 py-1 rounded-full font-semibold">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          User: {t.userDisplayName || t.user}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {getStatusIcon(t.status)}
                          {t.status.toUpperCase()}
                        </span>
                        <span>{new Date(t.createdAt).toLocaleString()}</span>
                        <span>{t.messages?.length || 0} messages</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {t.status !== "close" && (
                        <button
                          onClick={() => setStatus(t._id, "close")}
                          className="flex items-center gap-1 text-xs bg-red-900/50 hover:bg-red-900 text-red-300 px-3 py-2 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Close
                        </button>
                      )}
                      {t.status === "close" && (
                        <button
                          onClick={() => setStatus(t._id, "open")}
                          className="flex items-center gap-1 text-xs bg-green-900/50 hover:bg-green-900 text-green-300 px-3 py-2 rounded transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const newActiveId = activeId === t._id ? null : t._id;
                          setActiveId(newActiveId);
                          if (newActiveId === t._id) {
                            markAsViewed(t._id, t.messages?.length || 0);
                          }
                        }}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
                      >
                        {activeId === t._id ? "Hide Chat" : "Open Chat"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                {activeId === t._id && (
                  <div className="bg-gray-950/50">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                      {t.messages?.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            m.sender === "admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              m.sender === "admin"
                                ? "bg-primary text-black"
                                : "bg-gray-800 text-white"
                            }`}
                          >
                            <div className="text-xs opacity-70 mb-1">
                              {m.sender === "admin" ? "You (Admin)" : "User"} •{" "}
                              {new Date(m.createdAt).toLocaleString()}
                            </div>
                            {m.text && <div className="text-sm">{m.text}</div>}
                            {m.image && (
                              <div className="mt-2">
                                <div
                                  className="relative group cursor-pointer"
                                  onClick={() => setExpandedImage(m.image)}
                                >
                                  <img
                                    src={m.image}
                                    alt="Attachment"
                                    className="max-w-full h-auto max-h-48 rounded-lg border border-gray-600 hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "block";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                                <a
                                  href={m.image}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`text-xs underline mt-1 block ${
                                    m.sender === "admin"
                                      ? "text-black"
                                      : "text-primary"
                                  }`}
                                  style={{ display: "none" }}
                                >
                                  📎 View full image
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    {t.status !== "close" && (
                      <div className="border-t border-[#212121] p-4">
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-black border border-[#212121] rounded-lg px-4 py-3 text-white placeholder-gray-400"
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(t._id);
                              }
                            }}
                          />
                          <button
                            onClick={() => sendMessage(t._id)}
                            disabled={replying || !replyText.trim()}
                            className="bg-primary hover:bg-primary/80 text-black px-4 py-3 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            {replying ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketAdmin;
