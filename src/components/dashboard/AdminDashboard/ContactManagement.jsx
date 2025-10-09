"use client";
import Button from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { language, translate, isLanguageLoaded } = useLanguage();
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

  const ORIGINAL_TEXTS = {
    heading: "Contact Management",
    total: "Total",
    open: "Open",
    closed: "Closed",
    status: "Status",
    priority: "Priority",
    search: "Search",
    allStatus: "All Status",
    allPriority: "All Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    searchContacts: "Search contacts...",
    loadingContacts: "Loading contacts...",
    noContactsFound: "No contacts found",
    contactDetails: "Contact Details",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    adminNotes: "Admin Notes",
    addAdminNotes: "Add admin notes...",
    updateContact: "Update Contact",
    close: "Close",
    view: "View",
    closeTicket: "Close",
    reopen: "Reopen",
    success: "Success",
    contactActionedSuccessfully: "Contact {action}ed successfully",
    error: "Error",
    failedToActionContact: "Failed to {action} contact",
    updated: "Updated",
    contactUpdatedSuccessfully: "Contact updated successfully",
    failedToUpdateContact: "Failed to update contact",
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
          title: texts.success,
          text: texts.contactActionedSuccessfully.replace("{action}", action),
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
        title: texts.error,
        text: texts.failedToActionContact.replace("{action}", action),
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
          title: texts.updated,
          text: texts.contactUpdatedSuccessfully,
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
        title: texts.error,
        text: texts.failedToUpdateContact,
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
      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
    ) : (
      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
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
    <div className="space-y-4 sm:space-y-6 font-secondary sm:px-6 lg:px-8 w-[350px] sm:w-[600px] md:w-full">
      {/* Header with Stats */}
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {texts.heading}
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="bg-gray-900/50 rounded-lg p-2 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.total}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              {texts.total}
            </div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-2 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-yellow-300">
              {stats.open}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">{texts.open}</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-2 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-300">
              {stats.closed}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              {texts.closed}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              {texts.status}
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm"
            >
              <option value="all">{texts.allStatus}</option>
              <option value="open">{texts.open}</option>
              <option value="closed">{texts.closed}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              {texts.priority}
            </label>
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm"
            >
              <option value="all">{texts.allPriority}</option>
              <option value="high">{texts.high}</option>
              <option value="medium">{texts.medium}</option>
              <option value="low">{texts.low}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              {texts.search}
            </label>
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder={texts.searchContacts}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 text-white text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6 text-white">
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-2 text-gray-400 text-xs sm:text-sm">
              {texts.loadingContacts}
            </p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-xs sm:text-sm sm:text-base">
              {texts.noContactsFound}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="border border-[#212121] rounded-lg p-3 sm:p-4 hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg">
                        {contact.fullName}
                      </h3>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] sm:text-xs ${getStatusColor(
                            contact.status
                          )}`}
                        >
                          {getStatusIcon(contact.status)}
                          {contact.status.toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[10px] sm:text-xs ${getPriorityColor(
                            contact.priority
                          )}`}
                        >
                          {contact.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{contact.email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="truncate">{contact.subject}</span>
                      </span>
                      <span className="text-xs sm:text-sm">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(contact)}
                      className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs font-medium"
                    >
                      <Eye className="w-3 h-3" />
                      {texts.view}
                    </Button>
                    {contact.status === "open" ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(contact._id, "close")}
                        className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs font-medium bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                      >
                        <X className="w-3 h-3" />
                        {texts.closeTicket}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(contact._id, "reopen")
                        }
                        className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs font-medium bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {texts.reopen}
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
          <div className="bg-black border border-[#212121] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {texts.contactDetails}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {texts.name}
                    </label>
                    <p className="text-white text-xs sm:text-sm">
                      {selectedContact.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                      {texts.email}
                    </label>
                    <p className="text-white text-xs sm:text-sm break-all">
                      {selectedContact.email}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    {texts.subject}
                  </label>
                  <p className="text-white text-xs sm:text-sm">
                    {selectedContact.subject}
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    {texts.message}
                  </label>
                  <div className="bg-gray-900/50 rounded-lg p-2 sm:p-3">
                    <p className="text-white whitespace-pre-wrap text-xs sm:text-sm">
                      {selectedContact.description}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    {texts.adminNotes}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={texts.addAdminNotes}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                    {texts.priority}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm"
                  >
                    <option value="low">{texts.low}</option>
                    <option value="medium">{texts.medium}</option>
                    <option value="high">{texts.high}</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Button
                    onClick={handleUpdateContact}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    {texts.updateContact}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    {texts.close}
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
