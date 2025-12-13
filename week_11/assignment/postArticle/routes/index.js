var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/authMiddleware');

/* Public routes - latest posts and single article view */
router.get('/', postController.getAllPosts);
router.get('/posts/:id', postController.getPostById);

/* Public routes - login and register */
router.get('/login', isNotAuthenticated, userController.loginForm);
router.post('/login', isNotAuthenticated, userController.login);
router.get('/register', isNotAuthenticated, userController.formUser);
router.post('/submit', isNotAuthenticated, userController.submitUser);

/* Logout route */
router.post('/logout', userController.logout);
router.get('/logout', userController.logout);

module.exports = router;