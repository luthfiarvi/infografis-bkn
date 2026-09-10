const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated, redirectIfAuthenticated } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

// Guest routes
router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', redirectIfAuthenticated, authController.postLogin);
router.get('/register', redirectIfAuthenticated, authController.getRegister);
router.post('/register', redirectIfAuthenticated, uploadAvatar.single('avatar'), authController.postRegister);

// Authenticated routes
router.get('/logout', ensureAuthenticated, authController.getLogout);
router.get('/profile', ensureAuthenticated, authController.getProfile);
router.post('/profile', ensureAuthenticated, uploadAvatar.single('avatar'), authController.postProfile);

module.exports = router;
