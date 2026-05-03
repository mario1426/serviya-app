const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password de Google, no la contraseña normal
  },
});

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const BRAND = `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <div style="background:#1E3A8A;padding:16px 24px;border-radius:12px 12px 0 0">
      <span style="color:#E53935;font-size:22px;font-weight:bold">Servi</span>
      <span style="color:#fff;font-size:22px;font-weight:bold">Ya</span>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">
`;
const FOOTER = `
    </div>
    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px">
      © ServiYa · Si no esperabas este email, podés ignorarlo.
    </p>
  </div>
`;

/**
 * Envía un email simple. No interrumpe el flujo si falla.
 */
async function sendEmail(to, subject, html) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return; // no configurado
  try {
    await transporter.sendMail({
      from: `"ServiYa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: BRAND + html + FOOTER,
    });
  } catch (err) {
    console.warn('[Email] No se pudo enviar:', err.message);
  }
}

// ─── Templates ────────────────────────────────────────────────

function emailNewRequest(workerEmail, workerName, clientName, categoryName, requestId) {
  return sendEmail(
    workerEmail,
    `Nueva solicitud de servicio — ${categoryName}`,
    `<h2 style="color:#1E3A8A;margin-top:0">Hola ${workerName} 👋</h2>
     <p><strong>${clientName}</strong> solicita tus servicios de <strong>${categoryName}</strong>.</p>
     <a href="${BASE_URL}/worker/request/${requestId}"
        style="display:inline-block;background:#E53935;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
       Ver solicitud →
     </a>`,
  );
}

function emailRequestAccepted(clientEmail, clientName, workerName, categoryName, requestId) {
  return sendEmail(
    clientEmail,
    `Tu solicitud fue aceptada ✅`,
    `<h2 style="color:#1E3A8A;margin-top:0">¡Buenas noticias, ${clientName}!</h2>
     <p><strong>${workerName}</strong> aceptó tu solicitud de <strong>${categoryName}</strong> y está en camino.</p>
     <a href="${BASE_URL}/service/${requestId}"
        style="display:inline-block;background:#E53935;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
       Ver estado del servicio →
     </a>`,
  );
}

function emailServiceCompleted(clientEmail, clientName, workerName, finalPrice, requestId) {
  return sendEmail(
    clientEmail,
    `Servicio completado — ¡Calificá tu experiencia! ⭐`,
    `<h2 style="color:#1E3A8A;margin-top:0">Servicio finalizado, ${clientName}</h2>
     <p>El trabajo de <strong>${workerName}</strong> fue marcado como completado.</p>
     <p style="font-size:20px;font-weight:bold;color:#E53935">Total: $${(finalPrice || 0).toLocaleString('es-AR')}</p>
     <p>¿Cómo fue tu experiencia? Tu opinión ayuda a otros clientes.</p>
     <a href="${BASE_URL}/rate/${requestId}"
        style="display:inline-block;background:#E53935;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
       Calificar a ${workerName} ⭐ →
     </a>`,
  );
}

function emailNewReview(workerEmail, workerName, clientName, rating, comment) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return sendEmail(
    workerEmail,
    `Nueva reseña de ${clientName} — ${stars}`,
    `<h2 style="color:#1E3A8A;margin-top:0">Recibiste una nueva reseña, ${workerName}</h2>
     <p style="font-size:24px;color:#f59e0b">${stars}</p>
     <p><strong>${clientName}</strong> te dejó ${rating}/5 estrellas.</p>
     ${comment ? `<blockquote style="border-left:3px solid #e5e7eb;padding-left:12px;color:#374151;font-style:italic">"${comment}"</blockquote>` : ''}`,
  );
}


async function emailSupportContact({ name, email, subject, message }) {
  await sendEmail(
    process.env.EMAIL_USER,
    `[Soporte ServiYa] ${subject}`,
    `<h2 style="color:#1E3A8A">Nuevo mensaje de soporte</h2>
     <p><strong>De:</strong> ${name} (${email})</p>
     <p><strong>Asunto:</strong> ${subject}</p>
     <hr/>
     <p style="white-space:pre-line">${message}</p>`,
  );
}

module.exports = {
  sendEmail,
  emailNewRequest,
  emailRequestAccepted,
  emailServiceCompleted,
  emailNewReview,
  emailSupportContact,
};
