var express = require('express');
var router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { canManagePost } = require('../middleware/postMiddleware');
const postService = require('../services/postService');
const postController = require('../controllers/postController');

// Semua route di sini otomatis diawali dengan /dashboard
// Dan diproteksi oleh middleware isAuthenticated
router.use(isAuthenticated);

/* GET Dashboard page. */
router.get('/', async function(req, res, next) {
  let posts;
  
  // Jika ADMIN, tampilkan semua post. Jika Member, hanya post miliknya.
  if (req.session.user.role === 'ADMIN') {
    posts = await postService.getAllPosts();
  } else {
    posts = await postService.getPostsByUserId(req.session.user.id);
  }
  
  res.render('member/dashboard', { title: 'Dashboard', user: req.session.user, posts: posts });
});

/* Create Post Routes */
router.get('/posts/new', postController.createPostForm);
router.post('/posts', postController.createPost);

/* Edit & Update Routes (Protected by canManagePost) */
router.get('/posts/:id/edit', canManagePost, postController.editPostForm);
router.post('/posts/:id/update', canManagePost, postController.updatePost);

/* Delete Route (Protected by canManagePost) */
router.post('/posts/:id/delete', canManagePost, postController.deletePost);

module.exports = router;