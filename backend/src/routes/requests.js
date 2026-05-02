const router = require('express').Router();
const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getWorkerEarnings,
  getRequestById,
  acceptRequest,
  rejectRequest,
  startRequest,
  completeRequest,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/incoming', protect, getIncomingRequests);
router.get('/earnings', protect, getWorkerEarnings);
router.get('/:id', protect, getRequestById);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/start', protect, startRequest);
router.put('/:id/complete', protect, completeRequest);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
