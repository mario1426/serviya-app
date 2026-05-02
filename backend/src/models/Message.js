const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  readAt: { type: Date, default: null },
}, {
  timestamps: true,
});

messageSchema.index({ request: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
