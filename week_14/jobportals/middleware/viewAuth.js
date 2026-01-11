const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

// authenticate for view (EJS)
const authenticateView = async (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const token =
    tokenFromCookie ||
    (authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null);

  if (!token) {
    res.locals.currentUser = null;
    return res.redirect("/auth/login");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // fetch user details for views (include profile fields)
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    res.locals.currentUser = user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city || null,
          phone: user.phone || null,
          resume: user.resume || null,
        }
      : null;
    // also set req.user for route handlers convenience
    if (res.locals.currentUser) req.user = { id: res.locals.currentUser.id, role: res.locals.currentUser.role };
    // attach notifications for views: applications with feedback (status != 'PENDING')
    if (res.locals.currentUser) {
      try {
        const apps = await prisma.application.findMany({
          where: { userId: res.locals.currentUser.id, status: { not: 'PENDING' }, notificationRead: false },
          include: { jobVacancy: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });
        res.locals.notifications = apps.map(a => ({
          id: a.id,
          jobTitle: a.jobVacancy?.title || 'Application',
          status: a.status,
          updatedAt: a.updatedAt,
          read: !!a.notificationRead,
        }));
      } catch (e) {
        res.locals.notifications = [];
      }
    } else {
      res.locals.notifications = [];
    }
    next();
  } catch (err) {
    res.locals.currentUser = null;
    return res.redirect("/auth/login");
  }
};

// attach current user to res.locals if token exists (no redirect)
const attachCurrentUser = async (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const token =
    tokenFromCookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) {
    res.locals.currentUser = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    res.locals.currentUser = user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city || null,
          phone: user.phone || null,
          resume: user.resume || null,
        }
      : null;
    if (res.locals.currentUser) req.user = { id: res.locals.currentUser.id, role: res.locals.currentUser.role };
    // attach notifications for views when available (no redirect)
    if (res.locals.currentUser) {
      try {
        const apps = await prisma.application.findMany({
          where: { userId: res.locals.currentUser.id, status: { not: 'PENDING' }, notificationRead: false },
          include: { jobVacancy: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });
        res.locals.notifications = apps.map(a => ({
          id: a.id,
          jobTitle: a.jobVacancy?.title || 'Application',
          status: a.status,
          updatedAt: a.updatedAt,
          read: !!a.notificationRead,
        }));
      } catch (e) {
        res.locals.notifications = [];
      }
    } else {
      res.locals.notifications = [];
    }
    next();
  } catch (err) {
    res.locals.currentUser = null;
    next();
  }
};

const requireAdminView = (req, res, next) => {
  if (res.locals.currentUser.role !== "ADMIN") {
    return res.redirect("/");
  }
  next();
};

module.exports = { authenticateView, requireAdminView, attachCurrentUser };
