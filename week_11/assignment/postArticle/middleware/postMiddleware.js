const postService = require('../services/postService');

/**
 * Middleware to check if user has permission to manage (edit/delete) a post
 * Users can only manage their own posts
 * ADMIN can manage any post
 */
const canManagePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).render('error', {
                message: 'Bad Request',
                error: { status: 400, message: 'Post ID is required' }
            });
        }

        // Get the post
        const post = await postService.getPostById(id);

        if (!post) {
            return res.status(404).render('error', {
                message: 'Not Found',
                error: { status: 404, message: 'Post not found' }
            });
        }

        // Check if user owns the post or is ADMIN
        if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).render('error', {
                message: 'Access Denied',
                error: { status: 403, message: 'You do not have permission to manage this post. You can only manage your own posts.' }
            });
        }

        // Attach post to request for use in controller
        req.post = post;
        next();
    } catch (error) {
        console.error('Error in canManagePost middleware:', error);
        res.status(500).render('error', {
            message: 'Error',
            error: { status: 500, message: 'Failed to verify post permissions' }
        });
    }
};

module.exports = {
    canManagePost
};