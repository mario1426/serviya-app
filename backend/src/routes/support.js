const router = require('express').Router();
const { emailSupportContact } = require('../services/emailService');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }
  try {
    await emailSupportContact({ name, email, subject, message });
    res.json({ message: 'Mensaje enviado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al enviar el mensaje' });
  }
});

module.exports = router;
