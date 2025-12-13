const postService = require('../services/postService');

/**
 * Get all posts by the logged-in user
 */
const getMyPosts = async (req, res) => {
    try {
        console.log('getMyPosts called, user:', req.user);
        let posts = null;
        if (req.user.role === 'USER') {
            // USER role sees only their own posts
            posts = await postService.getPostsByUserId(req.user.id);
        } else {
            // ADMIN role sees all posts
            posts = await postService.getAllPosts();
        }
        console.log('Rendering dashboard with', posts.length, 'posts');
        return res.render('member/dashboard', { posts: posts, user: req.user, title: 'Dashboard' });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to fetch posts' }
        });
    }
}

/**
 * Show form to create a new post
 */
const showCreatePostForm = (req, res) => {
    res.render('member/postForm', { post: null, user: req.user, isEdit: false, error: null });
}

/**
 * Create a new post
 */
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.render('member/postForm', {
                post: null,
                user: req.user,
                isEdit: false,
                error: 'Title and content are required'
            });
        }

        await postService.createPost({
            title,
            content,
            authorId: req.user.id
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creating post:', error);
        res.render('member/postForm', {
            post: null,
            user: req.user,
            isEdit: false,
            error: 'Failed to create post'
        });
    }
}

/**
 * Show form to edit a post
 * Permission check is handled by canEditPost middleware
 */
const showEditPostForm = async (req, res) => {
    try {
        // Post is already fetched and verified by canEditPost middleware
        const post = req.post;
        res.render('member/postForm', { post: post, user: req.user, isEdit: true, error: null });
    } catch (error) {
        console.error('Error rendering edit form:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to load edit form' },
            title: 'Error'
        });
    }
}

/**
 * Update a post
 * Permission check is handled by canEditPost middleware
 */
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            // Post is already fetched and verified by canEditPost middleware
            return res.render('member/postForm', {
                post: req.post,
                user: req.user,
                isEdit: true,
                error: 'Title and content are required'
            });
        }

        const result = await postService.updatePost(id, { title, content }, req.user.id);

        if (!result.success) {
            return res.status(403).render('error', {
                message: 'Error',
                error: { status: 403, message: result.message }
            });
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to update post' }
        });
    }
}

/**
 * Delete a post
 * Permission check is handled by canDeletePost middleware
 */
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await postService.deletePost(id, req.user.id);

        if (!result.success) {
            return res.status(403).render('error', {
                message: 'Error',
                error: { status: 403, message: result.message }
            });
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to delete post' }
        });
    }
}

module.exports = {
    getMyPosts,
    showCreatePostForm,
    createPost,
    showEditPostForm,
    updatePost,
    deletePost
};