// /backend/src/api/controllers/user.controller.js
const userService = require('../../services/json.service.js');

// GET /api/users
async function getAllUsers(req, res, next) {
  try {
    const users = await userService.readUsersData();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

// GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(44).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
};