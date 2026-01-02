const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

// Verify JWT from Authorization header (Bearer TOKEN)
const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers['authorization'] || '';
		let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
		// fallback to cookie token (httpOnly cookie)
		if (!token && req.cookies && req.cookies.token) token = req.cookies.token;
		if (!token) return res.status(401).json({ message: 'No token provided' });

		const payload = jwt.verify(token, process.env.JWT_SECRET);
		const role = (payload.role || '').toUpperCase();
		req.user = { id: payload.id, role };
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

const requireAdmin = (req, res, next) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	const role = (req.user.role || '').toUpperCase();
	if (role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden: admin only' });
	next();
};

const requireMember = (req, res, next) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	const role = (req.user.role || '').toUpperCase();
	if (role !== 'MEMBER' && role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden: members only' });
	next();
};

module.exports = { authenticateToken, requireAdmin, requireMember };