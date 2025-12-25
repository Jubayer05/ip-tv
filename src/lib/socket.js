/**
 * Socket.io utility functions for server-side event emission
 * These functions are used in API routes to emit real-time updates
 */

/**
 * Get the global Socket.io instance
 * @returns {Object|null} Socket.io server instance or null
 */
export function getSocketIO() {
  if (typeof global !== "undefined" && typeof global.io !== "undefined") {
    return global.io;
  }
  return null;
}

/**
 * Emit ticket update to all clients in a ticket room
 * @param {string} ticketId - The ticket ID
 * @param {Object} data - Data to send with the update
 */
export function emitTicketUpdate(ticketId, data) {
  const io = getSocketIO();
  if (io && ticketId) {
    io.to(`ticket-${ticketId}`).emit("ticket-update", {
      ticketId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`📤 Emitted ticket-update for ticket-${ticketId}`);
  }
}

/**
 * Emit ticket list update to specific user or all admins
 * @param {string|null} userId - User ID (null = notify all admins)
 */
export function emitTicketListUpdate(userId = null) {
  const io = getSocketIO();
  if (io) {
    if (userId) {
      // Emit to specific user's tickets
      io.emit("ticket-list-update", { userId });
      console.log(`📤 Emitted ticket-list-update for user ${userId}`);
    } else {
      // Emit to all admins
      io.emit("admin-ticket-list-update");
      console.log(`📤 Emitted admin-ticket-list-update`);
    }
  }
}

/**
 * Emit notification for new ticket creation
 * @param {string} ticketId - The ticket ID
 * @param {Object} ticketData - Basic ticket data
 */
export function emitNewTicket(ticketId, ticketData) {
  const io = getSocketIO();
  if (io && ticketId) {
    io.emit("new-ticket", {
      ticketId,
      ticket: ticketData,
      timestamp: new Date().toISOString(),
    });
    console.log(`📤 Emitted new-ticket event for ticket-${ticketId}`);
  }
}

/**
 * Emit guest ticket update to all clients in a ticket room
 * @param {string} ticketId - The guest ticket ID
 * @param {Object} data - Data to send with the update
 */
export function emitGuestTicketUpdate(ticketId, data) {
  const io = getSocketIO();
  if (io && ticketId) {
    io.to(`guest-ticket-${ticketId}`).emit("guest-ticket-update", {
      ticketId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    console.log(`📤 Emitted guest-ticket-update for guest-ticket-${ticketId}`);
  }
}

/**
 * Emit guest ticket list update
 * @param {string|null} guestEmail - Guest email (null = notify all admins)
 */
export function emitGuestTicketListUpdate(guestEmail = null) {
  const io = getSocketIO();
  if (io) {
    if (guestEmail) {
      // Emit to specific guest's tickets
      io.emit("guest-ticket-list-update", { guestEmail });
      console.log(`📤 Emitted guest-ticket-list-update for ${guestEmail}`);
    } else {
      // Emit to all admins
      io.emit("admin-guest-ticket-list-update");
      console.log(`📤 Emitted admin-guest-ticket-list-update`);
    }
  }
}

/**
 * Emit notification for new guest ticket creation
 * @param {string} ticketId - The guest ticket ID
 * @param {Object} ticketData - Basic ticket data
 */
export function emitNewGuestTicket(ticketId, ticketData) {
  const io = getSocketIO();
  if (io && ticketId) {
    io.emit("new-guest-ticket", {
      ticketId,
      ticket: ticketData,
      timestamp: new Date().toISOString(),
    });
    console.log(`📤 Emitted new-guest-ticket event for guest-ticket-${ticketId}`);
  }
}
