const authService = require("../services/authService");
const logger = require("../utils/logger");

exports.showSignUp = (req, res) => {
  res.render("signup", { error: null, formData: {} });
};

exports.signup = async (req, res) => {
  try {
    await authService.registerUser(req.body);
    return res.redirect("/login/?newUser=true");
  } catch (err) {
    return res.status(400).render("signup", {
      error: err.message,
      formData: {
        name: req.body.name,
        email: req.body.email,
      },
    });
  }
};

exports.showLogin = (req, res) => {
  // If user is logged in and already has a session
  if (req.session.userId) {
    return res.redirect(
      req.session.role === "admin" ? "/admin/dashboard" : "/shop"
    );
  }

  // Else run login form rendering as usual
  const newUser = req.query.newUser === "true";
  const passwordReset = req.query.passwordReset === "true";

  res.render("login", {
    error: null,
    formData: {},
    newUser,
    passwordReset,
  });
};

exports.login = async (req, res) => {
  try {
    const user = await authService.loginUser(req.body);

    // Remember them in session for later requests
    req.session.userId = user._id;
    req.session.role = user.role;

    // Send them where they belong
    if (user.isAdmin) {
      return res.redirect("/admin/dashboard");
    }
    return res.redirect("/shop");
  } catch (err) {
    return res.status(401).render("login", {
      error: err.message,
      formData: { email: req.body.email },
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) logger.error(err);
    res.redirect("/login");
  });
};

exports.showForgotPassword = (req, res) => {
  res.render("forgot-password", { error: null, success: null });
};

exports.handleForgotPassword = async (req, res) => {
  try {
    await authService.generatePasswordReset(req.body);
    return res.render("forgot-password", {
      error: null,
      success: "Check your email for a reset link!",
    });
  } catch (err) {
    return res.render("forgot-password", { error: err.message, success: null });
  }
};

exports.showResetPassword = (req, res) => {
  // If no token in the URL, send them back to the forgot-password page
  const { token } = req.query;
  if (!token) {
    return res.redirect("forgot-password");
  }

  // Render the reset form, passing along the token
  res.render("reset-password", { error: null, token });
};

exports.handleResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await authService.resetPassword(req.body);
    return res.redirect("/login?passwordReset=true");
  } catch (err) {
    // On failure, re-render the form with the error and keep token hidden
    return res
      .status(400)
      .render("reset-password", { error: err.message, token });
  }
};

exports.showSendOtp = (req, res) => {
  res.render("send-otp", { error: null, success: null });
};

exports.handleSendOtp = async (req, res) => {
  try {
    await authService.sendOtp(req.body);
    return res.render("send-otp", {
      error: null,
      success: "OTP has been sent to your email",
    });
  } catch (err) {
    return res
      .status(400)
      .render("send-otp", { error: err.message, success: null });
  }
};

exports.showVerifyOtp = (req, res) => {
  res.render("verify-otp", { error: null });
};

exports.handleVerifyOtp = async (req, res) => {
  try {
    const user = await authService.verifyOtp(req.body);

    // On success you might log them in, e.g.:
    req.session.userId = user._id;
    req.session.role = user.role;

    if (user.isAdmin) {
      return res.redirect("/admin/dashboard");
    }
    return res.redirect("/shop");
  } catch (err) {
    return res.status(400).render("verify-otp", {
      error: err.message,
      formData: { email: req.body.email, code: req.body.code },
    });
  }
};
