// admin management logic
const prisma = require("../prisma/client");
const bcrypt = require("bcrypt");

module.exports = {
  // ===== USERS =====
  listUsers: async (req, res) => {
    const role = req.query.role;
    const where = role ? { role } : undefined;
    const users = await prisma.user.findMany({ where });
    res.json(users);
  },

  getUser: async (req, res) => {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  },

  createUser: async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    res.status(201).json(user);
  },

  updateUser: async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, role, password } = req.body;
    const data = { name, email, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    res.json(user);
  },

  deleteUser: async (req, res) => {
    const id = Number(req.params.id);
    try {
      const createdVacancies = await prisma.jobVacancy.findMany({ where: { createdBy: id }, select: { id: true } });
      const vacancyIds = createdVacancies.map(v => v.id);

      await prisma.$transaction(async (tx) => {
        if (vacancyIds.length) {
          await tx.application.deleteMany({ where: { jobVacancyId: { in: vacancyIds } } });
          await tx.jobVacancy.deleteMany({ where: { id: { in: vacancyIds } } });
        }

        await tx.application.deleteMany({ where: { userId: id } });
        await tx.user.delete({ where: { id } });
      });

      res.json({ message: "User and related data deleted" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: 'Delete failed', error: err.message });
    }
  },

  // ===== VACANCIES =====
  listVacancies: async (req, res) => {
    const vacancies = await prisma.jobVacancy.findMany();
    res.json(vacancies);
  },

  createVacancy: async (req, res) => {
    const data = req.body;

    const vacancy = await prisma.jobVacancy.create({
      data: {
        ...data,
        createdBy: req.user.id,
      },
    });

    res.status(201).json(vacancy);
  },

  updateVacancy: async (req, res) => {
    const id = Number(req.params.id);

    const vacancy = await prisma.jobVacancy.update({
      where: { id },
      data: req.body,
    });

    res.json(vacancy);
  },

  deleteVacancy: async (req, res) => {
    const id = Number(req.params.id);
    await prisma.jobVacancy.delete({ where: { id } });
    res.json({ message: "Vacancy deleted" });
  },

  // ===== APPLICATIONS =====
  listApplications: async (req, res) => {
    const apps = await prisma.application.findMany({
      include: {
        user: true,
        jobVacancy: true,
      },
    });
    res.json(apps);
  },

  applicationsByVacancy: async (req, res) => {
    const id = Number(req.params.id);

    const apps = await prisma.application.findMany({
      where: { jobVacancyId: id },
      include: { user: true },
    });

    res.json(apps);
  },

  updateApplication: async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const app = await prisma.application.update({
      where: { id },
      data: { status },
    });

    res.json(app);
  },
};
