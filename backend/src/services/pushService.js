const webPush = require('web-push');
const User = require('../models/User');

webPush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

/**
 * Envía una notificación push a un usuario por su _id de MongoDB.
 * Limpia automáticamente las suscripciones expiradas.
 *
 * @param {string|ObjectId} userId
 * @param {{ title: string, body: string, url?: string, icon?: string }} payload
 */
async function sendPushToUser(userId, payload) {
  try {
    const user = await User.findById(userId).select('pushSubscriptions');
    if (!user || !user.pushSubscriptions?.length) return;

    const data = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: payload.icon || '/icon-192.png',
    });

    const results = await Promise.allSettled(
      user.pushSubscriptions.map(sub =>
        webPush.sendNotification(sub, data),
      ),
    );

    // Eliminar suscripciones inválidas (410 Gone / 404)
    const invalid = new Set();
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const status = r.reason?.statusCode;
        if (status === 410 || status === 404) {
          invalid.add(user.pushSubscriptions[i].endpoint);
        }
      }
    });

    if (invalid.size > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint: { $in: [...invalid] } } },
      });
    }
  } catch (err) {
    console.error('[Push] Error al enviar notificación:', err.message);
  }
}

module.exports = { sendPushToUser };
