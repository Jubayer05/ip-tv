import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    languageCode: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // index: true,
    },
    translations: {
      type: Map,
      of: {
        translated: String,
        original: String,
      },
      default: new Map(),
    },
    lastUpdated: {
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

// Index for faster queries - removed because unique: true already creates an index
// translationSchema.index({ languageCode: 1 });

// Helper method to get translation by key (supports dot notation)
translationSchema.methods.getTranslation = function (key) {
  const value = this.translations.get(key);
  return value ? value.translated : null;
};

// Helper method to set translation
translationSchema.methods.setTranslation = function (
  key,
  translated,
  original
) {
  this.translations.set(key, {
    translated,
    original: original || translated,
  });
  this.lastUpdated = new Date();
};

// Static method to get or create translation document
translationSchema.statics.getOrCreate = async function (languageCode) {
  let doc = await this.findOne({ languageCode: languageCode.toLowerCase() });
  if (!doc) {
    doc = new this({ languageCode: languageCode.toLowerCase() });
    await doc.save();
  }
  return doc;
};

// Static method to get multiple translations at once
translationSchema.statics.getTranslations = async function (
  languageCode,
  keys
) {
  const doc = await this.findOne({ languageCode: languageCode.toLowerCase() });
  if (!doc) return {};

  const result = {};
  keys.forEach((key) => {
    const value = doc.translations.get(key);
    result[key] = value ? value.translated : null;
  });
  return result;
};

const Translation =
  mongoose.models.Translation ||
  mongoose.model("Translation", translationSchema);

export default Translation;
