import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to close contact
contactSchema.methods.closeContact = function (adminEmail) {
  this.status = "closed";
  this.closedAt = new Date();
  this.closedBy = adminEmail;
  return this.save();
};

// Method to reopen contact
contactSchema.methods.reopenContact = function () {
  this.status = "open";
  this.closedAt = null;
  this.closedBy = null;
  return this.save();
};

// Static method to get contact statistics
contactSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Check if model already exists to prevent overwrite error
const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
