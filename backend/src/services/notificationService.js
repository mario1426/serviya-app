const Notification = require('../models/Notification');

/**
 * Crea una notificación in-app para un usuario.
 * No interrumpe el flujo si falla.
 */
async function createNotification(userId, { title, body, url = '/', type = 'system' }) {
  try {
    await Notification.create({ user: userId, title, body, url, type });
  } catch (err) {
    console.warn('[Notification] No se pudo guardar:', err.message);
  }
}

module.exports = { createNotification };
