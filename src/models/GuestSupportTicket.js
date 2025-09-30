import mongoose from "mongoose";

const guestMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["guest", "admin"],
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

const guestSupportTicketSchema = new mongoose.Schema(
  {
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      index: true,
    },
    guestName: {
      type: String,
      trim: true,
      required: false,
      default: "Guest User",
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
      type: [guestMessageSchema],
      default: [],
    },
    lastUpdatedBy: {
      type: String,
      enum: ["guest", "admin"],
      default: "guest",
    },
  },
  { timestamps: true }
);

guestSupportTicketSchema.index({ createdAt: -1 });

if (mongoose?.connection?.models?.GuestSupportTicket) {
  delete mongoose.connection.models.GuestSupportTicket;
}

const GuestSupportTicket = mongoose.model(
  "GuestSupportTicket",
  guestSupportTicketSchema
);

export default GuestSupportTicket;
