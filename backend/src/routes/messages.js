const router = require('express').Router();
const Message = require('../models/Message');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');

// GET /api/requests/:requestId/messages
router.get('/:requestId/messages', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const userId = req.user._id.toString();
    if (
      request.client.toString() !== userId &&
      request.worker?.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const messages = await Message.find({ request: req.params.requestId })
      .populate('sender', 'name photo')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
