// controllers/admin/productController.js

const ProductService = require("../../services/productService");
const CategoryService = require("../../services/categoryService");
const logger = require("../../utils/logger");
// const CategoryService = require("../services/categoryService");

//─────────────────────────────── PRODUCT RENDER BLOCK (GET ROUTES) ───────────────────────────────//

// Render Product List Page
exports.listProduct = async (req, res) => {
  try {
    // Fetch products using the ProductService or directly with Mongoose
    const products = await ProductService.getAllProducts();

    const totalProducts = await ProductService.getTotalProducts();
    const publishedProducts = await ProductService.getPublishedProducts();
    const lowStockProducts = await ProductService.getLowStockProducts();
    const outOfStockProducts = await ProductService.getOutOfStockProducts();

    // Render view with data
    res.render("admin/products/listing", {
      layout: "layouts/admin-layout",
      title: "Products",
      pageTitle: "Products",
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Products", url: null },
      ],
      products,
      totalProducts,
      publishedProducts,
      lowStockProducts,
      outOfStockProducts,
      scripts: `
      <script src="/js/custom/products/listing.js"></script>
      <script src="/assets/plugins/custom/datatables/datatables.bundle.js"></script>
      `,
    });
  } catch (error) {
    logger.error("Error retrieving products:", error);
    res.status(500).json({
      error: "Unable to retrieve products. Please try again later.",
    });
  }
};

// Render Add Product Form
exports.newProduct = async (req, res) => {
  try {
    const categories = await CategoryService.getActiveCategories();

    res.render("admin/products/new", {
      layout: "layouts/admin-layout",
      title: "Add New Product",
      pageTitle: "Add New Product",
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Products", url: "/admin/products" },
        { name: "Add New", url: null },
      ],
      categories,
      scripts: `
      <script src="/js/custom/products/save-product.js"></script>
      <script src="/js/custom/products/new.js"></script>
      <script src="/assets/plugins/custom/formrepeater/formrepeater.bundle.js"></script>
      <script src="/assets/plugins/custom/datatables/datatables.bundle.js"></script>
      `,
    });
  } catch (error) {
    logger.error("Error rendering new product form:", error);
    res.status(500).json({ error: "Unable to load form." });
  }
};

//─────────────────────────────── PRODUCT ACTION BLOCK (POST ROUTES) ───────────────────────────────//
exports.createProduct = async (req, res) => {
  logger.info("POST /admin/products received");
  logger.info("req.body:", req.body);
  logger.info("req.files:", req.files);
  logger.info("req.user?._id:", req.user?._id);

  try {
    const input = {
      ...req.body,
      name: (req.body.name || "").trim(),
      description: (req.body.description || "").trim(),
      avatar: req.files?.avatar?.[0]?.filename || null,
      mediaImages: req.files?.["media_images"]?.map((f) => f.filename) || [],
      createdBy: req.user?._id,
    };

    logger.info("Prepared input for service:", input);
    logger.info("Prepared input for service -> avatar:", input.avatar ? "Present" : "Missing");
    logger.info("Prepared input for service -> mediaImages count:", input.mediaImages.length);

    const newProduct = await ProductService.createProduct(input);

    logger.info("Product created successfully:", newProduct._id);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      redirect: newProduct._id ? `/admin/products/${newProduct._id}/edit` : "/admin/products",
    });
  } catch (err) {
    logger.error("Create product error:", err.message);
    logger.error("Full error stack:", err.stack);

    return res.status(400).json({
      success: false,
      message: err.message || "Failed to create product",
    });
  }
};
