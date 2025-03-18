const express = require('express'); 
const router = express.Router();

const isAuthenticated = require('../middleWare/isAuthenticated');
const upload = require('../middleWare/multer');
const { createPost, getAllPosts, getUserPosts, saveOrUnsavePost, deletePost, likeOrDislikePost, addComment } = require('../Controllers/postController');
 
// routes 
router.post('/create-post', isAuthenticated, upload.single("image"), createPost);
 
router.get('/all', getAllPosts);

router.get('/user-post/:id', getUserPosts);
 
router.post('/save-unsave-post/:id', isAuthenticated, saveOrUnsavePost);

router.delete('/delete-post/:id', isAuthenticated, deletePost);

router.post('/like-dislike/:id', isAuthenticated, likeOrDislikePost);

router.post('/comment/:id', isAuthenticated, addComment);

module.exports = router;