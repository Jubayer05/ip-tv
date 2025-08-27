import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: [
        "general",
        "billing",
        "technical",
        "account",
        "streaming",
        "other",
      ],
      default: "general",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    // createdBy / updatedBy removed for now to avoid validation errors
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
faqSchema.index({ question: "text", answer: "text" });
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ order: 1 });

// Virtual for total helpful score
faqSchema.virtual("helpfulScore").get(function () {
  const total = this.helpful + this.notHelpful;
  return total > 0 ? Math.round((this.helpful / total) * 100) : 0;
});

// Ensure virtual fields are serialized
faqSchema.set("toJSON", { virtuals: true });
faqSchema.set("toObject", { virtuals: true });

// Force recompile to avoid stale schema (dev/HMR)
if (mongoose?.connection?.models?.FAQ) {
  delete mongoose.connection.models.FAQ;
}

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;
