import express from 'express';
import upload from '../Middleware/uploadsMiddleware.js'; 
import { createPost, getAllPosts, getPostById, getUserPosts, deletePosts, updateComments, toggleLike, deletePostRating, getPostsLikes } from '../Controllers/postController.js'; 
import { verifyToken } from '../Middleware/authMiddleware.js';
const router = express.Router();

// Маршрут для создания поста
router.post('/posts',verifyToken, upload.single('image'), createPost);
router.get('/posts', getAllPosts);
router.get('/user/posts', verifyToken, getUserPosts);
router.get('/posts/:id', getPostById);
router.delete('/posts/:id', verifyToken, deletePosts);
router.post('/posts/:id/comments', verifyToken, updateComments);
router.post('/posts/:id/toggle-like', verifyToken, toggleLike);
router.delete('/post-ratings/:id', verifyToken, deletePostRating)
router.get('/posts/:id/likes', verifyToken, getPostsLikes)

export default router;
