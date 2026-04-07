// models/Product.js

const mongoose = require("mongoose");

// Tiny slugger function
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces/symbols with "-"
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}

function toMoney(n) {
  if (n == null) return n;
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.round(num * 100) / 100; // ensures price is two decimal points
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      set: toMoney,
    },

    discountOption: {
      type: String,
      enum: ["none", "percentage", "fixed"],
      default: "none",
    },

    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    discountedPrice: {
      type: Number,
      set: toMoney,
      default: null,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    thumbnail: {
      type: String,
    },

    gallery: {
      type: [String],
      default: [],
    },

    variations: [
      {
        size: { type: String, enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
        color: { type: String },
        stock: { type: Number, min: 0, default: 0 },
        sku: {
          type: String,
          trim: true,
          sparse: true,
          index: true,
        },
      },
    ],

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    meta: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: { type: String, trim: true },
    },

    fabric: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Unisex", "Men", "Women"],
      default: "Unisex",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft", "scheduled"],
      default: "draft",
      index: true,
    },

    publishDate: {
      type: Date,
      default: null,
      index: true,
    },

    active: { type: Boolean, default: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      indx: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug if missing
productSchema.pre("validate", function () {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

// Text index for search
productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 5, description: 1 } }
);

// Helpful read index (common pattern you'll query)
productSchema.index({ active: 1, createdAt: -1 });

// Index for filtering by category and gender
productSchema.index({ categories: 1, gender: 1 });

module.exports = mongoose.model("Product", productSchema);
