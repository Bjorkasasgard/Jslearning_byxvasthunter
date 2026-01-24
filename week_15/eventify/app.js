require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayouts = require("express-ejs-layouts");
var helmet = require("helmet");
var rateLimit = require("express-rate-limit");

var app = express();

app.disable("x-powered-by");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/main");

// core middlewares
app.use(logger("dev"));
app.use(
  helmet({
    // enable a reasonable CSP; allow inline for styles/scripts to avoid breaking existing templates
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https://api.qrserver.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
      },
    },
  })
);

// Additional security headers (lightweight, safe)
app.use(require("./middlewares/securityHeaders"));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("./middlewares/viewLocals"));

// CSRF protection for web routes (API routes are JWT-protected and skipped)
app.use(require("./middlewares/csrfMiddleware"));
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================
// main router (public + api)
app.use("/", require("./routes"));

// ================= ERROR HANDLING =================
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "Route not found"));
});

// centralized error middleware (custom)
app.use(require("./middlewares/errorMiddleware"));

module.exports = app;
