import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin", "guest"],
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Make optional for guest tickets
      index: true,
    },
    // Guest ticket fields
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: false,
      index: true,
    },
    guestName: {
      type: String,
      trim: true,
      required: false,
    },
    isGuestTicket: {
      type: Boolean,
      default: false,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "reply", "close"],
      default: "open",
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    lastUpdatedBy: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ createdAt: -1 });

// Validation to ensure either user or guestEmail is provided
supportTicketSchema.pre("save", function (next) {
  if (!this.user && !this.guestEmail) {
    return next(new Error("Either user ID or guest email is required"));
  }
  if (this.user && this.guestEmail) {
    return next(new Error("Cannot have both user ID and guest email"));
  }
  next();
});

if (mongoose?.connection?.models?.SupportTicket) {
  delete mongoose.connection.models.SupportTicket;
}

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
