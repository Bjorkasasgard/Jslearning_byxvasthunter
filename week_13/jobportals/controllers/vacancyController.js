// job vacancy management logic

const prisma = require("../prisma/client");
const sanitizeHtml = require('sanitize-html');

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
    let answers = undefined;
    if (Array.isArray(req.body?.answers)) {
      answers = req.body.answers;
    } else if (typeof req.body?.answers === 'string' && req.body.answers.trim()) {
      // single answer fallback
      answers = [req.body.answers.trim()];
    }
    const coverLetterFile = req.files?.coverLetterFile?.[0];
    const resumeFile = req.files?.resumeFile?.[0];

    try {
      const vacancy = await prisma.jobVacancy.findUnique({ where: { id: jobVacancyId } });
      if (!vacancy) return res.status(404).json({ message: 'Vacancy not found' });
      if (vacancy.status === 'CLOSED') return res.status(400).json({ message: 'Cannot apply to a closed vacancy' });

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(401).json({ message: 'User not found' });

      // Cover letter: rich text (stored in `coverLetter`) + optional PDF (stored in `coverLetterFile`).
      const rawCoverLetter = typeof req.body?.coverLetter === 'string' ? req.body.coverLetter : '';
      const coverLetter = rawCoverLetter
        ? sanitizeHtml(rawCoverLetter, {
            allowedTags: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li'],
            allowedAttributes: {},
          })
        : null;

      const coverLetterFilePath = coverLetterFile
        ? `/uploads/application_letters/${coverLetterFile.filename}`
        : null;

      if (!coverLetter && !coverLetterFilePath) {
        return res.status(400).json({ message: 'Please write a cover letter or attach a cover letter PDF.' });
      }

      const resumePath = resumeFile
        ? `/uploads/resumes/${resumeFile.filename}`
        : user.resume;

      if (!resumePath) {
        return res.status(400).json({ message: 'Please upload your resume in your profile or attach it here.' });
      }

      const cleanAnswers = Array.isArray(answers)
        ? answers.map(a => (typeof a === 'string' ? a.trim() : '')).filter(Boolean)
        : undefined;

      const data = {
        userId: req.user.id,
        jobVacancyId,
        coverLetter,
        coverLetterFile: coverLetterFilePath,
        resumeLink: resumePath,
        answers: cleanAnswers,
      };

      const application = await prisma.application.create({ data });

      res.status(201).json({
        message: 'Application submitted',
        application,
      });
    } catch (err) {
      if (err?.code === 'P2002') {
        return res.status(400).json({ message: 'You already applied to this job' });
      }

      console.error('[vacancyController.apply] submit failed:', err);
      res.status(400).json({
        message: err?.message || 'Failed to submit application',
      });
    }
  },
};
    