const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");

module.exports = (req, res, next) => {
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
    req.user = jwt.verify(token, jwtConfig.secret);
    return next();
  } catch (err) {
    if (isApi) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.redirect("/login");
  }
};
