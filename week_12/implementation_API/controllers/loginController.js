const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

exports.showLogin = (req, res) => {
  res.render('auth/login');
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('auth/login', {
        error: 'Username dan password wajib diisi'
      });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).render('auth/login', {
        error: 'Username atau password salah'
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).render('auth/login', {
        error: 'Username atau password salah'
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.redirect('/');

  } catch (error) {
    console.error(error);
    res.status(500).render('auth/login', {
      error: 'Terjadi kesalahan pada server'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
