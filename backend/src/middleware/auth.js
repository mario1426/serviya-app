const admin = require('../config/firebase');
const User = require('../models/User');

// Verifica el token de Firebase y adjunta el usuario de MongoDB al request
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: token faltante' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Solo para admins
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }
  next();
};

// Solo para trabajadores
const workerOnly = (req, res, next) => {
  if (req.user?.role !== 'worker') {
    return res.status(403).json({ message: 'Acceso denegado: solo trabajadores' });
  }
  next();
};

module.exports = { protect, adminOnly, workerOnly };
