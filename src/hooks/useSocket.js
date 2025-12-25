"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

/**
 * Main Socket.io hook for managing connection
 * @returns {Object} { socket, isConnected }
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Get the app URL (client-side)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    if (!appUrl) {
      console.warn("Socket.io: No app URL found");
      return;
    }

    // Initialize socket connection
    const socket = io(appUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setIsConnected(false);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, isConnected };
}

/**
 * Hook for listening to ticket-specific updates
 * @param {string} ticketId - The ticket ID to listen to
 * @param {Function} onUpdate - Callback when ticket is updated
 * @returns {Object} { socket, isConnected }
 */
export function useTicketSocket(ticketId, onUpdate) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !ticketId || !isConnected) return;

    // Join ticket room
    socket.emit("join-ticket", ticketId);

    // Listen for ticket updates
    const handleUpdate = (data) => {
      if (data.ticketId === ticketId && onUpdate) {
        onUpdate(data);
      }
    };

    socket.on("ticket-update", handleUpdate);

    // Cleanup
    return () => {
      socket.off("ticket-update", handleUpdate);
      socket.emit("leave-ticket", ticketId);
    };
  }, [socket, ticketId, isConnected, onUpdate]);

  return { socket, isConnected };
}

/**
 * Hook for listening to guest ticket-specific updates
 * @param {string} ticketId - The guest ticket ID to listen to
 * @param {Function} onUpdate - Callback when ticket is updated
 * @returns {Object} { socket, isConnected }
 */
export function useGuestTicketSocket(ticketId, onUpdate) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !ticketId || !isConnected) return;

    // Join guest ticket room
    socket.emit("join-guest-ticket", ticketId);

    // Listen for guest ticket updates
    const handleUpdate = (data) => {
      if (data.ticketId === ticketId && onUpdate) {
        onUpdate(data);
      }
    };

    socket.on("guest-ticket-update", handleUpdate);

    // Cleanup
    return () => {
      socket.off("guest-ticket-update", handleUpdate);
      socket.emit("leave-guest-ticket", ticketId);
    };
  }, [socket, ticketId, isConnected, onUpdate]);

  return { socket, isConnected };
}

/**
 * Hook for listening to guest ticket list updates
 * @param {Function} onListUpdate - Callback when list needs to refresh
 * @param {string} guestEmail - Optional guest email to filter updates
 * @returns {Object} { socket, isConnected }
 */
export function useGuestTicketListSocket(onListUpdate, guestEmail = null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !onListUpdate) return;

    const handleListUpdate = (data) => {
      // If guestEmail is provided, only update if it matches
      if (guestEmail && data.guestEmail && data.guestEmail !== guestEmail) {
        return;
      }
      onListUpdate();
    };

    const handleAdminListUpdate = () => {
      // Always trigger for admin updates if no guestEmail filter
      if (!guestEmail) {
        onListUpdate();
      }
    };

    socket.on("guest-ticket-list-update", handleListUpdate);
    socket.on("admin-guest-ticket-list-update", handleAdminListUpdate);

    // Also listen for new guest tickets
    socket.on("new-guest-ticket", () => {
      if (!guestEmail) {
        onListUpdate();
      }
    });

    return () => {
      socket.off("guest-ticket-list-update", handleListUpdate);
      socket.off("admin-guest-ticket-list-update", handleAdminListUpdate);
      socket.off("new-guest-ticket");
    };
  }, [socket, isConnected, onListUpdate, guestEmail]);

  return { socket, isConnected };
}

/**
 * Hook for listening to ticket list updates
 * @param {Function} onListUpdate - Callback when list needs to refresh
 * @param {string} userId - Optional user ID to filter updates
 * @returns {Object} { socket, isConnected }
 */
export function useTicketListSocket(onListUpdate, userId = null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected || !onListUpdate) return;

    const handleListUpdate = (data) => {
      // If userId is provided, only update if it matches
      if (userId && data.userId && data.userId !== userId) {
        return;
      }
      onListUpdate();
    };

    const handleAdminListUpdate = () => {
      // Always trigger for admin updates if no userId filter
      if (!userId) {
        onListUpdate();
      }
    };

    socket.on("ticket-list-update", handleListUpdate);
    socket.on("admin-ticket-list-update", handleAdminListUpdate);

    // Also listen for new tickets
    socket.on("new-ticket", () => {
      if (!userId) {
        onListUpdate();
      }
    });

    return () => {
      socket.off("ticket-list-update", handleListUpdate);
      socket.off("admin-ticket-list-update", handleAdminListUpdate);
      socket.off("new-ticket");
    };
  }, [socket, isConnected, onListUpdate, userId]);

  return { socket, isConnected };
}
