var express = require('express');
var router = express.Router();
const memberController = require('../controllers/memberController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizeMiddleware');
const { canManagePost } = require('../middleware/postMiddleware');

/* Protected member routes - require authentication and USER role */
router.get('/', isAuthenticated, memberController.getMyPosts);
router.get('/dashboard', isAuthenticated, memberController.getMyPosts);

/* Post management routes - USER role can add/edit their posts */
router.get('/posts/new', isAuthenticated, authorizeRole('USER', 'ADMIN'), memberController.showCreatePostForm);
router.post('/posts', isAuthenticated, authorizeRole('USER', 'ADMIN'), memberController.createPost);
router.get('/posts/:id/edit', isAuthenticated, authorizeRole('USER', 'ADMIN'), canManagePost, memberController.showEditPostForm);
router.post('/posts/:id', isAuthenticated, authorizeRole('USER', 'ADMIN'), canManagePost, memberController.updatePost);
router.post('/posts/:id/delete', isAuthenticated, authorizeRole('USER', 'ADMIN'), canManagePost, memberController.deletePost);

module.exports = router;