require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayouts = require("express-ejs-layouts");
let csurf;
try {
   csurf = require('csurf');
} catch (e) {
   console.warn('csurf not installed; CSRF protection disabled for tests. Run `npm install csurf` to enable it.');
   csurf = null;
}

var app = express();

/* ======================
   VIEW ENGINE
====================== */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");

/* ======================
   MIDDLEWARE
====================== */
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// attach current user to views when cookie/token present
const { attachCurrentUser } = require('./middleware/viewAuth');
app.use(attachCurrentUser);
// lightweight alert middleware to surface ?success= / ?error= messages in UI
app.use(require('./middleware/alerts'));
// UI context: mark admin pages so sidebar is shown only there
app.use(require('./middleware/uiContext'));

/* ======================
   API ROUTES
====================== */
// CSRF protection for API routes using cookie-based tokens (optional)
if (csurf) {
   app.use('/api', csurf({ cookie: true }));
   app.use('/api/csrf', require('./routes/api/csrf'));
} else {
   // fallback csrf endpoint for testing when csurf not installed
   app.get('/api/csrf', (req, res) => res.json({ csrfToken: '' }));
}

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/vacancies", require("./routes/api/vacancies"));
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/member", require("./routes/api/member"));

/* ======================
   PUBLIC VIEW ROUTES
====================== */
app.use("/auth", require("./routes/public/auth"));
app.use("/jobs", require("./routes/public/jobs"));
app.use("/admin", require("./routes/public/admin"));
app.use("/profile", require("./routes/public/profile"));
app.use("/applications", require("./routes/public/applications"));

/* ======================
   HOME REDIRECT
====================== */
app.get("/", (req, res) => {
  res.redirect("/jobs");
});

/* ======================
   ERROR HANDLING
====================== */
// 404 and global error handling
const { notFound, errorHandler } = require('./middleware/error');
app.use(notFound);
app.use(errorHandler);

module.exports = app;
