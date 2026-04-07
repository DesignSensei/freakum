// routes/pageRoutes

const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");

/* ---------- Public pages (GET) ---------- */
router.get("/", pageController.showHome);
router.get("/home", pageController.showHome);

module.exports = router;
