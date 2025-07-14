const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

    basePrice: {
      type: mongoose.Types.Decimal128,
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    // Link to one or more categories
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    // Array of image URLs
    images: {
      type: [string],
      default: [],
    },

    // Optional toy-specific specs
    specs: {
      material: String,
      dimensions: {
        length: Number,
        diameter: Number,
      },
      vibrationModes: [String], // e.g. ['pulse','wave']
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
