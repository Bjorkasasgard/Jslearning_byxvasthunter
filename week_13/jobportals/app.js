require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayouts = require("express-ejs-layouts");

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

/* ======================
   API ROUTES
====================== */
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

/* ======================
   HOME REDIRECT
====================== */
app.get("/", (req, res) => {
  res.redirect("/jobs");
});

/* ======================
   ERROR HANDLING
====================== */
// 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
