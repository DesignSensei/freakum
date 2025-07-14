const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ── Public auth pages ─────────────────────────────────────────

// Signup
router.get("/signup", authController.showSignUp);
router.post("/signup", authController.signup);

// Login
router.get("/login", authController.showLogin);
router.post("/login", authController.login);

// Logout (Destroy Session)
router.post("/logout", authController.logout);

// ── Password Reset ─────────────────────────────────────────
// Forgot password
router.get("/forgot-password", authController.showForgotPassword);
router.post("/forgot-password", authController.handleForgotPassword);

// Reset password
router.get("/reset-password", authController.showResetPassword);
router.post("/reset-password", authController.handleResetPassword);

// ── OTP flow ────────────────────────────────────────────────────────
// Send OTP
router.get("/send-otp", authController.showSendOtp);
router.post("/send-otp", authController.handleSendOtp);

// Verify OTP
router.get("/verify-otp", authController.showVerifyOtp);
router.post("/verify-otp", authController.handleVerifyOtp);

module.exports = router;
