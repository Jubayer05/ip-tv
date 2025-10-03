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
    <div className="flex flex-col gap-4 font-secondary">
      {/* Header with Stats */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{texts.heading}</h2>

          {/* Tab System */}
          <div className="flex bg-gray-900/50 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-black"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
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
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">{texts.total}</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-300">
              {stats.open}
            </div>
            <div className="text-xs text-gray-400">{texts.open}</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-300">
              {stats.reply}
            </div>
            <div className="text-xs text-gray-400">{texts.reply}</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-300">
              {stats.closed}
            </div>
            <div className="text-xs text-gray-400">{texts.closed}</div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-400">{texts.loadingTickets}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{texts.noTicketsFound}</p>
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
                          {texts.user}: {t.userDisplayName || t.user}
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
                        <span>
                          {t.messages?.length || 0} {texts.messages}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {t.status !== "close" && (
                        <button
                          onClick={() => setStatus(t._id, "close")}
                          className="flex items-center gap-1 text-xs bg-red-900/50 hover:bg-red-900 text-red-300 px-3 py-2 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                          {texts.close}
                        </button>
                      )}
                      {t.status === "close" && (
                        <button
                          onClick={() => setStatus(t._id, "open")}
                          className="flex items-center gap-1 text-xs bg-green-900/50 hover:bg-green-900 text-green-300 px-3 py-2 rounded transition-colors"
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
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
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
                              {m.sender === "admin"
                                ? texts.youAdmin
                                : texts.user}{" "}
                              • {new Date(m.createdAt).toLocaleString()}
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
                      <div className="border-t border-[#212121] p-4">
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-black border border-[#212121] rounded-lg px-4 py-3 text-white placeholder-gray-400"
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
                            className="bg-primary hover:bg-primary/80 text-black px-4 py-3 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
                          >
                            <Send className="w-4 h-4" />
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
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketAdmin;
