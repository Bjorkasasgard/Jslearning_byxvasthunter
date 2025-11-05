// /backend/src/middlewares/notFound.js

const notFound = (req, res, next) => {
  const error = new Error(`Tidak ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { notFound };