// Wrap async route handlers to forward errors to Express
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};