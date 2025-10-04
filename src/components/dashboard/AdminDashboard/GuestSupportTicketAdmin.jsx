"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  MessageCircle,
  Send,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const GuestSupportTicketAdmin = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedTickets, setExpandedTickets] = useState(new Set()); // Track expanded tickets

  const ORIGINAL_TEXTS = {
    heading: "Guest Support Tickets",
    allStatus: "All Status",
    open: "Open",
    reply: "Reply",
    close: "Closed",
    loadingGuestTickets: "Loading guest support tickets...",
    noGuestTicketsFound: "No Guest Tickets Found",
    noGuestTicketsMatchFilter:
      "No guest support tickets match your current filter.",
    conversation: "Conversation:",
    guest: "Guest",
    admin: "Admin",
    typeYourReply: "Type your reply to the guest...",
    replying: "Replying...",
    reply: "Reply",
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
      const q = statusFilter
        ? `?status=${encodeURIComponent(statusFilter)}`
        : "";
      const res = await fetch(`/api/support/guest-tickets${q}`);
      const data = await res.json();
      if (data?.success) {
        setTickets(data.data || []);
      }
    } catch (e) {
      console.error("Error loading guest tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return;

    setReplying(true);
    try {
      const res = await fetch(`/api/support/guest-tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText.trim(), sender: "admin" }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText("");
        load();
      }
    } catch (e) {
      console.error("Error sending reply:", e);
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`/api/support/guest-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        load();
      }
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const toggleTicketExpansion = (ticketId) => {
    setExpandedTickets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-yellow-500";
      case "reply":
        return "text-blue-500";
      case "close":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "reply":
        return <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "close":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-cyan-400 mx-auto"></div>
        <p className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm">
          {texts.loadingGuestTickets}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-secondary px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
          {texts.heading}
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm"
          >
            <option value="">{texts.allStatus}</option>
            <option value="open">{texts.open}</option>
            <option value="reply">{texts.reply}</option>
            <option value="close">{texts.close}</option>
          </select>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <UserX
            size={40}
            className="sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4"
          />
          <h3 className="text-white text-base sm:text-lg font-semibold mb-2">
            {texts.noGuestTicketsFound}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            {texts.noGuestTicketsMatchFilter}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {tickets.map((ticket) => {
            const isExpanded = expandedTickets.has(ticket._id);

            return (
              <div
                key={ticket._id}
                className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl overflow-hidden"
              >
                {/* Compact Ticket Header - Always Visible */}
                <div
                  className="p-3 sm:p-4 cursor-pointer hover:bg-orange-900/10 transition-colors"
                  onClick={() => toggleTicketExpansion(ticket._id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg truncate">
                          {ticket.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-400 mt-1">
                          <span className="truncate">{ticket.guestEmail}</span>
                          <span>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span>{ticket.messages?.length || 0} messages</span>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(
                          ticket.status
                        )} bg-gray-800 flex-shrink-0`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.charAt(0).toUpperCase() +
                          ticket.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 lg:ml-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(ticket._id, e.target.value);
                        }}
                        className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-[10px] sm:text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="open">{texts.open}</option>
                        <option value="reply">{texts.reply}</option>
                        <option value="close">{texts.close}</option>
                      </select>
                      <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTicketExpansion(ticket._id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} className="sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown size={16} className="sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content - Only shown when expanded */}
                {isExpanded && (
                  <div className="border-t border-orange-500/20 p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {/* Ticket Description */}
                    <div className="bg-black/30 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        {ticket.description}
                      </p>
                      {ticket.image && (
                        <div className="mt-2 sm:mt-3">
                          <img
                            src={ticket.image}
                            alt="Ticket attachment"
                            className="max-w-xs rounded cursor-pointer"
                            onClick={() => setExpandedImage(ticket.image)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    {ticket.messages && ticket.messages.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-white font-medium text-xs sm:text-sm">
                          {texts.conversation}
                        </h4>
                        <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2 sm:space-y-3">
                          {ticket.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`p-2 sm:p-3 rounded-lg ${
                                message.sender === "guest"
                                  ? "bg-orange-500/10 border border-orange-500/20"
                                  : "bg-cyan-500/10 border border-cyan-500/20"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1 sm:mb-2">
                                <span className="text-[10px] sm:text-xs font-medium text-gray-400">
                                  {message.sender === "guest"
                                    ? texts.guest
                                    : texts.admin}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-500">
                                  {new Date(message.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-xs sm:text-sm">
                                {message.text}
                              </p>
                              {message.image && (
                                <img
                                  src={message.image}
                                  alt="Message attachment"
                                  className="mt-1 sm:mt-2 max-w-xs rounded cursor-pointer"
                                  onClick={() =>
                                    setExpandedImage(message.image)
                                  }
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Reply Section */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={texts.typeYourReply}
                          rows={2}
                          className="w-full px-2 sm:px-3 py-2 bg-[#0c171c] border border-[#FFFFFF26] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none text-xs sm:text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(ticket._id)}
                          disabled={replying || !replyText.trim()}
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-cyan-400 text-black rounded-lg font-medium hover:bg-cyan-300 transition-colors disabled:opacity-60 text-xs sm:text-sm"
                        >
                          {replying ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                              {texts.replying}
                            </>
                          ) : (
                            <>
                              <Send size={12} className="sm:w-4 sm:h-4" />
                              {texts.reply}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={expandedImage}
              alt={texts.expandedView}
              className="max-w-full max-h-full object-contain rounded"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestSupportTicketAdmin;
