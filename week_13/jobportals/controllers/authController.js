// authentication logic

const prisma = require("../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};

const parseExpiresInToMs = (expiresIn) => {
  if (!expiresIn) return 24 * 60 * 60 * 1000;
  if (typeof expiresIn === 'number') return expiresIn * 1000;
  if (expiresIn.endsWith('ms')) return parseInt(expiresIn);
  if (expiresIn.endsWith('s')) return parseInt(expiresIn) * 1000;
  if (expiresIn.endsWith('m')) return parseInt(expiresIn) * 60 * 1000;
  if (expiresIn.endsWith('h')) return parseInt(expiresIn) * 60 * 60 * 1000;
  if (expiresIn.endsWith('d')) return parseInt(expiresIn) * 24 * 60 * 60 * 1000;
  const n = parseInt(expiresIn);
  if (!isNaN(n)) return n * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
};

module.exports = {
  // REGISTER
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MEMBER",
        },
      });

      const token = generateToken(user);
      const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Register failed" });
    }
  },

  // LOGIN
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  },

  // LOGOUT (client-side mostly)
  logout: async (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logout successful' });
  },
};
