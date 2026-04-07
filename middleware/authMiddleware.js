// middleware/authMiddleware.js

// Only allow logged-in users
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect("/login");
}

// Decide "home" based on role
function roleAssign(role) {
  return ["admin", "super-admin"].includes(role) ? "/admin/dashboard" : "/shop";
}

// Only allow guests (not logged in)
// If already logged in, push them to into the app (shop)
function ensureGuest(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect(roleAssign(req.user?.role));
  }
  return next();
}

// Only show 2FA if there is a pending challenge
function ensurePending2FA(req, res, next) {
  if (req.session && req.session.pending2FA) {
    return next();
  }

  return res.redirect("/login");
}

// Role-based guard
// In authMiddleware.js - Improved ensureRole
function ensureRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect("/login");
    }

    if (roles.includes(req.user?.role)) {
      return next();
    }

    // User is logged in but doesn't have the right role
    logger.info(`[AUTH] Access denied for ${req.user.email} (role: ${req.user.role})`);

    if (req.xhr || req.headers.accept?.includes("json")) {
      return res.status(403).json({ message: "Admin access required" });
    }

    res.status(403).render("error", {
      title: "Access Denied",
      message: "You do not have permission to access this page. Admins only.",
    });
  };
}

function ensureApiRole(...roles) {
  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      if (roles.includes(req.user?.role)) return next();
      return res.status(403).send("Forbidden: Insufficient permissions");
    }
    return res.redirect("/login");
  };
}

module.exports = {
  ensureAuth,
  ensureGuest,
  ensurePending2FA,
  ensureRole,
  ensureApiRole,
  roleAssign,
};
