const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  url:     { type: String, default: '/' },
  type:    { type: String, enum: ['request', 'review', 'system', 'payment'], default: 'system' },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
