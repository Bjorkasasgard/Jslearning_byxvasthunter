const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const asyncHandler = require('../../middleware/asyncHandler');
const { authenticateView } = require('../../middleware/viewAuth');

// Profile page (shows user info and their applications)
router.get('/', authenticateView, asyncHandler(async (req, res) => {
  const current = res.locals.currentUser;
  if (!current) return res.redirect('/auth/login');

  const applications = await prisma.application.findMany({
    where: { userId: current.id },
    include: { jobVacancy: true },
    orderBy: { createdAt: 'desc' },
  });

  res.render('profile', {
    title: 'My Profile',
    current,
    applications,
  });
}));

module.exports = router;
