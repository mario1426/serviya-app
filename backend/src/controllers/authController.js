const admin = require('../config/firebase');
const User = require('../models/User');

// POST /api/auth/register
// Crea el usuario en MongoDB después del login con Google en el frontend
const registerUser = async (req, res) => {
  const { firebaseToken, role } = req.body;

  if (!firebaseToken || !role) {
    return res.status(400).json({ message: 'Token y rol son requeridos' });
  }

  if (!['client', 'worker'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    // Si ya existe, retornarlo
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (user) {
      return res.status(200).json({ user, isNew: false });
    }

    user = await User.create({
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      photo: decoded.picture || '',
      role,
    });

    res.status(201).json({ user, isNew: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, getMe };
