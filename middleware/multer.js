const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/products");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fileName = uniqueSuffix + ext;

    file.publicPath = `/uploads/products/${fileName}`;

    cb(null, fileName);
  },
});

// Security: only allow images (block .pdf, .exe, .zip, etc.)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Named presets for multiple use-cases
module.exports = {
  // Single main/thumbnail image
  productThumbnail: upload.single("avatar"),

  // Product gallery (multiple images)
  productGalleryMax10: upload.array("files", 10),
  productGalleryMax8: upload.array("files", 8),
  productGalleryUnlimited: upload.array("files"),

  // Upload for product images via a single middleware
  productImages: upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "media_images", maxCount: 10 },
  ]),
};
