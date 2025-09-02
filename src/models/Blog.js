import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title
blogSchema.methods.generateSlug = function () {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim("-"); // Remove leading/trailing hyphens
};

// Auto-generate slug before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = this.generateSlug();
  }
  next();
});

// Virtual fields
blogSchema.virtual("excerpt").get(function () {
  const plainText = this.details.replace(/<[^>]*>/g, "");
  return plainText.length > 150
    ? plainText.substring(0, 150) + "..."
    : plainText;
});

blogSchema.virtual("readingTime").get(function () {
  const plainText = this.details.replace(/<[^>]*>/g, "");
  const wordsPerMinute = 200;
  const wordCount = plainText.split(" ").length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Indexes for better performance
blogSchema.index({ isPublished: 1, isActive: 1, publishedAt: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text", details: "text" });

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
export default Blog;
