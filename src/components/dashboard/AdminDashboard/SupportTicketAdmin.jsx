"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CheckCircle,
  Clock,
  MessageCircle,
  Send,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useState } from "react";

const SupportTicketAdmin = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]); // Add state for all tickets
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [lastViewedTickets, setLastViewedTickets] = useState({}); // Track last viewed message count
  const [expandedImage, setExpandedImage] = useState(null);

  const ORIGINAL_TEXTS = {
    heading: "Support Tickets (Admin)",
    all: "All",
    open: "Open",
    reply: "Replied",
    closed: "Closed",
    total: "Total",
    loadingTickets: "Loading tickets...",
    noTicketsFound: "No tickets found",
    user: "User",
    messages: "messages",
    close: "Close",
    reopen: "Reopen",
    hideChat: "Hide Chat",
    openChat: "Open Chat",
    youAdmin: "You (Admin)",
    user: "User",
    viewFullImage: "📎 View full image",
    typeYourReply: "Type your reply...",
    sending: "Sending...",
    send: "Send",
    expandedView: "Expanded view",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(items);
      if (!isMounted) return;

      const translatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        translatedTexts[key] = translated[index];
      });
      setTexts(translatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const load = async () => {
    try {
      setLoading(true);

      // Load filtered tickets for display
      const q =
        activeTab !== "all" ? `?status=${encodeURIComponent(activeTab)}` : "";
      const res = await fetch(`/api/support/tickets${q}`);
      const data = await res.json();

      if (data?.success) {
        // Load ALL tickets for stats calculation
        const allTicketsRes = await fetch(`/api/support/tickets`);
        const allTicketsData = await allTicketsRes.json();

        // Populate user data for filtered tickets
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

        // Store all tickets for stats
        if (allTicketsData?.success) {
          const allTicketsWithUsers = await Promise.all(
            (allTicketsData.data || []).map(async (ticket) => {
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

          // Set all tickets for stats calculation
          setAllTickets(allTicketsWithUsers);
        }
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
  }, [activeTab]);

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
          status: "reply", // Change status to reply when admin responds
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
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />;
      case "reply":
        return (
          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
        );
      case "close":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
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
      total: allTickets.length,
      open: allTickets.filter((t) => t.status === "open").length,
      reply: allTickets.filter((t) => t.status === "reply").length,
      closed: allTickets.filter((t) => t.status === "close").length,
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

  // Define tabs with reply status
  const tabs = [
    { id: "all", label: texts.all, count: stats.total },
    { id: "open", label: texts.open, count: stats.open },
    { id: "reply", label: texts.reply, count: stats.reply },
    { id: "close", label: texts.closed, count: stats.closed },
  ];

  return (
    <div className="flex flex-col gap-3 sm:gap-4 font-secondary px-4 sm:px-6 lg:px-8">
      {/* Header with Stats */}
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 space-y-3 lg:space-y-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            {texts.heading}
          </h2>

          {/* Tab System */}
          <div className="flex bg-gray-900/50 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-black"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                    activeTab === tab.id
                      ? "bg-black/20 text-black"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="bg-gray-900/50 rounded-lg p-2 sm:p-3">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.total}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              {texts.total}
            </div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-2 sm:p-3">
            <div className="text-lg sm:text-2xl font-bold text-yellow-300">
              {stats.open}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              {texts.open}
            </div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-2 sm:p-3">
            <div className="text-lg sm:text-2xl font-bold text-blue-300">
              {stats.reply}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              {texts.reply}
            </div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-2 sm:p-3">
            <div className="text-lg sm:text-2xl font-bold text-green-300">
              {stats.closed}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400">
              {texts.closed}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-400 text-xs sm:text-sm">
              {texts.loadingTickets}
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-xs sm:text-sm sm:text-base">
              {texts.noTicketsFound}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {tickets.map((t) => (
              <div
                key={t._id}
                className="border border-[#212121] rounded-lg overflow-hidden"
              >
                {/* Ticket Header */}
                <div
                  className={`bg-gray-900/50 p-3 sm:p-4 border-b border-[#212121] ${
                    hasNewMessages(t) ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base md:text-lg mb-1">
                          {t.title}
                        </h4>
                        {hasNewMessages(t) && (
                          <span className="bg-primary text-black text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {texts.user}: {t.userDisplayName || t.user}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] sm:text-xs ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {getStatusIcon(t.status)}
                          {t.status.toUpperCase()}
                        </span>
                        <span className="text-xs sm:text-sm">
                          {new Date(t.createdAt).toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm">
                          {t.messages?.length || 0} {texts.messages}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {t.status !== "close" && (
                        <button
                          onClick={() => setStatus(t._id, "close")}
                          className="flex items-center gap-1 text-[10px] sm:text-xs bg-red-900/50 hover:bg-red-900 text-red-300 px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                          {texts.close}
                        </button>
                      )}
                      {t.status === "close" && (
                        <button
                          onClick={() => setStatus(t._id, "open")}
                          className="flex items-center gap-1 text-[10px] sm:text-xs bg-green-900/50 hover:bg-green-900 text-green-300 px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors"
                        >
                          {texts.reopen}
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
                        className="text-[10px] sm:text-xs bg-gray-700 hover:bg-gray-600 px-3 sm:px-4 py-1 sm:py-2 rounded transition-colors"
                      >
                        {activeId === t._id ? texts.hideChat : texts.openChat}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Interface */}
                {activeId === t._id && (
                  <div className="bg-gray-950/50">
                    {/* Messages */}
                    <div className="h-64 sm:h-96 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
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
                            className={`max-w-[80%] rounded-lg p-2 sm:p-3 ${
                              m.sender === "admin"
                                ? "bg-primary text-black"
                                : "bg-gray-800 text-white"
                            }`}
                          >
                            <div className="text-[10px] sm:text-xs opacity-70 mb-1">
                              {m.sender === "admin"
                                ? texts.youAdmin
                                : texts.user}{" "}
                              • {new Date(m.createdAt).toLocaleString()}
                            </div>
                            {m.text && (
                              <div className="text-xs sm:text-sm">{m.text}</div>
                            )}
                            {m.image && (
                              <div className="mt-1 sm:mt-2">
                                <div
                                  className="relative group cursor-pointer"
                                  onClick={() => setExpandedImage(m.image)}
                                >
                                  <img
                                    src={m.image}
                                    alt="Attachment"
                                    className="max-w-full h-auto max-h-32 sm:max-h-48 rounded-lg border border-gray-600 hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "block";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                    <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                                <a
                                  href={m.image}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`text-[10px] sm:text-xs underline mt-1 block ${
                                    m.sender === "admin"
                                      ? "text-black"
                                      : "text-primary"
                                  }`}
                                  style={{ display: "none" }}
                                >
                                  {texts.viewFullImage}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    {t.status !== "close" && (
                      <div className="border-t border-[#212121] p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            className="flex-1 bg-black border border-[#212121] rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-400 text-xs sm:text-sm"
                            placeholder={texts.typeYourReply}
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
                            className="bg-primary hover:bg-primary/80 text-black px-3 sm:px-4 py-2 sm:py-3 rounded-lg disabled:opacity-50 flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm"
                          >
                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                            {replying ? texts.sending : texts.send}
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
              alt={texts.expandedView}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketAdmin;
