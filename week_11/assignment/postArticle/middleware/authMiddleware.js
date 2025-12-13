/**
 * Authentication Middleware
 * Checks if user is authenticated (logged in)
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated, attach user info to request
    req.user = req.session.user;
    return next();
  }
  
  // User is not authenticated, redirect to login
  res.redirect('/login');
};

/**
 * Optional: Check if user is NOT authenticated (for login/register pages)
 */
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is already logged in, redirect to home
    return res.redirect('/dashboard');
  }
  next();
};

/**
 * Helper: Set user to request if session exists (for public pages)
 * This allows views to know if a user is logged in without forcing authentication
 */
const setUser = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
  setUser
};