const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
 
    return res.status(401).json({ message: 'Akses ditolak. Token tidak tersedia.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid.' });
    }
    req.user = user;
    next(); 
  });
}


function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin yang cukup.' });
    }
    next(); 
  };
}

module.exports = { authenticateToken, authorizeRole };
