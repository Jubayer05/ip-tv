const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// Graceful shutdown handling
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[${signal}] Graceful shutdown started...`);

  // Give 10 seconds to finish in-flight requests
  setTimeout(() => {
    console.log('[Shutdown] Forcing exit after timeout');
    process.exit(0);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch uncaught errors to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught Exception:', err.message);
  console.error(err.stack);
  // Don't exit - let the process continue if possible
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Error] Unhandled Rejection:', reason);
  // Don't exit - just log
});

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Join ticket room when user opens a ticket chat
    socket.on("join-ticket", (ticketId) => {
      if (ticketId) {
        socket.join(`ticket-${ticketId}`);
        console.log(`📌 Socket ${socket.id} joined ticket-${ticketId}`);
      }
    });

    // Leave ticket room
    socket.on("leave-ticket", (ticketId) => {
      if (ticketId) {
        socket.leave(`ticket-${ticketId}`);
        console.log(`👋 Socket ${socket.id} left ticket-${ticketId}`);
      }
    });

    // Join guest ticket room when user opens a guest ticket chat
    socket.on("join-guest-ticket", (ticketId) => {
      if (ticketId) {
        socket.join(`guest-ticket-${ticketId}`);
        console.log(`📌 Socket ${socket.id} joined guest-ticket-${ticketId}`);
      }
    });

    // Leave guest ticket room
    socket.on("leave-guest-ticket", (ticketId) => {
      if (ticketId) {
        socket.leave(`guest-ticket-${ticketId}`);
        console.log(`👋 Socket ${socket.id} left guest-ticket-${ticketId}`);
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected:", socket.id, reason);
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("❌ Socket error:", socket.id, error);
    });
  });

  // Make io available globally for use in API routes
  global.io = io;

  httpServer
    .once("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> ✅ Ready on http://${hostname}:${port}`);
      console.log(`> 🔌 Socket.io server initialized`);
      console.log(`> 📡 Environment: ${dev ? "development" : "production"}`);
    });
});
