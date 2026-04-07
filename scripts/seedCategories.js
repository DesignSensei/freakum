// scripts/seedCategories.js

require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const logger = require("../utils/logger");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Database connected");

  await Category.deleteMany({});
  logger.info("Cleared existing categories");

  const categories = [
    // By Collection
    { name: "Essentials", slug: "essentials" },
    { name: "Expressive", slug: "expressive" },
    { name: "Active", slug: "active" },
    { name: "New Arrivals", slug: "new-arrivals" },

    // By Gender
    { name: "Men's", slug: "mens" },
    { name: "Women's", slug: "womens" },
    { name: "Unisex", slug: "unisex" },

    // By Product Type
    { name: "T-Shirts", slug: "t-shirts" },
    { name: "Hoodies", slug: "hoodies" },
    { name: "Pants", slug: "pants" },
    { name: "Shorts", slug: "shorts" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
  ];

  await Category.insertMany(
    categories.map((cat, index) => ({
      ...cat,
      parent: null,
      isActive: true,
      description: "",
      sortOrder: index,
    }))
  );

  logger.info(`✅ Categories seeded successfully!`);
  logger.info(`📊 Total categories created: ${categories.length}`);

  mongoose.disconnect();
}

seed().catch((error) => {
  logger.error("Error seeding categories:", error);
  process.exit(1);
});
