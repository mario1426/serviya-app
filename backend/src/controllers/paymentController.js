const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Request = require('../models/Request');

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// POST /api/payments/create-preference
const createPreference = async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await Request.findById(requestId)
      .populate('category', 'name')
      .populate('worker', 'name');

    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const preferenceClient = new Preference(mpClient);
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: requestId,
            title: `ServiYa - ${request.category.name}`,
            description: `Servicio con ${request.worker?.name || 'trabajador'}`,
            quantity: 1,
            unit_price: request.finalPrice || request.proposedPrice,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.CLIENT_URL}/payment/success`,
          failure: `${process.env.CLIENT_URL}/payment/failure`,
          pending: `${process.env.CLIENT_URL}/payment/pending`,
        },
        auto_return: 'approved',
        external_reference: requestId,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
      },
    });

    // Guardar preferenceId en el request
    await Request.findByIdAndUpdate(requestId, {
      'payment.mpPreferenceId': preference.id,
    });

    res.json({ preferenceId: preference.id, initPoint: preference.init_point });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/payments/webhook  (Mercado Pago notifica el pago)
const handleWebhook = async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    try {
      const paymentClient = new Payment(mpClient);
      const payment = await paymentClient.get({ id: data.id });

      if (payment.status === 'approved') {
        const requestId = payment.external_reference;
        await Request.findByIdAndUpdate(requestId, {
          'payment.status': 'paid',
          'payment.mpPaymentId': String(payment.id),
          'payment.paidAt': new Date(),
        });
      }
    } catch (error) {
      console.error('Webhook error:', error.message);
    }
  }

  res.sendStatus(200);
};

// GET /api/payments/status/:requestId
const getPaymentStatus = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId).select('payment finalPrice');
    if (!request) return res.status(404).json({ message: 'No encontrado' });
    res.json(request.payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPreference, handleWebhook, getPaymentStatus };
