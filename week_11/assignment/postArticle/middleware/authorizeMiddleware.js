/**
 * Authorization Middleware
 * Checks if user has required role/permission
 */

/**
 * Check if user has ADMIN role
 */
const isAdmin = (req, res, next) => {
  const userRole = req.user?.role || req.session?.userRole;
  if (userRole === 'ADMIN') {
    return next();
  }
  
  // User doesn't have admin role
  res.status(403).render('error', {
    message: 'Access Denied',
    error: { status: 403, message: 'You do not have permission to access this resource.' },
    title: 'Access Denied'
  });
};/**
 * Check if user has specific role
 * Usage: authorizeRole('ADMIN') or authorizeRole(['ADMIN', 'MODERATOR'])
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Flatten array in case nested arrays are passed
    const roles = allowedRoles.flat();
    
    // Check both req.user.role (from setUser middleware) and req.session.userRole
    const userRole = req.user?.role || req.session?.userRole;
    
    if (userRole && roles.includes(userRole)) {
      return next();
    }
    
    // User doesn't have required role
    res.status(403).render('error', {
      message: 'Access Denied',
      error: { status: 403, message: 'You do not have permission to access this resource.' },
      title: 'Access Denied'
    });
  };
};

module.exports = {
  isAdmin,
  authorizeRole
};