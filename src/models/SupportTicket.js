import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
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
      required: true,
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
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

supportTicketSchema.index({ createdAt: -1 });

if (mongoose?.connection?.models?.SupportTicket) {
  delete mongoose.connection.models.SupportTicket;
}

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
