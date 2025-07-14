const path = require("path");
require("dotenv").config();
const logger = require("./utils/logger");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/authRoutes");
const { requireAuth, requireAdmin } = require("./middleware/guards");
const connectDB = require("./config/db");

connectDB();

// Initialize app
const app = express();
const PORT = process.env.PORT || 2000;

app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.isAdmin = req.session.role === "admin";
  next();
});

// App Level Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use((req, res, next) => {
  res.on("finish", () => {
    logger.info(`${req.method} ${req.url} ${req.statusCode}`);
  });
  next();
});

// Setting up Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport to use sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", authRoutes);

// Admin dashboard—only admins
app.get("/admin/dashboard", requireAdmin, (req, res) => {
  res.render("admin-dashboard");
});

// Any other protected route—for both roles
app.get("/profile", requireAuth, (req, res) => {
  res.render("profile");
});

// Handle any unmatched route
app.use((req, res) => {
  res.status(404).render("not-found");
});

// Catch any thrown errors and render an error page
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).render("error", { message: err.message });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost${PORT}`);
});
