// rest enpoints for vacancies (api)
const express = require("express");
const router = express.Router();
const VacancyController = require("../../controllers/vacancyController");
const {
  authenticateToken,
  requireMember,
} = require("../../middleware/auth");

router.get("/public", VacancyController.publicList);

router.get("/", authenticateToken, VacancyController.list);
router.get("/:id", authenticateToken, VacancyController.detail);
router.post(
  "/:id/apply",
  authenticateToken,
  requireMember,
  VacancyController.apply
);

module.exports = router;
