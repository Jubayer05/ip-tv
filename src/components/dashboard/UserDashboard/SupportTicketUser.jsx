"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, MessageCircle, Send, Upload, X, ZoomIn } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const SupportTicketUser = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  const openTicketsCount = useMemo(
    () =>
      tickets.filter((t) => t.status === "open" || t.status === "reply").length,
    [tickets]
  );

  const load = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/support/tickets?userId=${encodeURIComponent(user._id)}`
      );
      const data = await res.json();
      if (data?.success) setTickets(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: "Please select a file smaller than 5MB",
          confirmButtonColor: "#44dcf3",
        });
        return;
      }
      // Check file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Please select an image file",
          confirmButtonColor: "#44dcf3",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/support/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        return data.url;
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    if (openTicketsCount >= 3) {
      Swal.fire({
        icon: "warning",
        title: "Limit reached",
        text: "You already have 3 open tickets. Please close one to create a new ticket.",
        confirmButtonColor: "#44dcf3",
      });
      return;
    }
    try {
      setSubmitting(true);

      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          title,
          description,
          image: imageUrl || "",
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setTitle("");
        setDescription("");
        setSelectedFile(null);
        await load();
        Swal.fire({
          icon: "success",
          title: "Ticket created",
          confirmButtonColor: "#44dcf3",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data?.error || "Failed to create ticket",
          confirmButtonColor: "#44dcf3",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create ticket. Please try again.",
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: { sender: "user", text: replyText },
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setReplyText("");
        await load();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "reply":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
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
      default:
        return "bg-gray-900/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-4 font-secondary">
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
        <form onSubmit={create} className="space-y-3">
          <input
            className="w-full bg-black border border-[#212121] rounded px-3 py-2 text-white"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full bg-black border border-[#212121] rounded px-3 py-2 text-white"
            placeholder="Describe your issue"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">
              Attach Image (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </label>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-300">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-400 cursor-pointer hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Open tickets: {openTicketsCount} / 3</span>
            <button
              type="submit"
              disabled={submitting || openTicketsCount >= 3}
              className="bg-primary cursor-pointer hover:bg-primary/80 text-black px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">My Tickets</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No tickets yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t._id}
                className="border border-[#212121] rounded-lg overflow-hidden"
              >
                {/* Ticket Header */}
                <div className="bg-gray-900/50 p-4 border-b border-[#212121]">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{t.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
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
                      <button
                        onClick={() =>
                          setActiveId(activeId === t._id ? null : t._id)
                        }
                        className="cursor-pointer text-xs bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
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
                            m.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              m.sender === "user"
                                ? "bg-primary text-black"
                                : "bg-gray-800 text-white"
                            }`}
                          >
                            <div className="text-xs opacity-70 mb-1">
                              {m.sender === "user" ? "You" : "Support"} •{" "}
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
                                    m.sender === "user"
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
                            placeholder="Type your message..."
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
                            className="bg-primary cursor-pointer hover:bg-primary/80 text-black px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
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

export default SupportTicketUser;
