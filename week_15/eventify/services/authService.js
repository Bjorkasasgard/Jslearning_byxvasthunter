const prisma = require("../prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");

exports.register = async (data) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: "USER",
    },
  });
};

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return { user, token };
};
