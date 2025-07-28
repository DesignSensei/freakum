const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const csurf = require("csurf");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

connectDB();

// Initialize app
const app = express();
const PORT = process.env.PORT || 2000;

// App Level Middleware
// Body-parers, static, view engine
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

// Setting up Flash Messages
app.use(flash());

// CSURF Middleware
app.use(csurf({ cookie: false }));
app.use((req, res, next) => {
  // req.csrfToken() gives you a fresh token per request
  res.locals.csrfToken = req.csrfToken();
  // All views can see flash.error and flash.success
  res.locals.flash = req.flash();
  next();
});

// Layouts
app.use(expressLayouts);
app.set("layout", "layouts/shop-layout");

// Initialize Passport to use sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(authRoutes);

// // Handle any unmatched route
// app.use((req, res) => {
//   res.status(404).render("not-found");
// });

// Catch CSRF errors
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Session expired or form tampered with. Please retry");
    return res.redirect("back");
  }
  next(err);
});

// // Catch any thrown errors and render an error page
// app.use((err, req, res, next) => {
//   logger.error(err.stack);
//   res.status(err.status || 500).render("error", { message: err.message });
// });

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
