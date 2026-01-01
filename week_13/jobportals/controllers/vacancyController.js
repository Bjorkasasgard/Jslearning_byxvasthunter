// job vacancy management logic

const prisma = require("../prisma/client");

module.exports = {
  // PUBLIC JOB LIST
  publicList: async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const where = status ? { status } : undefined;

    const vacancies = await prisma.jobVacancy.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    res.json(vacancies);
  },

  // AUTH JOB LIST
  list: async (req, res) => {
    const vacancies = await prisma.jobVacancy.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(vacancies);
  },

  // DETAIL
  detail: async (req, res) => {
    const id = Number(req.params.id);

    const vacancy = await prisma.jobVacancy.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, email: true } },
      },
    });

    if (!vacancy) {
      return res.status(404).json({ message: "Vacancy not found" });
    }

    res.json(vacancy);
  },

  // APPLY JOB (MEMBER)
  apply: async (req, res) => {
    const jobVacancyId = Number(req.params.id);
    const { coverLetter } = req.body;

    try {
      const application = await prisma.application.create({
        data: {
          userId: req.user.id,
          jobVacancyId,
          coverLetter,
        },
      });

      res.status(201).json({
        message: "Application submitted",
        application,
      });
    } catch (err) {
      res.status(400).json({
        message: "You already applied to this job",
      });
    }
  },
};
    