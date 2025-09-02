import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
reviewSchema.index({ userId: 1, isApproved: 1 });
reviewSchema.index({ isApproved: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

// Virtual for user full name
reviewSchema.virtual("userFullName").get(function () {
  return this.userId?.profile?.fullName || "Anonymous";
});

// Static method to get approved reviews
reviewSchema.statics.getApprovedReviews = function (limit = 10) {
  return this.find({ isApproved: true, isActive: true })
    .populate("userId", "profile.firstName profile.lastName profile.avatar")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get average rating
reviewSchema.statics.getAverageRating = function () {
  return this.aggregate([
    { $match: { isApproved: true, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratings: {
          $push: "$rating",
        },
      },
    },
    {
      $addFields: {
        starDistribution: {
          $reduce: {
            input: [1, 2, 3, 4, 5],
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                {
                  $arrayToObject: [
                    [
                      {
                        k: { $toString: "$$this" },
                        v: {
                          $size: {
                            $filter: {
                              input: "$ratings",
                              cond: { $eq: ["$$this", "$$this"] },
                            },
                          },
                        },
                      },
                    ],
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ]);
};

// Force recompile to avoid stale schema
if (mongoose?.connection?.models?.Review) {
  delete mongoose.connection.models.Review;
}

const Review = mongoose.model("Review", reviewSchema);

export default Review;
