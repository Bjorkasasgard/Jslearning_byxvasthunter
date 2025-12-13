const postService = require('../services/postService');

/**
 * Get all posts (public view - latest posts)
 */
const getAllPosts = async (req, res) => {
    try {
        const posts = await postService.getAllPosts();
        res.render('posts/index', { posts: posts, user: req.user || null });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to fetch posts' }
        });
    }
}

/**
 * Get a single post by ID (public view)
 */
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postService.getPostById(id);

        if (!post) {
            return res.status(404).render('error', {
                message: 'Not Found',
                error: { status: 404, message: 'Post not found' }
            });
        }

        res.render('posts/show', { post: post, user: req.user || null });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to fetch post' }
        });
    }
}

/**
 * Show Create Post Form
 */
const createPostForm = (req, res) => {
    res.render('posts/create', { title: 'Create New Post', user: req.user });
};

/**
 * Handle Create Post
 */
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        await postService.createPost({
            title,
            content,
            authorId: req.user.id
        });
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).render('error', { message: 'Failed to create post', error });
    }
};

/**
 * Show Edit Post Form
 */
const editPostForm = async (req, res) => {
    // req.post is already attached by canManagePost middleware
    res.render('posts/edit', { title: 'Edit Post', post: req.post, user: req.user });
};

/**
 * Handle Update Post
 */
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        
        await postService.updatePost(id, { title, content });
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).render('error', { message: 'Failed to update post', error });
    }
};

/**
 * Handle Delete Post
 */
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await postService.deletePost(id);
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).render('error', { message: 'Failed to delete post', error });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPostForm,
    createPost,
    editPostForm,
    updatePost,
    deletePost
};