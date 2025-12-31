const prisma = require('../prisma/client');

const getAllUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
}

const createUser = async (user) => {
    const newUser = await prisma.user.create({ data: user });
    return newUser;
}

const getUserById = async (id) => {
    // `id` in schema is a String (UUID). Use string form to query.
    const user = await prisma.user.findUnique({ where: { id: String(id) } });
    return user;
}

const updateUser = async (id, userData) => {
    const updatedUser = await prisma.user.update({
        where: { id: String(id) },
        data: userData
    });
    return updatedUser;
}

const deleteUser = async (id) => {
    await prisma.user.delete({ where: { id: String(id) } });
}

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser
}