const router = require('express').Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications — últimas 30, con conteo de no leídas
router.get('/', protect, async (req, res) => {
  try {
    const [notifications, unread] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all — marca todas como leídas
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read — marca una como leída
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
