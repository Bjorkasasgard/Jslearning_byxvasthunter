module.exports = (req, res, next) => {
  // Add some additional safe security headers (single export)
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'geolocation=()');
  } catch (e) {
    // ignore
  }
  return next();
};
