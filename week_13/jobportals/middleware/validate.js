const { validationResult } = require('express-validator');

// Collects validation errors and returns a concise 400 response
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({ path: err.path, msg: err.msg })),
    });
  }
  return next();
};
