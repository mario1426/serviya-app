const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
  type: { type: String, enum: ['payment', 'user', 'service', 'other'], required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open' },
  adminResponse: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Ticket', ticketSchema);
