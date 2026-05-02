const router = require('express').Router();
const { registerUser, getMe, switchRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.get('/me', protect, getMe);
router.put('/switch-role', protect, switchRole);

module.exports = router;
