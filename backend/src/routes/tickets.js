const router = require('express').Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/auth');

// POST /api/tickets — el cliente abre un reclamo
router.post('/', protect, async (req, res) => {
  const { requestId, type, subject, description } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ message: 'Asunto y descripción son requeridos' });
  }
  try {
    const ticket = await Ticket.create({
      user: req.user._id,
      request: requestId || null,
      type: type || 'service',
      subject,
      description,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tickets/mine — reclamos del usuario
router.get('/mine', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
