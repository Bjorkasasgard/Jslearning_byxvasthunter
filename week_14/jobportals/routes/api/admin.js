// rest api endpoints for admin (api)
const express = require("express");
const router = express.Router();
const AdminController = require("../../controllers/adminController");
const {
  authenticateToken,
  requireAdmin,
} = require("../../middleware/auth");
const { body, param, query } = require("express-validator");
const validate = require("../../middleware/validate");

router.use(authenticateToken, requireAdmin);

// USERS
router.get(
  "/users",
  [query("role").optional().isIn(["ADMIN", "MEMBER"]).withMessage("role must be ADMIN or MEMBER")],
  validate,
  AdminController.listUsers
);
router.get(
  "/users/:id",
  [param("id").isInt().withMessage("id must be a number")],
  validate,
  AdminController.getUser
);
router.post(
  "/users",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
    body("email").normalizeEmail().isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8, max: 100 }).withMessage("Password must be 8-100 characters"),
    body("role").isIn(["ADMIN", "MEMBER"]).withMessage("Role must be ADMIN or MEMBER"),
  ],
  validate,
  AdminController.createUser
);
router.put(
  "/users/:id",
  [
    param("id").isInt().withMessage("id must be a number"),
    body("name").optional().trim().isLength({ min: 1, max: 100 }),
    body("email").optional().normalizeEmail().isEmail(),
    body("role").optional().isIn(["ADMIN", "MEMBER"]).withMessage("Role must be ADMIN or MEMBER"),
    body("password").optional().isLength({ min: 8, max: 100 }),
    body().custom((value) => {
      const allowed = ["name", "email", "role", "password"];
      return allowed.some((field) => value[field] !== undefined && value[field] !== "");
    }).withMessage("Provide at least one field to update"),
  ],
  validate,
  AdminController.updateUser
);
router.delete(
  "/users/:id",
  [param("id").isInt().withMessage("id must be a number")],
  validate,
  AdminController.deleteUser
);

// VACANCIES
router.get("/vacancies", AdminController.listVacancies);
router.post(
  "/vacancies",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("company").trim().notEmpty().withMessage("Company is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("requirements").trim().notEmpty().withMessage("Requirements are required"),
    body("salary").optional().isString().isLength({ max: 200 }),
    body("jobType").optional().isIn(["FULLTIME", "PARTTIME", "REMOTE", "HYBRID", "CONTRACT"]).withMessage("Invalid job type"),
    body("status").optional().isIn(["ACTIVE", "CLOSED"]).withMessage("Status must be ACTIVE or CLOSED"),
    body("questions").optional().isArray().withMessage("questions must be an array"),
    body("questions.*").optional().isString().isLength({ max: 500 }),
  ],
  validate,
  AdminController.createVacancy
);
router.put(
  "/vacancies/:id",
  [
    param("id").isInt().withMessage("id must be a number"),
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("company").optional().trim().isLength({ min: 1, max: 200 }),
    body("location").optional().trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ min: 1 }),
    body("requirements").optional().trim().isLength({ min: 1 }),
    body("salary").optional().isString().isLength({ max: 200 }),
    body("jobType").optional().isIn(["FULLTIME", "PARTTIME", "REMOTE", "HYBRID", "CONTRACT"]).withMessage("Invalid job type"),
    body("status").optional().isIn(["ACTIVE", "CLOSED"]).withMessage("Status must be ACTIVE or CLOSED"),
    body("questions").optional().isArray().withMessage("questions must be an array"),
    body("questions.*").optional().isString().isLength({ max: 500 }),
    body().custom((value) => {
      const allowed = ["title", "company", "location", "description", "requirements", "salary", "jobType", "questions", "status"];
      return allowed.some((field) => value[field] !== undefined);
    }).withMessage("Provide at least one field to update"),
  ],
  validate,
  AdminController.updateVacancy
);
router.delete(
  "/vacancies/:id",
  [param("id").isInt().withMessage("id must be a number")],
  validate,
  AdminController.deleteVacancy
);

// APPLICATIONS
router.get("/applications", AdminController.listApplications);
router.get(
  "/vacancies/:id/applications",
  [param("id").isInt().withMessage("id must be a number")],
  validate,
  AdminController.applicationsByVacancy
);
router.put(
  "/applications/:id",
  [
    param("id").isInt().withMessage("id must be a number"),
    body("status").isIn(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]).withMessage("Invalid status"),
  ],
  validate,
  AdminController.updateApplication
);

module.exports = router;
