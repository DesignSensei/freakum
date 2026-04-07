// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/productController");
const { productImages } = require("../../middleware/multer");
const { ensureRole } = require("../../middleware/authMiddleware");

/* ---------- Product Management Routes ---------- */
// Protect the entire router - Only Admin & Super-Admin can access
router.use(ensureRole("admin", "super-admin"));

/* ------------------------------ RENDER ROUTES (GET) ------------------------------ */
// List all products → GET /admin/products
router.get("/", productController.listProduct);

// Show form to add new product → GET /admin/products/new
router.get("/new", productController.newProduct);

// Show form to edit product → GET /admin/products/:id/edit
// router.get("/:id/edit", productController.editProduct);

// View single product → GET /admin/products/:id
// router.get("/:id", productController.viewProduct);

/* ------------------------------ API ROUTES (POST/PUT/DELETE) ------------------------------ */
// Create new product → POST /admin/products
router.post("/", productImages, productController.createProduct);

// Update product → PUT /admin/products/:id
// router.put("/:id", productController.updateProduct);

// Delete product → DELETE /admin/products/:id
// router.delete("/:id", productController.deleteProduct);

module.exports = router;
