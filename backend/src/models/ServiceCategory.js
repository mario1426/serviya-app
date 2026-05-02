const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: '' },      // nombre del ícono o URL
  description: { type: String, default: '' },
  priceMin: { type: Number, required: true },
  priceMax: { type: Number, required: true },
  urgentSurcharge: { type: Number, default: 0.20 }, // 20% extra por urgente
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },       // orden de aparición
}, {
  timestamps: true,
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
