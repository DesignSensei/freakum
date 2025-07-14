// Any logged-in user
exports.requireAuth = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect("/login");
};

// Only admins
exports.requireAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    return next();
  }
  res.status(403).render("error", { message: "Forbidden" });
};
