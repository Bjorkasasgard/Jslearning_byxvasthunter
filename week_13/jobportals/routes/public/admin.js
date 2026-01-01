// admin dashboard routes (public)
const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");
const asyncHandler = require('../../middleware/asyncHandler');
const {
  authenticateView,
  requireAdminView,
} = require("../../middleware/viewAuth");

// redirect root /admin to dashboard
router.get('/', authenticateView, requireAdminView, (req, res) => {
  return res.redirect('/admin/dashboard');
});

// dashboard at /admin/dashboard
router.get(
  "/dashboard",
  authenticateView,
  requireAdminView,
  asyncHandler(async (req, res) => {
    const usersCount = await prisma.user.count();
    const jobsCount = await prisma.jobVacancy.count();
    const appsCount = await prisma.application.count();

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        usersCount,
        jobsCount,
        appsCount,
      },
    });
  })
);

// USERS PAGE
router.get(
  "/users",
  authenticateView,
  requireAdminView,
  asyncHandler(async (req, res) => {
    const role = req.query.role;
    const where = role ? { role } : undefined;
    const users = await prisma.user.findMany({ where });
    res.render("admin/users", {
      title: "Manage Users",
      users,
      filterRole: role || ''
    });
  })
);

// VACANCIES PAGE
router.get(
  "/vacancies",
  authenticateView,
  requireAdminView,
  asyncHandler(async (req, res) => {
    const status = req.query.status;
    const where = status ? { status } : undefined;
    const vacancies = await prisma.jobVacancy.findMany({ where });
    res.render("admin/vacancies", {
      title: "Manage Vacancies",
      vacancies,
      filterStatus: status || ''
    });
  })
);

// APPLICATIONS PAGE
router.get(
  "/applications",
  authenticateView,
  requireAdminView,
  asyncHandler(async (req, res) => {
    const applications = await prisma.application.findMany({
      include: { user: true, jobVacancy: true },
    });

    res.render("admin/applications", {
      title: "Applications",
      applications,
    });
  })
);

// USER FORM
router.get(
  "/users/create",
  authenticateView,
  requireAdminView,
  (req, res) => {
    res.render("admin/userForm", {
      title: "Create User",
      user: null,
    });
  }
);

router.get(
  "/users/:id/edit",
  authenticateView,
  requireAdminView,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    });

    res.render("admin/userForm", {
      title: "Edit User",
      user,
    });
  })
);

// VACANCY FORM
router.get(
  "/vacancies/create",
  authenticateView,
  requireAdminView,
  (req, res) => {
    res.render("admin/vacancyForm", {
      title: "Create Vacancy",
      vacancy: null,
    });
  }
);

router.get(
  "/vacancies/:id/edit",
  authenticateView,
  requireAdminView,
  asyncHandler(async (req, res) => {
    const vacancy = await prisma.jobVacancy.findUnique({
      where: { id: Number(req.params.id) },
    });

    res.render("admin/vacancyForm", {
      title: "Edit Vacancy",
      vacancy,
    });
  })
);

module.exports = router;
