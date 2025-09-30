"use client";
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedTickets, setExpandedTickets] = useState(new Set()); // Track expanded tickets

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
        return <Clock className="w-4 h-4" />;
      case "reply":
        return <MessageCircle className="w-4 h-4" />;
      case "close":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading guest support tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserX className="w-6 h-6 text-orange-400" />
          Guest Support Tickets
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="reply">Reply</option>
            <option value="close">Closed</option>
          </select>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <UserX size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">
            No Guest Tickets Found
          </h3>
          <p className="text-gray-400">
            No guest support tickets match your current filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tickets.map((ticket) => {
            const isExpanded = expandedTickets.has(ticket._id);

            return (
              <div
                key={ticket._id}
                className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl overflow-hidden"
              >
                {/* Compact Ticket Header - Always Visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-orange-900/10 transition-colors"
                  onClick={() => toggleTicketExpansion(ticket._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <UserX className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {ticket.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span className="truncate">{ticket.guestEmail}</span>
                          <span>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span>{ticket.messages?.length || 0} messages</span>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )} bg-gray-800 flex-shrink-0`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.charAt(0).toUpperCase() +
                          ticket.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(ticket._id, e.target.value);
                        }}
                        className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="open">Open</option>
                        <option value="reply">Reply</option>
                        <option value="close">Close</option>
                      </select>
                      <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTicketExpansion(ticket._id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content - Only shown when expanded */}
                {isExpanded && (
                  <div className="border-t border-orange-500/20 p-4 space-y-4">
                    {/* Ticket Description */}
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {ticket.description}
                      </p>
                      {ticket.image && (
                        <div className="mt-3">
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
                      <div className="space-y-3">
                        <h4 className="text-white font-medium text-sm">
                          Conversation:
                        </h4>
                        <div className="max-h-64 overflow-y-auto space-y-3">
                          {ticket.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg ${
                                message.sender === "guest"
                                  ? "bg-orange-500/10 border border-orange-500/20"
                                  : "bg-cyan-500/10 border border-cyan-500/20"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-400">
                                  {message.sender === "guest"
                                    ? "Guest"
                                    : "Admin"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {message.text}
                              </p>
                              {message.image && (
                                <img
                                  src={message.image}
                                  alt="Message attachment"
                                  className="mt-2 max-w-xs rounded cursor-pointer"
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
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply to the guest..."
                          rows={2}
                          className="w-full px-3 py-2 bg-[#0c171c] border border-[#FFFFFF26] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(ticket._id)}
                          disabled={replying || !replyText.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg font-medium hover:bg-cyan-300 transition-colors disabled:opacity-60 text-sm"
                        >
                          {replying ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                              Replying...
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              Reply
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
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestSupportTicketAdmin;
