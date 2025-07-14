const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  // Display name, e.g "Bullet Vibrators"
  name: {
    type: String,
    required: true,
  },

  // URL idenitfier, e,g "bullet-vibrators" and is always unique
  slug: {
    type: String,
    required: true,
    unique: true,
  },

  // Parent category for nesting, e.g "Bullet Vibrators" is a category but a child of "Vibrators & Massagers"
  // Null for top-level (e.g. “Vibrators & Massagers”)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
});

module.exports = mongoose.model("Category", categorySchema);
