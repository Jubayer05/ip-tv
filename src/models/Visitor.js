import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    associatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    eligibleForTrial: { type: Boolean, default: true },
    trialUsedAt: { type: Date, default: null },
    trialData: {
      lineId: String,
      username: String,
      templateId: Number,
      templateName: String,
      lineType: Number,
      expireDate: Date,
    },
    meta: {
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true }
);

const Visitor =
  mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);
export default Visitor;
