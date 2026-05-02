const Request = require('../models/Request');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const { sendPushToUser } = require('../services/pushService');
const { emailNewRequest, emailRequestAccepted, emailServiceCompleted } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

// POST /api/requests
const createRequest = async (req, res) => {
  const {
    workerId, categoryId, pricingType, proposedPrice,
    isUrgent, scheduledAt, description, lat, lng, address, paymentMethod, photos,
  } = req.body;

  try {
    const category = await ServiceCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Categoria no encontrada' });

    const request = await Request.create({
      client: req.user._id,
      worker: workerId || null,
      category: categoryId,
      categorySlug: category.slug,
      pricingType,
      proposedPrice: proposedPrice || 0,
      isUrgent: isUrgent || false,
      scheduledAt: scheduledAt || null,
      description: description || '',
      clientLocation: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address,
      },
      payment: { method: paymentMethod || 'cash' },
      photos: Array.isArray(photos) ? photos.slice(0, 3) : [],
    });

    if (workerId) {
      const worker = await User.findById(workerId).select('email name');
      sendPushToUser(workerId, {
        title: 'Nueva solicitud de servicio',
        body: req.user.name + ' solicita: ' + category.name + (isUrgent ? ' URGENTE' : ''),
        url: '/worker/request/' + request._id,
      });
      if (worker) emailNewRequest(worker.email, worker.name, req.user.name, category.name, request._id);
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/my
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ client: req.user._id })
      .populate('worker', 'name photo workerInfo.stats workerInfo.verification.status')
      .populate('category', 'name icon')
      .populate('review', '_id rating')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/incoming
const getIncomingRequests = async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Solo trabajadores' });
    }

    const workerCoords = req.user.location && req.user.location.coordinates;
    const radiusKm = (req.user.workerInfo && req.user.workerInfo.serviceRadius) || 10;
    const radiusMeters = radiusKm * 1000;

    const assignedFilter = {
      worker: req.user._id,
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    };

    const openFilter = {
      worker: null,
      status: 'pending',
      categorySlug: { $in: (req.user.workerInfo && req.user.workerInfo.services) || [] },
    };

    if (workerCoords && workerCoords[0] !== 0) {
      openFilter.clientLocation = {
        $near: {
          $geometry: { type: 'Point', coordinates: workerCoords },
          $maxDistance: radiusMeters,
        },
      };
    }

    const [assigned, open] = await Promise.all([
      Request.find(assignedFilter).populate('client', 'name photo').populate('category', 'name icon'),
      Request.find(openFilter).populate('client', 'name photo').populate('category', 'name icon'),
    ]);

    const all = [...assigned, ...open].sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return b.isUrgent - a.isUrgent;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(all);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/earnings
const getWorkerEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Solo trabajadores' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const completedJobs = await Request.find({ worker: req.user._id, status: 'completed' })
      .populate('category', 'name icon')
      .sort({ completedAt: -1 });

    const thisMonth = completedJobs.filter(r => new Date(r.completedAt) >= startOfMonth);
    const lastMonth = completedJobs.filter(r => {
      const d = new Date(r.completedAt);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });

    const sum = arr => arr.reduce((acc, r) => acc + ((r.payment && r.payment.workerAmount) || 0), 0);

    res.json({
      thisMonthTotal: sum(thisMonth),
      thisMonthJobs: thisMonth.length,
      lastMonthTotal: sum(lastMonth),
      lastMonthJobs: lastMonth.length,
      allTimeTotal: sum(completedJobs),
      recentJobs: completedJobs.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requests/:id
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('client', 'name photo phone')
      .populate('worker', 'name photo phone workerInfo.stats workerInfo.verification.status')
      .populate('category', 'name icon priceMin priceMax')
      .populate('review', '_id rating');

    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const userId = req.user._id.toString();
    if (
      request.client._id.toString() !== userId &&
      (request.worker && request.worker._id.toString() !== userId) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/:id/accept
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'La solicitud ya no esta pendiente' });

    request.worker = req.user._id;
    request.status = 'accepted';
    await request.save();

    createNotification(request.client, { title: 'Tu solicitud fue aceptada', body: req.user.name + ' aceptó tu pedido y pronto llegará.', url: '/service/' + request._id, type: 'request' });
    sendPushToUser(request.client, {
      title: 'Tu solicitud fue aceptada',
      body: req.user.name + ' acepto tu pedido y pronto llegara.',
      url: '/service/' + request._id,
    });

    const client = await User.findById(request.client).select('email name');
    if (client) {
      const cat = await ServiceCategory.findById(request.category).select('name');
      emailRequestAccepted(client.email, client.name, req.user.name, cat ? cat.name : '', request._id);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.worker && request.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const wasAccepted = request.status === 'accepted';
    request.status = 'rejected';
    request.cancelledBy = 'worker';
    request.worker = null;
    await request.save();

    // Penalizar al trabajador si ya habia aceptado
    if (wasAccepted) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'workerInfo.stats.cancelledJobs': 1 },
      });
      // Notificar al cliente
      createNotification(request.client, {
        title: 'El profesional canceló',
        body: 'El profesional canceló el servicio. Podés buscar otro.',
        url: '/',
        type: 'request',
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/:id/start
const startRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.worker && request.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'La solicitud debe estar aceptada' });
    }

    request.status = 'in_progress';
    request.startedAt = new Date();
    await request.save();

    createNotification(request.client, { title: '🔧 El profesional llegó', body: 'El trabajo ha comenzado.', url: '/service/' + request._id, type: 'request' });
    sendPushToUser(request.client, {
      title: 'El profesional llego',
      body: 'El trabajo ha comenzado. Podes seguir el estado en la app.',
      url: '/service/' + request._id,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/:id/complete
const completeRequest = async (req, res) => {
  const { finalPrice } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.worker && request.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    if (request.status !== 'in_progress') {
      return res.status(400).json({ message: 'El servicio debe estar en curso' });
    }

    const price = finalPrice || request.proposedPrice;
    const commission = request.payment ? request.payment.commission : 0.20;
    const commissionAmount = price * commission;

    request.status = 'completed';
    request.completedAt = new Date();
    request.finalPrice = price;
    if (request.payment) {
      request.payment.commissionAmount = commissionAmount;
      request.payment.workerAmount = price - commissionAmount;
    }
    await request.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'workerInfo.stats.completedJobs': 1 },
    });

    createNotification(request.client, { title: '🎉 Servicio completado', body: 'Calificá a ' + req.user.name + ' y contá tu experiencia.', url: '/rate/' + request._id, type: 'request' });
    sendPushToUser(request.client, {
      title: 'Servicio completado',
      body: 'El trabajo finalizo. Califica a ' + req.user.name + '!',
      url: '/rate/' + request._id,
    });

    const clientUser = await User.findById(request.client).select('email name');
    if (clientUser) emailServiceCompleted(clientUser.email, clientUser.name, req.user.name, price, request._id);

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requests/:id/cancel
const cancelRequest = async (req, res) => {
  const { reason } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el cliente puede cancelar' });
    }
    if (['completed', 'cancelled'].includes(request.status)) {
      return res.status(400).json({ message: 'No se puede cancelar esta solicitud' });
    }

    const workerWasAssigned = request.worker && ['accepted', 'in_progress'].includes(request.status);
    request.status = 'cancelled';
    request.cancelReason = reason || '';
    request.cancelledBy = 'client';
    await request.save();

    // Notificar al trabajador si habia aceptado
    if (workerWasAssigned) {
      createNotification(request.worker, {
        title: 'Solicitud cancelada por el cliente',
        body: 'El cliente canceló el servicio.',
        url: '/',
        type: 'request',
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getWorkerEarnings,
  getRequestById,
  acceptRequest,
  rejectRequest,
  startRequest,
  completeRequest,
  cancelRequest,
};
