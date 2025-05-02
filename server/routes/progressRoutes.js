const express = require('express');
const { saveProgress, getProgress } = require('../controllers/progressController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/progress/save', auth, saveProgress);
router.get('/progress/:videoId', auth, getProgress);

module.exports = router;
