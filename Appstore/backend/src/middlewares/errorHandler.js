// /backend/src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // Kadang error datang tanpa status, kita set default 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Tampilkan stack trace hanya jika sedang mode 'development'
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = { errorHandler };