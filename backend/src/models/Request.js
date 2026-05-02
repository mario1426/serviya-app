const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  categorySlug: { type: String, required: true },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },

  pricingType: {
    type: String,
    enum: ['fixed', 'quote'],
    default: 'fixed',
  },
  proposedPrice: { type: Number, default: 0 },
  finalPrice: { type: Number, default: 0 },
  isUrgent: { type: Boolean, default: false },

  scheduledAt: { type: Date, default: null }, // null = inmediato
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },

  description: { type: String, default: '' },

  clientLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    address: String,
  },

  payment: {
    method: { type: String, enum: ['cash', 'mercadopago'], default: 'cash' },
    status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    mpPaymentId: { type: String, default: '' },
    mpPreferenceId: { type: String, default: '' },
    commission: { type: Number, default: 0.20 },
    commissionAmount: { type: Number, default: 0 },
    workerAmount: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
  },

  photos: [{ type: String }],   // URLs Cloudinary adjuntas al pedido
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  cancelReason: { type: String, default: '' },
  cancelledBy: { type: String, enum: ['client', 'worker', null], default: null },
}, {
  timestamps: true,
});

requestSchema.index({ client: 1, status: 1 });
requestSchema.index({ worker: 1, status: 1 });
requestSchema.index({ clientLocation: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);
