const router = require('express').Router();
const {
  getNearbyWorkers,
  getWorkerProfile,
  updateProfile,
  updateWorkerProfile,
  toggleAvailability,
  updateLocation,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/workers', protect, getNearbyWorkers);
router.get('/workers/:id', protect, getWorkerProfile);
router.put('/profile', protect, updateProfile);
router.put('/worker-profile', protect, updateWorkerProfile);
router.put('/availability', protect, toggleAvailability);
router.put('/location', protect, updateLocation);

module.exports = router;
