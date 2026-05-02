const router = require('express').Router();
const { registerUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.get('/me', protect, getMe);

module.exports = router;
