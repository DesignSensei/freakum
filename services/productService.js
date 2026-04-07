// services/productService.js

const Product = require("../models/Product");

class ProductService {
  // Fetch all products from the database
  static async getAllProducts() {
    try {
      return await Product.find().populate("categories", "name").sort({ createdAt: -1 });
    } catch (error) {
      throw new Error("Error fetching products: " + error.message);
    }
  }

  // Fetch a single product by its ID
  static async getProductById(productId) {
    try {
      const product = await Product.findById(productId).populate("categories", "name");
      if (!product) throw new Error("Product not found");
    } catch (error) {
      throw new Error("Error fetching the product: " + error.message);
    }

    return product;
  }

  // Fetch products with pagination and filters
  static async getProductsPaginated(options) {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      paginate = true,
    } = options;

    try {
      // Build MongoDB query
      let query = {};

      // Search filter - search in name, slug, or description
      if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [{ name: regex }, { slug: regex }, { description: regex }];
      }

      // Status filter
      if (status === "active") query.active = true;
      else if (status === "inactive") query.active = false;

      // If status is 'all', don't add to query (show both)

      const totalProducts = await Product.countDocuments(query);

      let productsQuery = Product.find(query)
        .populate("categories", "name")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });

      if (paginate) {
        const skip = (page - 1) * pageSize;
        productsQuery = productsQuery.skip(skip).limit(Number(pageSize));
      }

      const products = await productsQuery;

      const result = { products, totalProducts };

      if (paginate) {
        result.totalPages = Math.ceil(totalProducts / pageSize);
        result.currentPage = Number(page);
        result.pageSize = Number(pageSize);
      }

      return result;
    } catch (error) {
      throw new Error("Error fetching paginated products: " + error.message);
    }
  }

  // Get total number of products
  static async getTotalProducts() {
    return await Product.countDocuments();
  }

  // Get number of published products
  static async getPublishedProducts() {
    return await Product.countDocuments({ active: true });
  }

  // Get number of products with low stock (e.g., stock <= 10)
  static async getLowStockProducts() {
    try {
      const total = await Product.countDocuments({ quantity: { $lte: 10 } });
      return total;
    } catch (error) {
      throw new Error("Error fetching low stock products: " + error.message);
    }
  }

  // Get number of out-of-stock products (stock = 0)
  static async getOutOfStockProducts() {
    try {
      const total = await Product.countDocuments({ quantity: 0 });
      return total;
    } catch (error) {
      throw new Error("Error fetching out of stock products: " + error.message);
    }
  }

  static async createProduct(input) {
    try {
      const name = (input.name || "").trim();

      if (!name) throw new Error("Product name is required");

      // Normalize data (tags, variations, etc)
      const tags = input.kt_ecommerce_add_product_tags
        ? input.kt_ecommerce_add_product_tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      // Capture raw input of variations, convert Object to Array if necessary, and clean input
      const rawOptions = input.kt_ecommerce_add_product_options || {};

      // Convert repeater object { '0': {...}, '1': {...} } into array
      const optionsArray = Object.values(rawOptions).filter(Boolean);

      const variations = optionsArray
        .filter((v) => v?.size?.trim() && v?.color?.trim() && Number(v?.stock) > 0)
        .map((v) => ({
          size: v.size.trim(),
          color: v.color.trim(),
          stock: Number(v.stock),
          sku: v.sku?.trim() || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        }));

      if (variations.length === 0) {
        throw new Error(
          "Product must have at least one valid variation with size, color and stock > 0."
        );
      }

      // Price logic
      const price = Number(input.price);
      if (!input.price || isNaN(price) || price <= 0) {
        throw new Error("Price must be a valid number");
      }

      // Discount Logic
      const discountOption = input.discount_option || "none";
      let discountPercentage = 0;
      let discountedPrice = null;

      if (discountOption === "percentage") {
        discountPercentage = Number(input.discount_percentage) || 0;

        if (discountPercentage < 0 || discountPercentage > 100) {
          throw new Error("Discount percentage must be between 0 and 100");
        }
      }

      if (discountOption === "fixed") {
        discountedPrice = Number(input.discounted_price);

        if (isNaN(discountedPrice) || discountedPrice <= 0 || discountedPrice >= price) {
          throw new Error("Discounted price must be less than base price");
        }
      }

      // Normalizing categories
      const categories = Array.isArray(input.categories)
        ? input.categories
        : input.categories
          ? [input.categories]
          : [];

      // Build the new Product document
      const product = new Product({
        name: name,
        description: input.description || "",
        price: price,
        currency: "NGN",
        discountOption,
        discountPercentage,
        discountedPrice,
        status: input.status || "active",
        publishDate: input.publish_date ? new Date(input.publish_date) : null,
        categories,
        tags,
        thumbnail: input.avatar || null,
        gallery: input.mediaImages || [],
        variations,
        fabric: input.fabric || "",
        gender: input.gender || "Unisex",
        createdBy: input.createdBy,
      });

      // Save to database
      await product.save();

      return product;
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }
}

module.exports = ProductService;
