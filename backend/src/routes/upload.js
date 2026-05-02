const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');

// Multer en memoria (no guarda en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  },
});

// Subir a Cloudinary desde buffer
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// POST /api/upload/photo — foto de perfil
router.post('/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ninguna imagen' });

    const url = await uploadToCloudinary(req.file.buffer, 'serviya/profiles');

    await User.findByIdAndUpdate(req.user._id, { photo: url });

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/upload/portfolio — fotos de trabajos (máx 8)
router.post('/portfolio', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ninguna imagen' });
    if (req.user.role !== 'worker') return res.status(403).json({ message: 'Solo trabajadores' });

    const currentPhotos = req.user.workerInfo?.portfolioPhotos || [];
    if (currentPhotos.length >= 8) return res.status(400).json({ message: 'Máximo 8 fotos de portfolio' });

    const url = await uploadToCloudinary(req.file.buffer, 'serviya/portfolio');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { 'workerInfo.portfolioPhotos': url } },
      { new: true }
    );

    res.json({ url, portfolioPhotos: user.workerInfo.portfolioPhotos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/upload/portfolio — eliminar foto del portfolio
router.delete('/portfolio', protect, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL requerida' });

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { 'workerInfo.portfolioPhotos': url } }
    );

    // Eliminar de Cloudinary
    const publicId = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId).catch(() => {});

    res.json({ message: 'Foto eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/upload/request-photo — fotos adjuntas a una solicitud (máx 3)
// Se puede llamar antes de crear la solicitud para pre-subir, o después
router.post('/request-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ninguna imagen' });

    const url = await uploadToCloudinary(req.file.buffer, 'serviya/requests');
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
