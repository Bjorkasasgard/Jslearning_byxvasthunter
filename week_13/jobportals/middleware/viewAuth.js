const jwt = require("jsonwebtoken");

// authenticate for view (EJS)
const authenticateView = (req, res, next) => {
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
    res.locals.currentUser = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (err) {
    res.locals.currentUser = null;
    return res.redirect("/auth/login");
  }
};

const requireAdminView = (req, res, next) => {
  if (res.locals.currentUser.role !== "ADMIN") {
    return res.redirect("/");
  }
  next();
};

module.exports = { authenticateView, requireAdminView };
