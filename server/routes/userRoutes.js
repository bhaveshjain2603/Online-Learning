const express = require('express');
const { signup, login, getProfile, logout } = require('../controllers/userController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.post('/logout', auth, logout);

module.exports = router;