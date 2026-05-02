const Review = require('../models/Review');
const Request = require('../models/Request');
const User = require('../models/User');
const { emailNewReview } = require('../services/emailService');

// POST /api/reviews
const createReview = async (req, res) => {
  const { requestId, rating, comment } = req.body;

  if (!requestId || !rating) {
    return res.status(400).json({ message: 'requestId y rating son requeridos' });
  }

  try {
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Solo el cliente puede calificar' });
    }
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Solo se pueden calificar servicios completados' });
    }
    if (request.review) {
      return res.status(400).json({ message: 'Ya calificaste este servicio' });
    }

    const review = await Review.create({
      request: requestId,
      client: req.user._id,
      worker: request.worker,
      rating,
      comment: comment || '',
    });

    // Vincular review al request
    request.review = review._id;
    await request.save();

    // Recalcular rating promedio del trabajador
    const reviews = await Review.find({ worker: request.worker });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(request.worker, {
      'workerInfo.stats.avgRating': Math.round(avgRating * 10) / 10,
      'workerInfo.stats.totalReviews': reviews.length,
    });

    // Email al trabajador con la nueva reseña
    const worker = await User.findById(request.worker).select('email name');
    if (worker) emailNewReview(worker.email, worker.name, req.user.name, rating, comment);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/worker/:workerId
const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('client', 'name photo')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getWorkerReviews };
