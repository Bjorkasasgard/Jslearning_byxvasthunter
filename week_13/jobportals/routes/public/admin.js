// admin dashboard routes (public)
const express = require("express");
const router = express.Router();
const prisma = require("../../prisma/client");
const {
  authenticateView,
  requireAdminView,
} = require("../../middleware/viewAuth");

/**
 * DASHBOARD
// redirect root /admin to dashboard
router.get('/', authenticateView, requireAdminView, (req, res) => {
  return res.redirect('/admin/dashboard');
});

 * URL: /admin
 */
router.get(
  "/",
  authenticateView,
  requireAdminView,
  async (req, res) => {
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
  }
);

// USERS PAGE
router.get(
  "/users",
  authenticateView,
  requireAdminView,
  async (req, res) => {
    const users = await prisma.user.findMany();
    res.render("admin/users", {
      title: "Manage Users",
      users,
    });
  }
);

// VACANCIES PAGE
router.get(
  "/vacancies",
  authenticateView,
  requireAdminView,
  async (req, res) => {
    const vacancies = await prisma.jobVacancy.findMany();
    res.render("admin/vacancies", {
      title: "Manage Vacancies",
      vacancies,
    });
  }
);

// APPLICATIONS PAGE
router.get(
  "/applications",
  authenticateView,
  requireAdminView,
  async (req, res) => {
    const applications = await prisma.application.findMany({
      include: { user: true, jobVacancy: true },
    });

    res.render("admin/applications", {
      title: "Applications",
      applications,
    });
  }
);

// USER FORM
router.get(
  "/users/create",
  authenticateView,
  requireAdminView,
  (req, res) => {
    res.render("admin/user-form", {
      title: "Create User",
      user: null,
    });
  }
);

router.get(
  "/users/:id/edit",
  authenticateView,
  requireAdminView,
  async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
    });

    res.render("admin/user-form", {
      title: "Edit User",
      user,
    });
  }
);

// VACANCY FORM
router.get(
  "/vacancies/create",
  authenticateView,
  requireAdminView,
  (req, res) => {
    res.render("admin/vacancy-form", {
      title: "Create Vacancy",
      vacancy: null,
    });
  }
);

router.get(
  "/vacancies/:id/edit",
  authenticateView,
  requireAdminView,
  async (req, res) => {
    const vacancy = await prisma.jobVacancy.findUnique({
      where: { id: Number(req.params.id) },
    });

    res.render("admin/vacancy-form", {
      title: "Edit Vacancy",
      vacancy,
    });
  }
);

module.exports = router;
