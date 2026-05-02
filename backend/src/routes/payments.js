const router = require('express').Router();
const { createPreference, handleWebhook, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-preference', protect, createPreference);
router.post('/webhook', handleWebhook);         // MP llama a este sin auth
router.get('/status/:requestId', protect, getPaymentStatus);

module.exports = router;
