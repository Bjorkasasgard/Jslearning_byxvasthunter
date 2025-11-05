// /backend/src/api/routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
} = require('../controllers/user.controller');

// Rute ini akan menjadi /api/users
router.get('/', getAllUsers);

// Rute ini akan menjadi /api/users/:id
router.get('/:id', getUserById);

module.exports = router;