const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const { attachCurrentUser } = require('../../middleware/viewAuth');
const asyncHandler = require('../../middleware/asyncHandler');

// Member applications dashboard
router.get('/', attachCurrentUser, asyncHandler(async (req, res) => {
  const current = res.locals.currentUser;
  let applications = [];
  if (current) {
    applications = await prisma.application.findMany({
      where: { userId: current.id },
      include: { jobVacancy: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  res.render('profile', {
    title: 'My Applications',
    current,
    applications,
  });
}));

module.exports = router;