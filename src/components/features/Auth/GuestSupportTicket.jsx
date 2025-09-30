"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Send, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

export default function GuestSupportTicket({ verifiedEmail, onBack }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // Add file input ref
  const fileInputRef = useRef(null);

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "Support Tickets",
    subtitle: "Create and manage your support tickets",
    createNew: "Create New Ticket",
    createTitle: "Create Support Ticket",
    ticketTitle: "Ticket Title",
    ticketDescription: "Description",
    submitTicket: "Submit Ticket",
    submitting: "Submitting...",
    backToOrders: "Back to Orders",
    noTickets: "No support tickets found",
    createFirst: "Create your first support ticket",
    ticketDetails: "Ticket Details",
    reply: "Reply",
    replying: "Replying...",
    sendReply: "Send Reply",
    status: {
      open: "Open",
      reply: "Waiting for Reply",
      close: "Closed",
    },
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ORIGINAL_TEXTS.createNew,
          ORIGINAL_TEXTS.createTitle,
          ORIGINAL_TEXTS.ticketTitle,
          ORIGINAL_TEXTS.ticketDescription,
          ORIGINAL_TEXTS.submitTicket,
          ORIGINAL_TEXTS.submitting,
          ORIGINAL_TEXTS.backToOrders,
          ORIGINAL_TEXTS.noTickets,
          ORIGINAL_TEXTS.createFirst,
          ORIGINAL_TEXTS.ticketDetails,
          ORIGINAL_TEXTS.reply,
          ORIGINAL_TEXTS.replying,
          ORIGINAL_TEXTS.sendReply,
          ...Object.values(ORIGINAL_TEXTS.status),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        setTexts({
          title: translated[0],
          subtitle: translated[1],
          createNew: translated[2],
          createTitle: translated[3],
          ticketTitle: translated[4],
          ticketDescription: translated[5],
          submitTicket: translated[6],
          submitting: translated[7],
          backToOrders: translated[8],
          noTickets: translated[9],
          createFirst: translated[10],
          ticketDetails: translated[11],
          reply: translated[12],
          replying: translated[13],
          sendReply: translated[14],
          status: {
            open: translated[15],
            reply: translated[16],
            close: translated[17],
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/support/guest-tickets?guestEmail=${encodeURIComponent(
          verifiedEmail
        )}`
      );
      const data = await res.json();
      if (data?.success) setTickets(data.data || []);
    } catch (e) {
      console.error("Error loading tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verifiedEmail) {
      loadTickets();
    }
  }, [verifiedEmail]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "Please select a file smaller than 5MB",
          confirmButtonColor: "#00b877",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) return data.url;
      throw new Error(data.error || "Upload failed");
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmitTicket = async () => {
    if (!title.trim() || !description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields",
        confirmButtonColor: "#00b877",
      });
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const response = await fetch("/api/support/guest-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestEmail: verifiedEmail,
          title: title.trim(),
          description: description.trim(),
          image: imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Ticket Created!",
          text: "Your support ticket has been submitted successfully",
          confirmButtonColor: "#00b877",
        });

        // Reset form
        setTitle("");
        setDescription("");
        setSelectedFile(null);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Reload tickets
        loadTickets();
      } else {
        throw new Error(data.error || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message || "Failed to create support ticket. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Message Required",
        text: "Please enter a reply message",
        confirmButtonColor: "#00b877",
      });
      return;
    }

    setReplying(true);
    try {
      const res = await fetch(`/api/support/guest-tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText.trim(),
          sender: "guest",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText("");
        loadTickets();
      } else {
        throw new Error(data.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to send reply. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setReplying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "reply":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "close":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getStatusText = (status) => {
    return texts.status[status] || status;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading support tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-white text-lg font-semibold mb-2">{texts.title}</h2>
        <p className="text-gray-400 text-sm">{texts.subtitle}</p>
        <p className="text-cyan-400 text-sm mt-2 font-medium">
          {verifiedEmail}
        </p>
      </div>

      {/* Create New Ticket Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">{texts.createTitle}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              {texts.ticketTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter ticket title"
              className="w-full px-4 py-3 bg-[#0c171c] border border-[#FFFFFF26] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              {texts.ticketDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail"
              rows={4}
              className="w-full px-4 py-3 bg-[#0c171c] border border-[#FFFFFF26] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Attach File (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-transparent border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-black transition-colors cursor-pointer"
              >
                <Upload size={16} />
                Choose File
              </label>
              {selectedFile && (
                <span className="text-gray-300 text-sm">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmitTicket}
            disabled={submitting || !title.trim() || !description.trim()}
            className="w-full bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                {texts.submitting}
              </>
            ) : (
              <>
                <Send size={16} />
                {texts.submitTicket}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">
            {texts.noTickets}
          </h3>
          <p className="text-gray-400">{texts.createFirst}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Your Tickets</h3>
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-medium">{ticket.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {getStatusText(ticket.status)}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4">{ticket.description}</p>

              {/* Messages */}
              {ticket.messages && ticket.messages.length > 0 && (
                <div className="space-y-3 mb-4">
                  {ticket.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.sender === "guest"
                          ? "bg-cyan-400/10 border border-cyan-400/20"
                          : "bg-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-400">
                          {message.sender === "guest" ? "You" : "Admin"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{message.text}</p>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="mt-2 max-w-xs rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {ticket.status !== "close" && (
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    className="w-full px-3 py-2 bg-[#0c171c] border border-[#FFFFFF26] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none text-sm"
                  />
                  <button
                    onClick={() => handleReply(ticket._id)}
                    disabled={replying || !replyText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg font-medium hover:bg-cyan-300 transition-colors disabled:opacity-60 text-sm"
                  >
                    {replying ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                        {texts.replying}
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        {texts.sendReply}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full bg-transparent border-2 border-gray-600 text-gray-300 py-3 rounded-full font-semibold hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        <X size={16} />
        {texts.backToOrders}
      </button>
    </div>
  );
}
