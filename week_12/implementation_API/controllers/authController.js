const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

exports.showRegister = (req, res) => {
  res.render('auth/register');
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Data validation
    if (!username || !password) {
      return res.status(400).render('auth/register', {
        error: 'Username dan password wajib diisi'
      });
    }

    if (password.length < 6) {
      return res.status(400).render('auth/register', {
        error: 'Password minimal 6 karakter'
      });
    }

    const exists = await prisma.user.findUnique({
      where: { username }
    });

    if (exists) {
      return res.status(409).render('auth/register', {
        error: 'Username sudah terdaftar'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashed,
        role: 'USER'
      }
    });

    res.redirect('/login');

  } catch (error) {
    // Error handling
    console.error(error);
    res.status(500).render('auth/register', {
      error: 'Terjadi kesalahan pada server'
    });
  }
};
