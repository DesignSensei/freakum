// services/categoryService.js

const Category = require("../models/Category");

class CategoryService {
  static async getActiveCategories() {
    return await Category.find({ isActive: true }).select("_id name").sort("sortOrder name");
  }
}

module.exports = CategoryService;
