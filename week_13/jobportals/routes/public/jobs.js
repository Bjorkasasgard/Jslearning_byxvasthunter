// job listing routes (public)
const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");
const { authenticateView } = require("../../middleware/viewAuth");

// JOB LIST (PUBLIC)
router.get("/", async (req, res) => {
  const jobs = await prisma.jobVacancy.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  res.render("jobs/list", {
    title: "Job Vacancies",
    jobs,
  });
});

// JOB DETAIL (AUTH REQUIRED)
router.get("/:id", authenticateView, async (req, res) => {
  const id = Number(req.params.id);

  const job = await prisma.jobVacancy.findUnique({
    where: { id },
  });

  if (!job) {
    return res.status(404).render("errors/404");
  }

  res.render("jobs/detail", {
    title: job.title,
    job,
  });
});

module.exports = router;
