// login register routes (public)
const express = require("express");
const router = express.Router();

// LOGIN PAGE
router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login",
  });
});

// REGISTER PAGE
router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Register",
  });
});

module.exports = router;
