const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/push/vapid-public-key  — devuelve la clave pública VAPID al frontend
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe  — guarda o actualiza la suscripción del dispositivo
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Suscripción inválida' });
    }

    // Upsert: si ya existe ese endpoint lo reemplaza, sino lo agrega
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushSubscriptions: { endpoint } },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { pushSubscriptions: { endpoint, keys } },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/push/unsubscribe  — elimina la suscripción del dispositivo
router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { pushSubscriptions: { endpoint } },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
