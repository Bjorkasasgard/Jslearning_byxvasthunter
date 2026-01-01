// member operation logic
const prisma = require("../prisma/client");
const bcrypt = require('bcrypt');

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

  // update own profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email, password } = req.body;
      const data = {};
      if (name) data.name = name;
      if (email) data.email = email;
      if (password) data.password = await bcrypt.hash(password, 10);

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
      });

      res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: 'Update failed' });
    }
  }
};
