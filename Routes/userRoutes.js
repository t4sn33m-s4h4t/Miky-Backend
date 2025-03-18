const express = require('express');
const upload = require('../middleWare/multer')
const router = express.Router();
const isAuthenticated = require('../middleWare/isAuthenticated')
const {
    signup,
    verifyAccount,
    resendOTP,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../Controllers/authController');
const { getProfile, editProfile, suggestedUser, followUnfollow, getMe } = require('../Controllers/userController');

// Auth Routes
router.post('/signup', signup);
router.post('/verify', isAuthenticated, verifyAccount);
router.post('/resend-otp', isAuthenticated, resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forget-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', isAuthenticated, changePassword);

// User Routes
router.get("/profile/:id", getProfile)
router.get("/suggested-user", isAuthenticated, suggestedUser)
router.get("/me", isAuthenticated, getMe)
router.post("/follow-unfollow/:id", isAuthenticated, followUnfollow)
router.post(
    "/edit-profile/",
    isAuthenticated,
    upload.single("profilePicture"),
    editProfile
)


module.exports = router;