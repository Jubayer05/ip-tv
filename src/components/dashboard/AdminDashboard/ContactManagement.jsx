"use client";
import Button from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [priority, setPriority] = useState("medium");

  const loadContacts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status !== "all")
        queryParams.append("status", filters.status);
      if (filters.priority !== "all")
        queryParams.append("priority", filters.priority);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(`/api/contacts?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setContacts(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [filters]);

  const handleStatusChange = async (contactId, action) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminEmail: "admin@example.com", // Replace with actual admin email
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Contact ${action}ed successfully`,
          confirmButtonColor: "#44dcf3",
          timer: 1500,
          showConfirmButton: false,
        });
        loadContacts();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${action} contact`,
        confirmButtonColor: "#44dcf3",
      });
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(`/api/contacts/${selectedContact._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          adminNotes,
          priority,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Contact updated successfully",
          confirmButtonColor: "#44dcf3",
          timer: 1500,
          showConfirmButton: false,
        });
        setShowModal(false);
        loadContacts();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update contact",
        confirmButtonColor: "#44dcf3",
      });
    }
  };

  const openModal = (contact) => {
    setSelectedContact(contact);
    setAdminNotes(contact.adminNotes || "");
    setPriority(contact.priority);
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    return status === "open" ? (
      <Clock className="w-4 h-4 text-yellow-500" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-500" />
    );
  };

  const getStatusColor = (status) => {
    return status === "open"
      ? "bg-yellow-900/20 text-yellow-300 border-yellow-500/30"
      : "bg-green-900/20 text-green-300 border-green-500/30";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-900/20 text-red-300 border-red-500/30";
      case "medium":
        return "bg-yellow-900/20 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-green-900/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-900/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6 font-secondary">
      {/* Header with Stats */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Contact Management</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-300">
              {stats.open}
            </div>
            <div className="text-sm text-gray-400">Open</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-300">
              {stats.closed}
            </div>
            <div className="text-sm text-gray-400">Closed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-black border border-[#212121] rounded-lg p-6 text-white">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No contacts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="border border-[#212121] rounded-lg p-4 hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {contact.fullName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {getStatusIcon(contact.status)}
                        {contact.status.toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${getPriorityColor(
                          contact.priority
                        )}`}
                      >
                        {contact.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {contact.subject}
                      </span>
                      <span>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(contact)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-medium"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    {contact.status === "open" ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(contact._id, "close")}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                      >
                        <X className="w-3 h-3" />
                        Close
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(contact._id, "reopen")
                        }
                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-[#212121] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Contact Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Name
                    </label>
                    <p className="text-white">{selectedContact.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-white">{selectedContact.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Subject
                  </label>
                  <p className="text-white">{selectedContact.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Message
                  </label>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-white whitespace-pre-wrap">
                      {selectedContact.description}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add admin notes..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUpdateContact}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Update Contact
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
