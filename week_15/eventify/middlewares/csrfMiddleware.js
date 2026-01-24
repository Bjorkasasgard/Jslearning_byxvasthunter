const csurf = require('csurf');

// use cookie-based CSRF tokens (no session required)
const csrfProtection = csurf({ cookie: true });

module.exports = (req, res, next) => {
  // skip CSRF for API routes (they use JWT)
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    return next();
  }

  // Run csurf but tolerate token creation errors to avoid hard 403s
  // (log and continue). This prevents situations where cookie parsing
  // or an invalid existing CSRF cookie would block rendering.
  return csrfProtection(req, res, (err) => {
    if (err) {
      // Log and continue without failing the request
      console.warn('[csrf] token creation/validation failed:', err && err.message ? err.message : err);
      res.locals.csrfToken = null;
      return next();
    }

    // expose token to views
    try {
      res.locals.csrfToken = req.csrfToken();
    } catch (e) {
      res.locals.csrfToken = null;
    }
    return next();
  });
};
