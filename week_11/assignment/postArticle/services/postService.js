const prisma = require('../prisma/client');

/**
 * Get all posts with author information, ordered by latest first
 */
const getAllPosts = async () => {
    const posts = await prisma.post.findMany({
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            comments: {
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return posts;
}

/**
 * Get a single post by ID with author and comments
 */
const getPostById = async (postId) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            comments: {
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });
    return post;
}

/**
 * Get all posts by a specific user
 */
const getPostsByUserId = async (userId) => {
    const posts = await prisma.post.findMany({
        where: { authorId: userId },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            comments: {
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return posts;
}

/**
 * Create a new post
 */
const createPost = async (postData) => {
    const post = await prisma.post.create({
        data: {
            title: postData.title,
            content: postData.content,
            authorId: postData.authorId
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
    return post;
}

/**
 * Update a post (only if user owns it)
 */
const updatePost = async (postId, postData, userId) => {
    // First check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!existingPost) {
        return { success: false, message: 'Post not found' };
    }

    if (existingPost.authorId !== userId) {
        return { success: false, message: 'You do not have permission to edit this post' };
    }

    const post = await prisma.post.update({
        where: { id: postId },
        data: {
            title: postData.title,
            content: postData.content
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    return { success: true, post };
}

/**
 * Delete a post (only if user owns it)
 */
const deletePost = async (postId, userId) => {
    // First check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!existingPost) {
        return { success: false, message: 'Post not found' };
    }

    if (existingPost.authorId !== userId) {
        return { success: false, message: 'You do not have permission to delete this post' };
    }

    await prisma.post.delete({
        where: { id: postId }
    });

    return { success: true };
}

module.exports = {
    getAllPosts,
    getPostById,
    getPostsByUserId,
    createPost,
    updatePost,
    deletePost
};