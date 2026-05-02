const User = require('../models/User');
const Request = require('../models/Request');
const ServiceCategory = require('../models/ServiceCategory');
const Ticket = require('../models/Ticket');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers, totalWorkers, totalClients,
      totalRequests, completedRequests,
      openTickets, pendingVerifications,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['client', 'worker'] } }),
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'client' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'completed' }),
      Ticket.countDocuments({ status: 'open' }),
      User.countDocuments({ 'workerInfo.verification.status': 'pending' }),
    ]);

    const revenue = await Request.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.commissionAmount' } } },
    ]);

    res.json({
      totalUsers,
      totalWorkers,
      totalClients,
      totalRequests,
      completedRequests,
      openTickets,
      pendingVerifications,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  try {
    const users = await User.find(filter)
      .select('-firebaseUid')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/verifications
const getPendingVerifications = async (req, res) => {
  try {
    const workers = await User.find({ 'workerInfo.verification.status': 'pending' })
      .select('name email photo workerInfo.verification createdAt');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/verifications/:userId/approve
const approveVerification = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        'workerInfo.verification.status': 'verified',
        'workerInfo.verification.reviewedAt': new Date(),
        'workerInfo.verification.reviewedBy': req.user._id,
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Verificado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/verifications/:userId/reject
const rejectVerification = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        'workerInfo.verification.status': 'rejected',
        'workerInfo.verification.reviewedAt': new Date(),
        'workerInfo.verification.reviewedBy': req.user._id,
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Rechazado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUD categorías de servicios
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/tickets
const getTickets = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  try {
    const tickets = await Ticket.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/tickets/:id/respond
const respondTicket = async (req, res) => {
  const { response, status } = req.body;

  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: response,
        status: status || 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
      },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUser,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getCategories,
  createCategory,
  updateCategory,
  getTickets,
  respondTicket,
};
