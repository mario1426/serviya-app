const User = require('../models/User');

// GET /api/users/workers?lat=&lng=&category=&radius=10000
const getNearbyWorkers = async (req, res) => {
  const { lat, lng, category, radius = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Se requieren coordenadas lat y lng' });
  }

  const filter = {
    role: 'worker',
    'workerInfo.isAvailable': true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius),
      },
    },
  };

  if (category) {
    filter['workerInfo.services'] = category;
  }

  try {
    const workers = await User.find(filter)
      .select('-firebaseUid -workerInfo.paymentMethod -workerInfo.verification.dniUrl -workerInfo.verification.selfieUrl')
      .limit(50);

    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/workers/:id
const getWorkerProfile = async (req, res) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: 'worker' })
      .select('-firebaseUid -workerInfo.paymentMethod -workerInfo.verification.dniUrl -workerInfo.verification.selfieUrl');

    if (!worker) return res.status(404).json({ message: 'Trabajador no encontrado' });

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone, address, coordinates } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (address || coordinates) {
    updates.location = {
      type: 'Point',
      coordinates: coordinates || req.user.location?.coordinates || [0, 0],
      address: address || req.user.location?.address || '',
    };
  }

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-firebaseUid');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/worker-profile
const updateWorkerProfile = async (req, res) => {
  const { bio, services, customServices, zone, priceMin, priceMax, cbu, alias, serviceRadius } = req.body;

  const updates = {};
  if (bio !== undefined) updates['workerInfo.bio'] = bio;
  if (services) updates['workerInfo.services'] = services;
  if (customServices !== undefined) updates['workerInfo.customServices'] = customServices;
  if (zone) updates['workerInfo.zone'] = zone;
  if (priceMin !== undefined) updates['workerInfo.priceMin'] = priceMin;
  if (priceMax !== undefined) updates['workerInfo.priceMax'] = priceMax;
  if (cbu !== undefined) updates['workerInfo.paymentMethod.cbu'] = cbu;
  if (alias !== undefined) updates['workerInfo.paymentMethod.alias'] = alias;
  if (serviceRadius !== undefined) updates['workerInfo.serviceRadius'] = Math.min(Math.max(parseInt(serviceRadius) || 10, 1), 100);

  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Solo trabajadores pueden actualizar este perfil' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-firebaseUid');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/availability
const toggleAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Solo trabajadores' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'workerInfo.isAvailable': !req.user.workerInfo.isAvailable },
      { new: true }
    ).select('-firebaseUid');
    res.json({ isAvailable: user.workerInfo.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/location
const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ message: 'Coordenadas requeridas' });

  try {
    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    });
    res.json({ message: 'Ubicación actualizada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNearbyWorkers,
  getWorkerProfile,
  updateProfile,
  updateWorkerProfile,
  toggleAvailability,
  updateLocation,
};
