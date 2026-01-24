const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const prisma = require("../prisma/client");

module.exports = async (req, res, next) => {
  const token =
    req.cookies[jwtConfig.cookieName] ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[1]);

  const isApi = req.originalUrl && req.originalUrl.startsWith("/api");

  if (!token) {
    if (isApi) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.redirect("/login");
  }

  try {
    const payload = jwt.verify(token, jwtConfig.secret);

    if (!payload || !payload.id) {
      if (isApi) {
        return res.status(401).json({ message: "Invalid token" });
      }
      return res.redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      if (isApi) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res.redirect("/login");
    }

    req.user = { ...payload, ...user };
    return next();
  } catch (err) {
    if (isApi) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.redirect("/login");
  }
};
