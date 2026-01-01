// job listing routes (public)
const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");
const asyncHandler = require('../../middleware/asyncHandler');
const createError = require('http-errors');
const { authenticateView } = require("../../middleware/viewAuth");

// JOB LIST (PUBLIC)
router.get("/", asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status; // show all by default, optional filter via ?status=ACTIVE|CLOSED
  const skip = (page - 1) * limit;

  const where = status ? { status } : undefined;
  const [jobs, total] = await Promise.all([
    prisma.jobVacancy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.jobVacancy.count({ where }),
  ]);

  // debug: log job ids to help trace missing id issues
  try {
    console.debug('Rendering jobs list, count=', jobs.length, 'ids=', jobs.map(j => j.id));
  } catch (e) {
    console.debug('Rendering jobs list, unable to map ids', e);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.render("jobs/list", {
    title: "Job Vacancies",
    jobs,
    currentPage: page,
    totalPages,
    limit,
    status: status || ''
  });
}));

// JOB DETAIL (AUTH REQUIRED)
router.get("/:id", asyncHandler(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    console.warn('Invalid job id requested:', req.params.id);
    return res.redirect('/jobs?error=Invalid%20job%20id');
  }

  // fetch job
  const job = await prisma.jobVacancy.findUnique({ where: { id } });

  if (!job) {
    console.warn(`Job not found for id=${id}`);
    return res.redirect('/jobs?error=Job%20not%20found');
  }

  res.render("jobs/detail", {
    title: job.title,
    job,
  });
}));

module.exports = router;
