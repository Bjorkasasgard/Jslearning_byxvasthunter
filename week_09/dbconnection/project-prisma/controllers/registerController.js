const prisma = require('../models/prismaClient.js');

exports.showForm = (req, res) => {
    res.render("register", { title: "Register" });
};

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    await prisma.user.create({
        data: { name, email, password }
    });

    res.redirect('/users');
};
