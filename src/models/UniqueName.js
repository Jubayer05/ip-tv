import mongoose from "mongoose";

const uniqueNameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    reviewUsed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
// uniqueNameSchema.index({ name: 1 });
uniqueNameSchema.index({ reviewUsed: 1 });

// Pre-save middleware to update updatedAt
uniqueNameSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});



// Static method to find unused names
uniqueNameSchema.statics.findUnusedNames = function () {
  return this.find({ reviewUsed: false });
};

// Static method to find used names
uniqueNameSchema.statics.findUsedNames = function () {
  return this.find({ reviewUsed: true });
};

// Method to mark name as used
uniqueNameSchema.methods.markAsUsed = function () {
  this.reviewUsed = true;
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark name as unused
uniqueNameSchema.methods.markAsUnused = function () {
  this.reviewUsed = false;
  this.updatedAt = new Date();
  return this.save();
};

// Clear the model from cache to ensure new methods are available
if (mongoose.models.UniqueName) {
  delete mongoose.models.UniqueName;
}

const UniqueName = mongoose.model("UniqueName", uniqueNameSchema);

export default UniqueName;
