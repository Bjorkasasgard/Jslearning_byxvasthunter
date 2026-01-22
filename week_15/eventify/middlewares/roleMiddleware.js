module.exports = (role) => (req, res, next) => {
  const isApi = req.originalUrl && req.originalUrl.startsWith("/api");

  if (req.user.role !== role) {
    if (isApi) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return res.status(403).send("Forbidden");
  }
  next();
};
