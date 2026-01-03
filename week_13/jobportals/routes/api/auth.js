// rest auth endpoints (api)
const express = require("express");
const router = express.Router();
const AuthController = require("../../controllers/authController");
const { body } = require("express-validator");
const validate = require("../../middleware/validate");

router.post(
	"/register",
	[
		body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),
		body("email").normalizeEmail().isEmail().withMessage("Valid email is required"),
		body("password").isLength({ min: 8, max: 100 }).withMessage("Password must be 8-100 characters"),
	],
	validate,
	AuthController.register
);

router.post(
	"/login",
	[
		body("email").normalizeEmail().isEmail().withMessage("Valid email is required"),
		body("password").isLength({ min: 1 }).withMessage("Password is required"),
	],
	validate,
	AuthController.login
);
router.post("/logout", AuthController.logout);

module.exports = router;
