// rest api endpoints for admin (api)
const express = require("express");
const router = express.Router();
const AdminController = require("../../controllers/adminController");
const {
  authenticateToken,
  requireAdmin,
} = require("../../middleware/auth");

router.use(authenticateToken, requireAdmin);

// USERS
router.get("/users", AdminController.listUsers);
router.get("/users/:id", AdminController.getUser);
router.post("/users", AdminController.createUser);
router.put("/users/:id", AdminController.updateUser);
router.delete("/users/:id", AdminController.deleteUser);

// VACANCIES
router.get("/vacancies", AdminController.listVacancies);
router.post("/vacancies", AdminController.createVacancy);
router.put("/vacancies/:id", AdminController.updateVacancy);
router.delete("/vacancies/:id", AdminController.deleteVacancy);

// APPLICATIONS
router.get("/applications", AdminController.listApplications);
router.get(
  "/vacancies/:id/applications",
  AdminController.applicationsByVacancy
);
router.put("/applications/:id", AdminController.updateApplication);

module.exports = router;
