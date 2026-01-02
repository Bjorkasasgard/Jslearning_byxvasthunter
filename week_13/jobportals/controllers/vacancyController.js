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
    const { coverLetter, answers, resumeLink } = req.body;

    try {
      // ensure vacancy exists and is open
      const vacancy = await prisma.jobVacancy.findUnique({ where: { id: jobVacancyId } });
      if (!vacancy) return res.status(404).json({ message: 'Vacancy not found' });
      if (vacancy.status === 'CLOSED') return res.status(400).json({ message: 'Cannot apply to a closed vacancy' });

      const baseData = {
        userId: req.user.id,
        jobVacancyId,
        coverLetter,
        answers: answers && Array.isArray(answers) ? answers : undefined,
      };

      // attach resumeLink only when provided
      if (resumeLink) baseData.resumeLink = resumeLink;

      let application;
      try {
        application = await prisma.application.create({ data: baseData });
      } catch (err) {
        // If schema is not migrated (no resumeLink column), retry without it
        const msg = err?.message || '';
        const missingResumeCol = msg.includes('resumeLink') || msg.includes('ResumeLink') || msg.includes('no such column') || msg.includes('Unknown arg `resumeLink`');
        if (missingResumeCol && baseData.resumeLink) {
          const { resumeLink: _, ...fallbackData } = baseData;
          application = await prisma.application.create({ data: fallbackData });
          console.warn('[vacancyController.apply] resumeLink column missing; application saved without resumeLink. Run prisma migrate.');
        } else {
          throw err;
        }
      }

      res.status(201).json({
        message: "Application submitted",
        application,
      });
    } catch (err) {
      // Unique constraint duplicate apply
      if (err?.code === 'P2002') {
        return res.status(400).json({ message: "You already applied to this job" });
      }

      console.error('[vacancyController.apply] submit failed:', err);
      res.status(400).json({
        message: err?.message || "Failed to submit application",
      });
    }
  },
};
    