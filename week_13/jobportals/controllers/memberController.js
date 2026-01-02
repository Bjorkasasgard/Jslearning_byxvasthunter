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

  markNotificationRead: async (req, res) => {
    const id = Number(req.params.id);
    try {
      const app = await prisma.application.findFirst({ where: { id, userId: req.user.id } });
      if (!app) return res.status(404).json({ message: 'Not found' });
      await prisma.application.update({ where: { id }, data: { notificationRead: true } });
      res.json({ message: 'Marked read' });
    } catch (err) {
      return res.status(404).json({ message: 'Not found' });
    }
  },

  // update own profile
  updateProfile: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const userId = req.user.id;
      const { name, email, password, phone } = req.body;
      const data = {};
      if (name) data.name = name;
      if (req.body.city) data.city = req.body.city;
      if (typeof phone !== 'undefined') data.phone = phone;
      if (email) data.email = email;
      if (password) data.password = await bcrypt.hash(password, 10);

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
      });

      res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role, city: updated.city, phone: updated.phone });
    } catch (err) {
      console.error('[memberController.updateProfile] error:', err);
      const msg = err?.message || 'Update failed';
      // expose Prisma unique constraint error details for easier debugging in development
      if (msg.includes('Unique constraint') || msg.includes('Unique')) {
        return res.status(400).json({ message: msg });
      }
      res.status(500).json({ message: msg });
    }
  }

  ,

  // upload resume file
  uploadResume: async (req, res) => {
    try {
      const userId = req.user.id;
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const resumePath = `/uploads/resumes/${req.file.filename}`;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { resume: resumePath },
      });

      res.json({ message: 'Resume uploaded', resume: resumePath });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
    }
  }
};
