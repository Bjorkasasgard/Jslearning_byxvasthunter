module.exports = (err, req, res, next) => {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const isApi = req.originalUrl && req.originalUrl.startsWith("/api");

  if (isApi) {
    return res.status(status).json({
      message: err.message || "Internal Server Error",
    });
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(status);
  return res.render("error");
};
