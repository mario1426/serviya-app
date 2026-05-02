const router = require('express').Router();
const {
  getStats,
  getUsers,
  toggleUser,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getCategories,
  createCategory,
  updateCategory,
  getTickets,
  respondTicket,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:userId/approve', approveVerification);
router.put('/verifications/:userId/reject', rejectVerification);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.get('/tickets', getTickets);
router.put('/tickets/:id/respond', respondTicket);

module.exports = router;
