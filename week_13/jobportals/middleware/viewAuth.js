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
    // fetch user details for views (name, role)
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    res.locals.currentUser = user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
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
    res.locals.currentUser = user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
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
