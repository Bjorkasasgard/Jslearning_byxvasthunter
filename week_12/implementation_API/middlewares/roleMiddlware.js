exports.isAdmin = (req, res, next) => {
  if (req.session.user.role !== 'ADMIN') {
    return res.status(403).render('error', {
      message: 'Access only for admin'
    });
  }
  next();
};
