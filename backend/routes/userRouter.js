import express from 'express';

import {login, register, logout, updateProfile, createPost, getUserProfile, getExplorePosts, likePost, getPostById, getPostComments, addComment, deletePost, followUser, unfollowUser, getFollowers, getFollowing, submitFeedback, getUserCount, getTrendingPosts} from '../controllers/userController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { multipleUpload, singleUpload } from '../middlewares/multer.js';


const router = express.Router();

router.post('/login', login);
router.post('/register', singleUpload, register);
router.put('/updateProfile', isAuthenticated, singleUpload, updateProfile);
router.get('/logout', logout);
router.post("/post/create", isAuthenticated, multipleUpload, createPost);
router.get("/user/:id",isAuthenticated, getUserProfile);
router.get("/explore", isAuthenticated, getExplorePosts);
router.post("/post/:postId/like", isAuthenticated, likePost);

router.get("/post/:postId", isAuthenticated, getPostById);
router.get("/post/:postId/comments", isAuthenticated, getPostComments);
router.post("/post/:postId/comment", isAuthenticated, addComment);
router.delete("/post/:postId", isAuthenticated, deletePost);

router.post("/follow/:id", isAuthenticated, followUser);
router.post("/unfollow/:id", isAuthenticated, unfollowUser);

router.get("/followers/:id", isAuthenticated, getFollowers);
router.get("/following/:id", isAuthenticated, getFollowing);
router.post("/feedback", isAuthenticated, submitFeedback);

router.get('/user-count', getUserCount);
router.get('/trending-posts', getTrendingPosts);




export default router