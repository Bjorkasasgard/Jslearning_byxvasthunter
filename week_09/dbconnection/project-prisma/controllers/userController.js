const prisma = require('../models/prismaClient.js');

exports.getAllUsers = async (req, res) => {
    const users = await prisma.user.findMany();
    res.render("users", { title: "Users", users });
};
