const prisma = require("../prisma/client");

const normalizeRole = (role) => String(role || "").toUpperCase();
const isValidRole = (role) => ["ADMIN", "USER"].includes(role);

exports.listUsers = async (req, res, next) => {
  try {
    const role = req.query.role ? normalizeRole(req.query.role) : null;
    const where = role ? { role } : undefined;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const role = normalizeRole(req.body.role);

    if (!id || !isValidRole(role)) {
      const err = new Error("Role tidak valid");
      err.status = 400;
      throw err;
    }

    if (id === req.user.id && role !== "ADMIN") {
      const err = new Error("Tidak dapat menurunkan role sendiri");
      err.status = 400;
      throw err;
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!target) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    if (target.role === "ADMIN" && role === "USER") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        const err = new Error("Tidak dapat menurunkan admin terakhir");
        err.status = 400;
        throw err;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
