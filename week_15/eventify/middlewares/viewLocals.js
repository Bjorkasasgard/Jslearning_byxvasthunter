const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const prisma = require("../prisma/client");

module.exports = async (req, res, next) => {
  const token = req.cookies && req.cookies[jwtConfig.cookieName];

  res.locals.user = null;
  res.locals.isAuthenticated = false;
  res.locals.isAdmin = false;
  res.locals.searchQuery = (req.query && typeof req.query.q === "string" ? req.query.q : "").trim();

  if (!token) return next();

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    let userPayload = payload;

    if ((!payload.name && !payload.email) && payload.id) {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, name: true, email: true, role: true },
      });
      if (user) {
        userPayload = { ...payload, ...user };
      }
    }

    res.locals.user = userPayload;
    res.locals.isAuthenticated = true;
    res.locals.isAdmin = userPayload.role === "ADMIN";
  } catch {
    // ignore invalid token for UI; authMiddleware handles protected routes
  }

  return next();
};
