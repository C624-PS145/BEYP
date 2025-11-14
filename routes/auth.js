const express = require('express');
const router = express.Router();
const { loginUser, updateCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.put('/update-credentials', protect, updateCredentials);

module.exports = router;