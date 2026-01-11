module.exports = function uiContext(req, res, next) {
  res.locals.isAdminPage = req.path.startsWith('/admin');
  next();
};