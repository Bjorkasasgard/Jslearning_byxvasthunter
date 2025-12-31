// member operation logic
const prisma = require("../prisma/client");

module.exports = {
  myApplications: async (req, res) => {
    const apps = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: { jobVacancy: true },
    });

    res.json(apps);
  },

  applicationDetail: async (req, res) => {
    const id = Number(req.params.id);

    const app = await prisma.application.findFirst({
      where: { id, userId: req.user.id },
      include: { jobVacancy: true },
    });

    if (!app) return res.status(404).json({ message: "Not found" });

    res.json(app);
  },
};
