const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController');
const authController = require('../controllers/authController');

// LOGIN
router.get('/login', loginController.showLogin);
router.post('/login', loginController.login);
router.get('/logout', loginController.logout);

// REGISTER
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

module.exports = router;
