import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    // Internal reference
    name: {
      type: String,
      required: true,
    },
    description: String,
    
    // NOWPayments plan ID
    nowpaymentsSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Pricing
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    
    // Billing cycle
    intervalDays: {
      type: Number,
      required: true,
      default: 30,
    },
    
    // Plan features
    features: {
      devicesAllowed: Number,
      adultChannels: Boolean,
      supportLevel: String,
      qualityOptions: [String],
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Limits
    maxUsers: Number,
    availableSlots: Number,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.models.SubscriptionPlan || 
  mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
